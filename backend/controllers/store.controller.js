const supabase = require('../config/supabase');
const reviewStore = require('../services/reviewStore');

// GET /api/stores — List stores with average rating + user's rating
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy, sortOrder } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('stores')
      .select('id, name, email, address, owner_id, created_at');

    // Filters
    if (name) query = query.ilike('name', `%${name}%`);
    if (email) query = query.ilike('email', `%${email}%`);
    if (address) query = query.ilike('address', `%${address}%`);

    // Sorting
    const validSortFields = ['name', 'email', 'address', 'created_at'];
    if (sortBy && validSortFields.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder !== 'desc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: stores, error } = await query;
    if (error) throw error;

    // Fetch all ratings for these stores
    const storeIds = stores.map((s) => s.id);

    const { data: allRatings } = await supabase
      .from('ratings')
      .select('store_id, rating, user_id, created_at, updated_at')
      .in('store_id', storeIds.length > 0 ? storeIds : ['00000000-0000-0000-0000-000000000000']);

    // Compute average rating and user's rating for each store
    const storesWithRatings = stores.map((store) => {
      const storeRatings = (allRatings || []).filter((r) => r.store_id === store.id);
      const avgRating =
        storeRatings.length > 0
          ? parseFloat(
              (storeRatings.reduce((sum, r) => sum + r.rating, 0) / storeRatings.length).toFixed(2)
            )
          : null;
      const userRating = storeRatings.find((r) => r.user_id === userId);
      const userReview = userRating ? reviewStore.getReview(userId, store.id) : null;

      return {
        ...store,
        overallRating: avgRating,
        userRating: userRating ? userRating.rating : null,
        userExperience: userReview ? userReview.experience : '',
        ratedAt: userRating ? (userRating.updated_at || userRating.created_at) : null,
        totalRatings: storeRatings.length,
      };
    });

    res.json(storesWithRatings);
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/stores — Admin: create a new store
const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Check if store email already exists
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('email', email)
      .single();

    if (existingStore) {
      return res.status(400).json({ error: 'A store with this email already exists.' });
    }

    // If owner_id provided, verify the user exists and is a STORE_OWNER
    if (owner_id) {
      const { data: owner } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', owner_id)
        .single();

      if (!owner) {
        return res.status(400).json({ error: 'Owner user not found.' });
      }
      if (owner.role !== 'STORE_OWNER') {
        return res.status(400).json({ error: 'Selected user is not a Store Owner.' });
      }

      // Check if owner already has a store
      const { data: existingOwnerStore } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', owner_id)
        .single();

      if (existingOwnerStore) {
        return res.status(400).json({ error: 'This store owner already has a store assigned.' });
      }
    }

    const { data: store, error } = await supabase
      .from('stores')
      .insert([{ name, email, address, owner_id: owner_id || null }])
      .select('id, name, email, address, owner_id, created_at')
      .single();

    if (error) throw error;

    res.status(201).json(store);
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/stores/:id — Get store details with role-secured audit trail
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;

    const { data: store, error } = await supabase
      .from('stores')
      .select('id, name, email, address, owner_id, created_at')
      .eq('id', id)
      .single();

    if (error || !store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    // Fetch store owner details
    let owner = null;
    if (store.owner_id) {
      const { data: ownerData } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', store.owner_id)
        .single();
      owner = ownerData;
    }

    // Determine if requester can view the detailed audit trail
    // ONLY ADMIN or the STORE_OWNER of this specific store can view audit trail!
    const isOwner = store.owner_id && store.owner_id === currentUserId;
    const isAdmin = currentUserRole === 'ADMIN';
    const canViewAuditTrail = isAdmin || isOwner;

    // Get all ratings for this store
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('id, rating, created_at, updated_at, user_id')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    if (ratingsError) throw ratingsError;

    // Current user's own rating and experience
    const userRatingObj = (ratings || []).find((r) => r.user_id === currentUserId);
    const userReview = reviewStore.getReview(currentUserId, store.id);

    // Build audit trail ONLY if authorized (Admin or Store Owner)
    let auditTrailRatings = [];
    if (canViewAuditTrail) {
      const userIds = (ratings || []).map((r) => r.user_id);
      let raters = [];
      if (userIds.length > 0) {
        const { data: ratersData } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', userIds);
        raters = ratersData || [];
      }

      auditTrailRatings = (ratings || []).map((r) => {
        const rater = raters.find((u) => u.id === r.user_id);
        const rev = reviewStore.getReview(r.user_id, store.id);
        return {
          id: r.id,
          rating: r.rating,
          experience: rev?.experience || '',
          created_at: r.created_at,
          updated_at: r.updated_at,
          userId: r.user_id,
          userName: rater ? rater.name : 'Verified Customer',
          userEmail: rater ? rater.email : 'customer@example.com',
        };
      });
    }

    // Rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    (ratings || []).forEach((r) => {
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating]++;
      }
    });

    const totalRatings = ratings ? ratings.length : 0;
    const avgRating =
      totalRatings > 0
        ? parseFloat(
            ((ratings || []).reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2)
          )
        : null;

    res.json({
      ...store,
      owner,
      overallRating: avgRating,
      totalRatings,
      userRating: userRatingObj ? userRatingObj.rating : null,
      userExperience: userReview?.experience || '',
      breakdown,
      ratings: auditTrailRatings,
      canViewAuditTrail,
    });
  } catch (err) {
    console.error('Get store by id error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getStores, createStore, getStoreById };

