const supabase = require('../config/supabase');

// GET /api/dashboard/admin — Admin dashboard stats
const getAdminDashboard = async (req, res) => {
  try {
    // Total normal users only (role = 'USER'), excluding store owners and admins
    const { data: normalUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'USER');

    // Total stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id');

    // Total ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('id');

    if (usersError || storesError || ratingsError) {
      throw usersError || storesError || ratingsError;
    }

    res.json({
      totalUsers: normalUsers ? normalUsers.length : 0,
      totalStores: stores ? stores.length : 0,
      totalRatings: ratings ? ratings.length : 0,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/dashboard/store-owner — Store owner dashboard
const getStoreOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find the owner's store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name, email, address')
      .eq('owner_id', ownerId)
      .single();

    if (storeError || !store) {
      return res.json({
        store: null,
        averageRating: null,
        totalRatings: 0,
        ratings: [],
        message: 'No store assigned to this owner.',
      });
    }

    // Get all ratings for this store with user info
    const { data: ratings } = await supabase
      .from('ratings')
      .select('id, rating, user_id, created_at')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    // Get user info for raters
    const userIds = (ratings || []).map((r) => r.user_id);
    let users = [];
    if (userIds.length > 0) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds);
      users = userData || [];
    }

    const reviewStore = require('../services/reviewStore');
    const ratingsWithUsers = (ratings || []).map((r) => {
      const user = users.find((u) => u.id === r.user_id);
      const rev = reviewStore.getReview(r.user_id, store.id);
      return {
        ...r,
        userName: user ? user.name : 'Unknown',
        userEmail: user ? user.email : 'Unknown',
        experience: rev?.experience || '',
      };
    });

    // Calculate average
    const avgRating =
      ratings && ratings.length > 0
        ? parseFloat(
            (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
          )
        : null;

    res.json({
      store,
      averageRating: avgRating,
      totalRatings: ratings ? ratings.length : 0,
      ratings: ratingsWithUsers,
    });
  } catch (err) {
    console.error('Store owner dashboard error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getAdminDashboard, getStoreOwnerDashboard };
