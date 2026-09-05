import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import RatingStars from '../../components/RatingStars';
import { IconStar, IconFileText, IconThumbsUp, IconShield, IconSparkles, IconChart, IconCheckCircle, IconStore } from '../../components/Icons';

export default function StoreOwnerDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchReviewer, setSearchReviewer] = useState('');
  const [starFilter, setStarFilter] = useState('ALL');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard/store-owner');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!dashboardData?.store) {
    return (
      <div className="page-container">
        <div className="dashboard-hero">
          <div>
            <h1>Store Owner Dashboard</h1>
            <p>Manage your store business profile and monitor customer satisfaction.</p>
          </div>
        </div>
        <div className="empty-state">
          <div className="stat-icon" style={{ margin: '0 auto var(--space-md)' }}>
            <IconStore size={24} color="#166534" />
          </div>
          <h3>No store assigned to your account</h3>
          <p>Please contact the system administrator to link your account to your registered store.</p>
        </div>
      </div>
    );
  }

  const { store, averageRating, totalRatings, ratings = [] } = dashboardData;

  // Filter ratings
  let filteredRatings = ratings.filter((r) => {
    const matchesSearch =
      r.userName?.toLowerCase().includes(searchReviewer.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(searchReviewer.toLowerCase());
    const matchesStar =
      starFilter === 'ALL' || r.rating === parseInt(starFilter, 10);
    return matchesSearch && matchesStar;
  });

  // Calculate star distribution counts
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((r) => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating]++;
    }
  });

  const recommendationRate = totalRatings > 0
    ? Math.round(((starCounts[5] + starCounts[4]) / totalRatings) * 100)
    : 100;

  return (
    <div className="page-container">
      {/* Store Hero Banner */}
      <div className="dashboard-hero animate-list">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="hero-status-pill">
              <span className="status-dot"></span> Verified Merchant
            </span>
            <span className="hero-status-pill" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <IconStore size={14} color="#FFFFFF" /> Active Listing
            </span>
          </div>
          <h1>{store.name}</h1>
          <p style={{ marginTop: '4px' }}>
            {store.email} &nbsp;·&nbsp; {store.address}
          </p>
        </div>
      </div>

      {/* 4 Performance Metrics with Theme Icons */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-2xl)' }}>
        {/* Overall Rating */}
        <div className="stat-card">
          <div className="stat-icon">
            <IconStar size={22} color="#166534" fill="#166534" />
          </div>
          <div className="stat-value">
            {averageRating ? averageRating.toFixed(1) : '—'}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/5.0</span>
          </div>
          <div className="stat-label">Average Customer Score</div>
          <div style={{ marginTop: '6px' }}>
            <RatingStars value={Math.round(averageRating || 0)} readonly size="sm" />
          </div>
        </div>

        {/* Total Reviews */}
        <div className="stat-card">
          <div className="stat-icon">
            <IconFileText size={22} color="#166534" />
          </div>
          <div className="stat-value">{totalRatings}</div>
          <div className="stat-label">Total Customer Reviews</div>
          <div className="stat-trend trend-up">
            <span>●</span> Verified Buyers
          </div>
        </div>

        {/* Recommendation Rate */}
        <div className="stat-card">
          <div className="stat-icon">
            <IconThumbsUp size={22} color="#166534" />
          </div>
          <div className="stat-value">{recommendationRate}%</div>
          <div className="stat-label">Positive Sentiment (4-5★)</div>
          <div className="stat-trend trend-up">
            <span>●</span> High Customer Trust
          </div>
        </div>

        {/* Feedback Health */}
        <div className="stat-card">
          <div className="stat-icon">
            <IconShield size={22} color="#166534" />
          </div>
          <div className="stat-value">100%</div>
          <div className="stat-label">Account Verification</div>
          <div className="stat-trend trend-up">
            <span>✔</span> GSTIN Compliant
          </div>
        </div>
      </div>

      {/* Analytics & Distribution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
        {/* Rating Breakdown Bars */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Customer Rating Distribution</h3>
              <p style={{ fontSize: '0.8125rem' }}>Breakdown of submitted star ratings</p>
            </div>
          </div>

          <div className="rating-breakdown-list">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star] || 0;
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

        {/* Merchant Guidance Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAF6 100%)' }}>
          <div className="card-header">
            <div>
              <h3>Merchant Insights & Advice</h3>
              <p style={{ fontSize: '0.8125rem' }}>Tips to improve customer loyalty and store score</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div className="stat-icon" style={{ width: '36px', height: '36px', marginBottom: 0, flexShrink: 0 }}>
                <IconSparkles size={18} color="#166534" />
              </div>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Maintain Accurate Store Information</strong>
                <p style={{ fontSize: '0.8125rem', marginTop: '2px' }}>Ensure your address, working hours, and contact email remain up to date for customers.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div className="stat-icon" style={{ width: '36px', height: '36px', marginBottom: 0, flexShrink: 0 }}>
                <IconChart size={18} color="#166534" />
              </div>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Review Real Customer Feedback</strong>
                <p style={{ fontSize: '0.8125rem', marginTop: '2px' }}>Customers can modify their ratings anytime. Consistently good service encourages 5-star upgrades.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div className="stat-icon" style={{ width: '36px', height: '36px', marginBottom: 0, flexShrink: 0 }}>
                <IconShield size={18} color="#166534" />
              </div>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Verified Business Guarantee</strong>
                <p style={{ fontSize: '0.8125rem', marginTop: '2px' }}>Your store has a verified GSTIN badge, giving your reviews higher trust and prominence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Ratings Detailed Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Customer Reviews & Ratings</h3>
            <p style={{ fontSize: '0.8125rem' }}>Real-time list of all users who reviewed your business</p>
          </div>
        </div>

        {/* Search & Star Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, minWidth: '220px' }}
            placeholder="Search reviewer by name or email..."
            value={searchReviewer}
            onChange={(e) => setSearchReviewer(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={starFilter}
            onChange={(e) => setStarFilter(e.target.value)}
          >
            <option value="ALL">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {filteredRatings.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
            <div className="empty-icon">📝</div>
            <h3>No customer reviews found</h3>
            <p>
              {ratings.length === 0
                ? 'Your store has not received any ratings yet. Share your store link with customers!'
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
                  <th>Rating Given</th>
                  <th>Customer Experience</th>
                  <th>Verification</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRatings.map((r) => (
                  <tr
                    key={r.id}
                    className="clickable-row"
                    onClick={() => navigate(`/store-owner/reviews/${r.id}`)}
                    title="Click anywhere on this row to view full customer review"
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar">
                          {r.userName ? r.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{r.userName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.userEmail}</td>
                    <td>
                      <div className="star-rating-display">
                        <RatingStars value={r.rating} readonly size="sm" />
                        <span className="rating-value" style={{ marginLeft: '4px' }}>{r.rating}/5</span>
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
                    <td>
                      <span className="verified-pill">✔ Verified User</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {new Date(r.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
