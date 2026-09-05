import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import RatingStars from '../../components/RatingStars';
import { IconStore, IconMapPin, IconCheckCircle } from '../../components/Icons';
import { formatStoreAddress } from '../../utils/format';

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [ratingMessage, setRatingMessage] = useState('');

  useEffect(() => {
    fetchStores();
  }, [search]);

  const fetchStores = async () => {
    try {
      const params = {};
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;
      const res = await API.get('/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (storeId, rating) => {
    try {
      const res = await API.post('/ratings', { store_id: storeId, rating });
      setRatingMessage(res.data.message);
      setTimeout(() => setRatingMessage(''), 3500);

      // Update the store's rating in local state
      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId
            ? { ...s, userRating: rating, overallRating: res.data.newAverageRating }
            : s
        )
      );
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setRatingMessage('Failed to submit rating. Please try again.');
      setTimeout(() => setRatingMessage(''), 3500);
    }
  };

  // Only display stores that the user has NOT yet rated
  const unratedStores = stores.filter((s) => !s.userRating);

  // Filter & Sort among unrated stores
  let displayedStores = [...unratedStores];

  if (filterCategory === 'TOP_RATED') {
    displayedStores = displayedStores.filter(s => (s.overallRating || 0) >= 4.0);
  }

  if (sortBy === 'rating_desc') {
    displayedStores.sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
  } else if (sortBy === 'name_asc') {
    displayedStores.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'reviews_desc') {
    displayedStores.sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0));
  }

  return (
    <div className="page-container">
      {/* Hero Header */}
      <div className="dashboard-hero">
        <div>
          <span className="hero-status-pill" style={{ marginBottom: '10px' }}>
            <IconCheckCircle size={14} color="#4ADE80" /> Verified Store Directory
          </span>
          <h1>Discover & Review Registered Stores</h1>
          <p>Explore verified shops, view authentic community feedback, and submit your personal rating.</p>
        </div>
      </div>

      {ratingMessage && (
        <div className="alert alert-success animate-list" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <IconCheckCircle size={16} color="#16A34A" /> {ratingMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search stores by business name..."
            value={search.name}
            onChange={(e) => setSearch(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by city, street, or address..."
            value={search.address}
            onChange={(e) => setSearch(prev => ({ ...prev, address: e.target.value }))}
          />
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating_desc">Highest Rated</option>
            <option value="reviews_desc">Most Reviewed</option>
            <option value="name_asc">Alphabetical (A-Z)</option>
          </select>
        </div>

        {/* Filter Chips */}
        <div className="filter-chips" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`chip-btn ${filterCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterCategory('ALL')}
          >
            Available Stores ({unratedStores.length})
          </button>
          <button
            type="button"
            className={`chip-btn ${filterCategory === 'TOP_RATED' ? 'active' : ''}`}
            onClick={() => setFilterCategory('TOP_RATED')}
          >
            Top Rated (4.0+ Stars)
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : unratedStores.length === 0 ? (
        <div className="empty-state">
          <div className="stat-icon" style={{ margin: '0 auto var(--space-md)' }}>
            <IconCheckCircle size={24} color="#166534" />
          </div>
          <h3>You've Reviewed All Registered Stores!</h3>
          <p>You have submitted ratings for all available businesses. Head over to "My Reviews" to view or edit your feedback.</p>
          <Link to="/user/my-reviews" className="btn btn-primary mt-md">
            View My Reviews →
          </Link>
        </div>
      ) : displayedStores.length === 0 ? (
        <div className="empty-state">
          <div className="stat-icon" style={{ margin: '0 auto var(--space-md)' }}>
            <IconStore size={24} color="#166534" />
          </div>
          <h3>No stores match your search criteria</h3>
          <p>Try clearing filters or search for another store name or location.</p>
          <button
            className="btn btn-secondary mt-md"
            onClick={() => { setSearch({ name: '', address: '' }); setFilterCategory('ALL'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="store-grid animate-list">
          {displayedStores.map((store) => (
            <div key={store.id} className="store-card">
              <div>
                {/* Store Header */}
                <div className="store-card-header">
                  <div className="store-logo-badge">
                    <IconStore size={24} color="#166534" />
                  </div>
                  <div className="store-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Link to={`/stores/${store.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 className="store-title" style={{ cursor: 'pointer' }}>{store.name}</h3>
                      </Link>
                      <span className="verified-pill">
                        <IconCheckCircle size={12} color="#166534" />
                        Verified
                      </span>
                    </div>
                    <div className="store-address-text">
                      <IconMapPin size={14} color="#64748B" />
                      {formatStoreAddress(store.address)}
                    </div>
                  </div>
                </div>

                {/* Rating Stats Summary Box */}
                <div className="store-stats-row">
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Store Rating</div>
                    <div className="star-rating-display" style={{ marginTop: '2px' }}>
                      <span className="rating-value" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                        {store.overallRating ? store.overallRating.toFixed(1) : 'New'}
                      </span>
                      <RatingStars value={Math.round(store.overallRating || 0)} readonly size="sm" />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="verified-pill">
                      <IconCheckCircle size={12} color="#166534" /> Verified Partner
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Rating Section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {store.userRating ? 'Your Rating (Click to change):' : 'Rate this store:'}
                  </span>
                  {store.userRating && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      You gave {store.userRating} ★
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <RatingStars
                    value={store.userRating || 0}
                    onChange={(rating) => handleRating(store.id, rating)}
                    size="lg"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {store.userRating ? 'Rating saved' : 'Tap a star'}
                  </span>
                </div>

                <Link
                  to={`/stores/${store.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '14px', width: '100%', justifyContent: 'center', gap: '6px' }}
                >
                  Write Review & Experience →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
