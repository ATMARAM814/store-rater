const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, address, role = 'USER', store_name, gstin, store_address } = req.body;
    const assignedRole = role === 'STORE_OWNER' ? 'STORE_OWNER' : 'USER';
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check if email already exists in users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .ilike('email', cleanEmail)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    if (assignedRole === 'STORE_OWNER') {
      if (!store_name || !gstin) {
        return res.status(400).json({ error: 'Store Name and GSTIN are required for Store Owner registration.' });
      }

      // Check if store name or email already exists in stores
      const { data: existingStores } = await supabase
        .from('stores')
        .select('id, name, email')
        .or(`name.eq."${store_name}",email.eq."${email}"`);

      if (existingStores && existingStores.length > 0) {
        return res.status(400).json({ error: 'A store with this name or email already exists.' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const finalUserAddress = address || store_address;
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          address: finalUserAddress,
          role: assignedRole,
        },
      ])
      .select('id, name, email, role, address')
      .single();

    if (userError) throw userError;

    let createdStore = null;
    if (assignedRole === 'STORE_OWNER') {
      const cleanGstin = gstin.trim().toUpperCase();
      const finalStoreAddress = `${store_address || address} (GSTIN: ${cleanGstin})`;

      // Try insert with gstin field first
      let storeInsert = await supabase
        .from('stores')
        .insert([
          {
            name: store_name,
            email,
            address: finalStoreAddress,
            owner_id: user.id,
            gstin: cleanGstin,
          },
        ])
        .select()
        .single();

      if (storeInsert.error && storeInsert.error.message?.includes('gstin')) {
        // Fallback without gstin column
        storeInsert = await supabase
          .from('stores')
          .insert([
            {
              name: store_name,
              email,
              address: finalStoreAddress,
              owner_id: user.id,
            },
          ])
          .select()
          .single();
      }

      if (storeInsert.error) {
        // Rollback user if store creation failed
        await supabase.from('users').delete().eq('id', user.id);
        throw storeInsert.error;
      }

      createdStore = storeInsert.data;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token, store: createdStore });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT with short, secure expiration (2h default, 8h with rememberMe)
    const { rememberMe } = req.body;
    const tokenExpiresIn = rememberMe ? '8h' : '2h';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiresIn }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
      token,
      expiresIn: tokenExpiresIn,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/auth/me — Validate token & fetch active authenticated user profile
const getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, address, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Session expired or user not found.' });
    }

    let store = null;
    if (user.role === 'STORE_OWNER') {
      let { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!storeData) {
        const { data: storeByEmail } = await supabase
          .from('stores')
          .select('*')
          .eq('email', user.email)
          .single();
        if (storeByEmail) {
          storeData = storeByEmail;
          if (!storeByEmail.owner_id) {
            await supabase.from('stores').update({ owner_id: user.id }).eq('id', storeByEmail.id);
          }
        }
      }

      if (storeData) {
        // Fetch ratings to compute average dynamically
        const { data: ratings } = await supabase
          .from('ratings')
          .select('rating')
          .eq('store_id', storeData.id);

        const avgRating =
          ratings && ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
            : null;

        // Parse GSTIN from address if not explicit in table column
        let parsedGstin = storeData.gstin || '';
        let cleanAddress = storeData.address || '';
        if (storeData.address && storeData.address.includes('(GSTIN:')) {
          const match = storeData.address.match(/\(GSTIN:\s*([^)]+)\)/i);
          if (match) {
            parsedGstin = match[1].trim();
            cleanAddress = storeData.address.replace(/\(GSTIN:\s*[^)]+\)/i, '').trim();
          }
        }

        store = {
          ...storeData,
          gstin: parsedGstin,
          cleanAddress,
          rating: avgRating ? parseFloat(avgRating) : null,
          totalRatings: ratings ? ratings.length : 0,
        };
      }
    }

    res.json({ user, store });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// PUT /api/auth/profile — Update user and store details directly in Supabase
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, address, store_name, gstin, store_address } = req.body;

    if (!name || name.trim().length < 20 || name.trim().length > 60) {
      return res.status(400).json({ error: 'Name must be between 20 and 60 characters.' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!address || address.trim().length < 20 || address.trim().length > 400) {
      return res.status(400).json({ error: 'Address must be between 20 and 400 characters.' });
    }

    // Check if email changed and if it is taken by another user
    const { data: emailConflict } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim())
      .neq('id', userId);

    if (emailConflict && emailConflict.length > 0) {
      return res.status(400).json({ error: 'This email is already in use by another account.' });
    }

    // Update in Supabase users table
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, name, email, role, address')
      .single();

    if (userError) throw userError;

    // If store owner, also update store details in Supabase
    let updatedStore = null;
    if (req.user.role === 'STORE_OWNER') {
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', userId)
        .single();

      if (store) {
        const storeUpdate = {};
        if (store_name && store_name.trim().length >= 20) {
          storeUpdate.name = store_name.trim();
        }
        if (email) {
          storeUpdate.email = email.trim();
        }
        if (store_address) {
          const cleanGstin = gstin ? gstin.trim().toUpperCase() : null;
          storeUpdate.address = cleanGstin
            ? `${store_address.trim()} (GSTIN: ${cleanGstin})`
            : store_address.trim();
          if (cleanGstin) {
            storeUpdate.gstin = cleanGstin;
          }
        }

        if (Object.keys(storeUpdate).length > 0) {
          let sRes = await supabase
            .from('stores')
            .update(storeUpdate)
            .eq('id', store.id)
            .select()
            .single();

          if (sRes.error && sRes.error.message?.includes('gstin')) {
            delete storeUpdate.gstin;
            sRes = await supabase
              .from('stores')
              .update(storeUpdate)
              .eq('id', store.id)
              .select()
              .single();
          }

          if (sRes.data) {
            let parsedGstin = sRes.data.gstin || '';
            let cleanAddress = sRes.data.address || '';
            if (sRes.data.address && sRes.data.address.includes('(GSTIN:')) {
              const match = sRes.data.address.match(/\(GSTIN:\s*([^)]+)\)/i);
              if (match) {
                parsedGstin = match[1].trim();
                cleanAddress = sRes.data.address.replace(/\(GSTIN:\s*[^)]+\)/i, '').trim();
              }
            }
            updatedStore = {
              ...sRes.data,
              gstin: parsedGstin,
              cleanAddress,
            };
          }
        }
      }
    }

    res.json({
      message: 'Account details updated successfully.',
      user: updatedUser,
      store: updatedStore,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// PUT /api/auth/password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user
    const { data: user } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { signup, login, getMe, updatePassword, updateProfile };

