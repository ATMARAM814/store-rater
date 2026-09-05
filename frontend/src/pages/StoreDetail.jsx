import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import {
  IconStore,
  IconMapPin,
  IconCheckCircle,
  IconStar,
  IconFileText,
  IconUsers,
  IconShield,
  IconSparkles,
} from '../components/Icons';
import { formatStoreAddress } from '../utils/format';

export default function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review Form State for Normal User
  const [selectedRating, setSelectedRating] = useState(0);
  const [experience, setExperience] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Audit Trail filter state (only used by Admin or Store Owner)
  const [searchRater, setSearchRater] = useState('');
  const [starFilter, setStarFilter] = useState('ALL');

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/stores/${id}`);
      setStore(res.data);
      if (res.data.userRating) {
        setSelectedRating(res.data.userRating);
      }
      if (res.data.userExperience) {
        setExperience(res.data.userExperience);
      }
    } catch (err) {
      console.error('Failed to fetch store details:', err);
      setError(err.response?.data?.error || 'Failed to load store information.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    if (e) e.preventDefault();
    if (selectedRating < 1 || selectedRating > 5) {
      setSubmitError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      const res = await API.post('/ratings', {
        store_id: id,
        rating: selectedRating,
        experience: experience.trim(),
      });

      setSubmitSuccess(res.data.message || 'Review submitted successfully!');
      setTimeout(() => setSubmitSuccess(''), 5000);

      // Refresh store details to update average score and store counters
      await fetchStoreDetails();
    } catch (err) {
      console.error('Submit review error:', err);
      setSubmitError(err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review for this store?')) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      const res = await API.delete(`/ratings/store/${id}`);
      setSubmitSuccess(res.data.message || 'Your review and rating have been removed successfully.');
      setSelectedRating(0);
      setExperience('');
      setTimeout(() => setSubmitSuccess(''), 5000);
      await fetchStoreDetails();
    } catch (err) {
      console.error('Delete review error:', err);
      setSubmitError(err.response?.data?.error || 'Failed to delete review.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingFeedback = (stars) => {
    switch (stars) {
      case 5:
        return { label: '5 / 5 - Outstanding!', desc: 'Exceptional products, stellar service, and top-tier experience.' };
      case 4:
        return { label: '4 / 5 - Very Good!', desc: 'Great quality and smooth shopping experience.' };
      case 3:
        return { label: '3 / 5 - Average', desc: 'Acceptable experience, with scope for improvement.' };
      case 2:
        return { label: '2 / 5 - Below Average', desc: 'Did not meet expectations in several aspects.' };
      case 1:
        return { label: '1 / 5 - Poor', desc: 'Unsatisfactory experience with store service or products.' };
      default:
        return { label: 'Select Your Rating', desc: 'Click on a star above to rate your experience.' };
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="stat-icon" style={{ margin: '0 auto var(--space-md)' }}>
            <IconStore size={24} color="#166534" />
          </div>
          <h3>Store Not Found</h3>
          <p>{error || 'The requested store could not be found.'}</p>
          <button className="btn btn-secondary mt-md" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const {
    name,
    email,
    address,
    owner,
    overallRating,
    totalRatings = 0,
    userRating,
    breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    ratings = [],
    created_at,
    canViewAuditTrail = false,
  } = store;

  // Filtered audit trail ratings (only rendered for Admin or Owner)
  const filteredRatings = ratings.filter((r) => {
    const matchesSearch =
      r.userName?.toLowerCase().includes(searchRater.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(searchRater.toLowerCase()) ||
      r.experience?.toLowerCase().includes(searchRater.toLowerCase());
    const matchesStar = starFilter === 'ALL' || r.rating === parseInt(starFilter, 10);
    return matchesSearch && matchesStar;
  });

  const ratingFeedback = getRatingFeedback(selectedRating);

  return (
    <div className="page-container">
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back
        </button>
      </div>

      {/* Global Success Banner */}
      {submitSuccess && (
        <div className="alert alert-success animate-list" style={{ marginBottom: 'var(--space-lg)' }}>
          <IconCheckCircle size={18} color="#16A34A" /> {submitSuccess}
        </div>
      )}

      {/* Hero Store Profile Banner */}
      <div className="dashboard-hero animate-list" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconStore size={32} color="#FFFFFF" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className="hero-status-pill">
                <IconCheckCircle size={13} color="#4ADE80" /> Verified Merchant
              </span>
              <span className="hero-status-pill" style={{ background: 'rgba(255,255,255,0.1)' }}>
                Registered Store
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>{name}</h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#D1E7DD', fontSize: '0.875rem' }}>
              <span>📍 {formatStoreAddress(address)}</span>
              {canViewAuditTrail && (
                <>
                  <span>📧 {email}</span>
                  {owner && <span>👤 Merchant: {owner.name}</span>}
                  {created_at && (
                    <span>
                      📅 Partner since {new Date(created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Normal User Dedicated Review Section (No audit metrics or total ratings boxes) */}
      {user.role === 'USER' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
          {/* Review Submission Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconSparkles size={18} color="#166534" />
                  <h3 style={{ margin: 0 }}>
                    {userRating ? 'Update Your Review & Experience' : 'Write a Review & Experience'}
                  </h3>
                </div>
                <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
                  Your feedback is delivered directly to this store owner to help them elevate service quality.
                </p>
              </div>
              {userRating && (
                <span
                  className="verified-pill"
                  style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  ★ You Rated {userRating}/5
                </span>
              )}
            </div>

            {submitError && (
              <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit}>
              {/* Star Rating Selector */}
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Your Overall Rating <span style={{ color: '#DC2626' }}>*</span>
                </label>

                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  <RatingStars
                    value={selectedRating}
                    onChange={(r) => setSelectedRating(r)}
                    size="lg"
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>
                      {ratingFeedback.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {ratingFeedback.desc}
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Experience Textarea */}
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                    Your Experience Feedback <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {experience.length} / 600
                  </span>
                </div>
                <textarea
                  className="form-input"
                  rows={4}
                  maxLength={600}
                  placeholder="Share details about your experience at this store... (e.g., product quality, pricing, staff hospitality, billing, hygiene)..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  style={{
                    width: '100%',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || selectedRating === 0}
                  style={{ minWidth: '170px', justifyContent: 'center' }}
                >
                  {submitting ? 'Saving Review...' : userRating ? 'Update My Review' : 'Submit Review'}
                </button>

                {userRating && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={submitting}
                    onClick={handleDeleteReview}
                    style={{ minWidth: '140px', justifyContent: 'center' }}
                  >
                    Delete Review
                  </button>
                )}

                {selectedRating === 0 && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Please tap a star to select a rating
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Store Details Card */}
          <div className="card" style={{ height: 'fit-content' }}>
            <div className="card-header">
              <div>
                <h3>Store Details</h3>
                <p style={{ fontSize: '0.8125rem' }}>Verified Business Information</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px', fontSize: '0.875rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store Name</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location & Address</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{formatStoreAddress(address)}</div>
              </div>
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span className="verified-pill" style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                  <IconCheckCircle size={14} color="#166534" /> Verified Roxiler Partner
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin and Store Owner View: 3 KPI Stat Cards + Rating Breakdown + Full Audit Trail */}
      {canViewAuditTrail && (
        <>
          {/* KPI Stats Grid (ONLY for Admin and Store Owner) */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-2xl)' }}>
            {/* Overall Rating Score */}
            <div className="stat-card">
              <div className="stat-icon">
                <IconStar size={22} color="#166534" fill="#166534" />
              </div>
              <div className="stat-value">
                {overallRating ? overallRating.toFixed(1) : 'New'}
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/5.0</span>
              </div>
              <div className="stat-label">Community Rating Score</div>
              <div style={{ marginTop: '6px' }}>
                <RatingStars value={Math.round(overallRating || 0)} readonly size="sm" />
              </div>
            </div>

            {/* Total Ratings Count */}
            <div className="stat-card">
              <div className="stat-icon">
                <IconFileText size={22} color="#166534" />
              </div>
              <div className="stat-value">{totalRatings}</div>
              <div className="stat-label">Total Verified Reviews</div>
              <div className="stat-trend trend-up">
                <span>●</span> Authentic Customer Feedback
              </div>
            </div>

            {/* Positive Sentiment */}
            <div className="stat-card">
              <div className="stat-icon">
                <IconUsers size={22} color="#166534" />
              </div>
              <div className="stat-value">
                {totalRatings > 0
                  ? `${Math.round(((breakdown[5] + breakdown[4]) / totalRatings) * 100)}%`
                  : '100%'}
              </div>
              <div className="stat-label">Positive Sentiment (4-5★)</div>
              <div className="stat-trend trend-up">
                <span>✔</span> Customer Recommended
              </div>
            </div>
          </div>

          {/* Middle Row: Rating Breakdown */}
          <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
            <div className="card-header">
              <div>
                <h3>Rating Breakdown</h3>
                <p style={{ fontSize: '0.8125rem' }}>Distribution of customer reviews across 5 star tiers</p>
              </div>
            </div>

            <div className="rating-breakdown-list">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = breakdown[star] || 0;
                const percent = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                return (
                  <div key={star} className="rating-bar-row">
                    <span className="rating-bar-label">{star} ★</span>
                    <div className="rating-bar-track">
                      <div className="rating-bar-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="rating-bar-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Audit Trail Table (ONLY for Admin or Store Owner) */}
          <div className="card">
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconShield size={20} color="#166534" />
                  <h3 style={{ margin: 0 }}>Ratings & Reviews Audit Trail</h3>
                </div>
                <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
                  Administrative audit log of verified customer ratings and written experiences
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minWidth: '220px' }}
                placeholder="Search by customer name, email, or review text..."
                value={searchRater}
                onChange={(e) => setSearchRater(e.target.value)}
              />
              <select
                className="form-select"
                style={{ width: '180px' }}
                value={starFilter}
                onChange={(e) => setStarFilter(e.target.value)}
              >
                <option value="ALL">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {filteredRatings.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <div className="stat-icon" style={{ margin: '0 auto var(--space-md)' }}>
                  <IconFileText size={24} color="#166534" />
                </div>
                <h3>No ratings found</h3>
                <p>
                  {ratings.length === 0
                    ? 'This store has not received any ratings yet.'
                    : 'No reviews match your search or star filter.'}
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Rating</th>
                      <th>Customer Experience</th>
                      <th>Timestamp</th>
                      <th>Audit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRatings.map((r) => (
                      <tr
                        key={r.id}
                        className="clickable-row"
                        onClick={() => navigate(`/store-owner/reviews/${r.id}`)}
                        title="Click to view detailed customer review"
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8125rem' }}>
                              {r.userName.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{r.userName}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.userEmail}</td>
                        <td>
                          <div className="star-rating-display">
                            <RatingStars value={r.rating} readonly size="sm" />
                            <span className="rating-value" style={{ marginLeft: '4px' }}>
                              {r.rating}/5
                            </span>
                          </div>
                        </td>
                        <td>
                          {r.experience ? (
                            <div
                              style={{
                                background: '#F0FDF4',
                                border: '1px solid #DCFCE7',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                fontSize: '0.8125rem',
                                color: '#166534',
                                fontStyle: 'italic',
                                maxWidth: '280px',
                                lineHeight: 1.4,
                              }}
                            >
                              "{r.experience}"
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              Rating only
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          {new Date(r.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {r.updated_at && r.updated_at !== r.created_at && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              (Edited: {new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="verified-pill">
                            <IconCheckCircle size={12} color="#166534" /> Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
