const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

// GET /api/users — Admin: list all users with filters and sorting
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    let query = supabase
      .from('users')
      .select('id, name, email, address, role, created_at')
      .neq('role', 'ADMIN');

    // Filters
    if (name) query = query.ilike('name', `%${name}%`);
    if (email) query = query.ilike('email', `%${email}%`);
    if (address) query = query.ilike('address', `%${address}%`);
    if (role && role !== 'ADMIN') query = query.eq('role', role);

    // Sorting
    const validSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    if (sortBy && validSortFields.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder !== 'desc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/users/:id — Admin: get user details (with rating if store owner)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, address, role, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // If user is a store owner, fetch their store and its rating
    if (user.role === 'STORE_OWNER') {
      const { data: store } = await supabase
        .from('stores')
        .select('id, name, email, address')
        .eq('owner_id', user.id)
        .single();

      if (store) {
        const { data: ratings } = await supabase
          .from('ratings')
          .select('rating')
          .eq('store_id', store.id);

        const avgRating =
          ratings && ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
            : null;

        user.store = store;
        user.storeRating = avgRating ? parseFloat(avgRating) : null;
        user.totalStoreRatings = ratings ? ratings.length : 0;
      }
    }

    // If user is a normal shopper, fetch total reviews submitted
    if (user.role === 'USER') {
      const { data: userRatings } = await supabase
        .from('ratings')
        .select('id, rating, store_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      user.totalReviews = userRatings ? userRatings.length : 0;
    }

    res.json(user);
  } catch (err) {
    console.error('Get user by id error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/users — Admin: create a new user (any role)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'USER', store_name, gstin, store_address } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .ilike('email', cleanEmail)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    if (role === 'STORE_OWNER') {
      if (!store_name || !gstin) {
        return res.status(400).json({ error: 'Store Name and GSTIN are required when creating a Store Owner account.' });
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

    const hashedPassword = await bcrypt.hash(password, 12);
    const finalAddress = address || store_address;

    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, address: finalAddress, role }])
      .select('id, name, email, address, role, created_at')
      .single();

    if (error) throw error;

    if (role === 'STORE_OWNER') {
      const cleanGstin = gstin.trim().toUpperCase();
      const finalStoreAddress = `${store_address || address} (GSTIN: ${cleanGstin})`;

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
        await supabase.from('users').delete().eq('id', user.id);
        throw storeInsert.error;
      }
    }

    res.status(201).json(user);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getUsers, getUserById, createUser };
