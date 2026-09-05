import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import RatingStars from '../../components/RatingStars';
import { formatStoreAddress } from '../../utils/format';
import {
  IconStore,
  IconMapPin,
  IconCheckCircle,
  IconFileText,
  IconStar,
} from '../../components/Icons';

export default function MyReviews() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const res = await API.get('/stores');
      // Only keep stores that the user has already rated
      const rated = res.data.filter((s) => s.userRating !== null && s.userRating !== undefined);
      setStores(rated);
    } catch (err) {
      console.error('Failed to load user reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete your review and rating for this store?')) {
      return;
    }
    try {
      await API.delete(`/ratings/store/${storeId}`);
      setStores((prev) => prev.filter((s) => s.id !== storeId));
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert(err.response?.data?.error || 'Failed to delete review. Please try again.');
    }
  };

  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    formatStoreAddress(s.address).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Hero Header */}
      <div className="dashboard-hero">
        <div>
          <span className="hero-status-pill" style={{ marginBottom: '10px' }}>
            <IconCheckCircle size={14} color="#4ADE80" /> My Customer History
          </span>
          <h1>My Submitted Reviews & Ratings</h1>
          <p>
            Here is the complete record of all stores and businesses you have reviewed till date. You can modify your ratings and feedback anytime.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-md) var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            style={{ maxWidth: '400px' }}
            placeholder="Search your reviewed stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Total Stores Reviewed: <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{stores.length}</span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <div className="stat-icon" style={{ margin: '0 auto var(--space-md)' }}>
            <IconFileText size={24} color="#166534" />
          </div>
          <h3>You haven't reviewed any stores yet</h3>
          <p>Explore verified businesses in the directory and share your shopping experience.</p>
          <Link to="/user/stores" className="btn btn-primary mt-md">
            Browse & Rate Stores →
          </Link>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="empty-state">
          <h3>No matching reviews found</h3>
          <p>Try searching for a different store name or clear your search query.</p>
          <button
            type="button"
            className="btn btn-secondary mt-md"
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="store-grid animate-list">
          {filteredStores.map((store) => (
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

                {/* Rating Display */}
                <div
                  style={{
                    background: '#F8FAF6',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RatingStars value={store.userRating} readonly size="sm" />
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-primary)' }}>
                      {store.userRating} / 5 Stars
                    </span>
                  </div>
                  <span
                    className="verified-pill"
                    style={{
                      background: '#DCFCE7',
                      color: '#166534',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    ★ You Rated {store.userRating}/5
                  </span>
                </div>

                {/* Customer Experience Feedback */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Your Experience Feedback:
                  </div>
                  {store.userExperience ? (
                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '0.8125rem',
                        color: 'var(--text-primary)',
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                      }}
                    >
                      "{store.userExperience}"
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No written comments provided (Star rating only).
                    </div>
                  )}
                </div>

                {/* Date stamp */}
                {store.ratedAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    📅 Reviewed on {new Date(store.ratedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', gap: '8px' }}>
                <Link
                  to={`/stores/${store.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Edit Review
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteReview(store.id)}
                  style={{ justifyContent: 'center' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
