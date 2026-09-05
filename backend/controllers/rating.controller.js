const supabase = require('../config/supabase');
const reviewStore = require('../services/reviewStore');

// POST /api/ratings — Submit or update a rating (upsert) + optional experience
const submitRating = async (req, res) => {
  try {
    const { store_id, rating, experience } = req.body;
    const user_id = req.user.id;

    if (!store_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid store_id and rating (1-5) are required.' });
    }

    // Check if store exists
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('id', store_id)
      .single();

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    // Check if user already rated this store
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', user_id)
      .eq('store_id', store_id)
      .single();

    let result;

    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating, updated_at: new Date().toISOString() })
        .eq('id', existingRating.id)
        .select('id, user_id, store_id, rating, created_at, updated_at')
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new rating
      const { data, error } = await supabase
        .from('ratings')
        .insert([{ user_id, store_id, rating }])
        .select('id, user_id, store_id, rating, created_at, updated_at')
        .single();

      if (error) throw error;
      result = data;
    }

    // Save optional experience if provided
    if (experience !== undefined) {
      reviewStore.setReview(user_id, store_id, experience);
    }

    // Calculate new average rating for the store
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('store_id', store_id);

    const avgRating =
      allRatings && allRatings.length > 0
        ? parseFloat(
            (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(2)
          )
        : null;

    // Update the store's cached rating in Supabase
    await supabase
      .from('stores')
      .update({ rating: avgRating })
      .eq('id', store_id);

    const savedReview = reviewStore.getReview(user_id, store_id);

    res.json({
      rating: result,
      experience: savedReview?.experience || '',
      newAverageRating: avgRating,
      message: existingRating
        ? 'Your review and rating have been updated successfully.'
        : 'Your review and rating have been submitted successfully.',
    });
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/ratings/store/:storeId — Store Owner: get ratings for their store
const getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Verify the store belongs to this owner
    const { data: store } = await supabase
      .from('stores')
      .select('id, owner_id')
      .eq('id', storeId)
      .single();

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    if (store.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. This is not your store.' });
    }

    // Get all ratings with user info
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('id, rating, created_at, updated_at, user_id')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch user details for each rater
    const userIds = ratings.map((r) => r.user_id);
    let users = [];
    if (userIds.length > 0) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds);
      users = userData || [];
    }

    // Merge user info into ratings
    const ratingsWithUsers = ratings.map((r) => {
      const user = users.find((u) => u.id === r.user_id);
      const rev = reviewStore.getReview(r.user_id, storeId);
      return {
        ...r,
        userName: user ? user.name : 'Unknown',
        userEmail: user ? user.email : 'Unknown',
        experience: rev?.experience || '',
      };
    });

    // Calculate average
    const avgRating =
      ratings.length > 0
        ? parseFloat(
            (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
          )
        : null;

    res.json({
      ratings: ratingsWithUsers,
      averageRating: avgRating,
      totalRatings: ratings.length,
    });
  } catch (err) {
    console.error('Get store ratings error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/ratings/:id — Get a single rating review detail for Store Owner / Admin
const getRatingById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: rating, error } = await supabase
      .from('ratings')
      .select('id, rating, user_id, store_id, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !rating) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    // Fetch store details
    const { data: store } = await supabase
      .from('stores')
      .select('id, name, email, address, owner_id')
      .eq('id', rating.store_id)
      .single();

    if (!store) {
      return res.status(404).json({ error: 'Associated store not found.' });
    }

    // Security check: Only Admin or the store owner can view detailed review
    if (req.user.role !== 'ADMIN' && store.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own this store.' });
    }

    // Fetch customer details
    const { data: customer } = await supabase
      .from('users')
      .select('id, name, email, address')
      .eq('id', rating.user_id)
      .single();

    const rev = reviewStore.getReview(rating.user_id, rating.store_id);

    res.json({
      id: rating.id,
      rating: rating.rating,
      experience: rev?.experience || '',
      created_at: rating.created_at,
      updated_at: rating.updated_at,
      customer: customer || { name: 'Verified Customer', email: 'customer@example.com' },
      store,
    });
  } catch (err) {
    console.error('Get rating by id error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// DELETE /api/ratings/store/:storeId — USER: Delete their rating and review for a store
const deleteRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const user_id = req.user.id;

    // Check if rating exists
    const { data: existingRating, error: fetchErr } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', user_id)
      .eq('store_id', storeId)
      .single();

    if (fetchErr || !existingRating) {
      return res.status(404).json({ error: 'Rating not found for this store.' });
    }

    // Delete from Supabase ratings table
    const { error: deleteErr } = await supabase
      .from('ratings')
      .delete()
      .eq('id', existingRating.id);

    if (deleteErr) throw deleteErr;

    // Delete from local review store
    reviewStore.deleteReview(user_id, storeId);

    // Re-calculate average rating for the store
    const { data: remainingRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('store_id', storeId);

    const avgRating =
      remainingRatings && remainingRatings.length > 0
        ? parseFloat(
            (remainingRatings.reduce((sum, r) => sum + r.rating, 0) / remainingRatings.length).toFixed(2)
          )
        : null;

    // Also update the store's rating column in Supabase
    await supabase
      .from('stores')
      .update({ rating: avgRating })
      .eq('id', storeId);

    res.json({
      message: 'Your review and rating have been deleted successfully.',
      newAverageRating: avgRating,
    });
  } catch (err) {
    console.error('Delete rating error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { submitRating, getStoreRatings, getRatingById, deleteRating };
