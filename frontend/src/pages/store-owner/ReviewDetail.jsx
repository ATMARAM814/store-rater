import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import RatingStars from '../../components/RatingStars';
import {
  IconStore,
  IconCheckCircle,
  IconStar,
  IconFileText,
  IconShield,
} from '../../components/Icons';

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviewDetail();
  }, [id]);

  const fetchReviewDetail = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/ratings/${id}`);
      setReview(res.data);
    } catch (err) {
      console.error('Failed to load review details:', err);
      setError(err.response?.data?.error || 'Failed to load customer review details.');
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

  if (error || !review) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="stat-icon" style={{ margin: '0 auto var(--space-md)' }}>
            <IconFileText size={24} color="#166534" />
          </div>
          <h3>Review Not Found</h3>
          <p>{error || 'The requested customer review could not be retrieved.'}</p>
          <button
            type="button"
            className="btn btn-secondary mt-md"
            onClick={() => navigate('/store-owner/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { customer, store, rating, experience, created_at, updated_at } = review;

  const getScoreDescription = (stars) => {
    switch (stars) {
      case 5:
        return '5 / 5 Stars - Outstanding Experience';
      case 4:
        return '4 / 5 Stars - Very Good';
      case 3:
        return '3 / 5 Stars - Average';
      case 2:
        return '2 / 5 Stars - Below Average';
      case 1:
        return '1 / 5 Stars - Poor';
      default:
        return `${stars} / 5 Stars`;
    }
  };

  return (
    <div className="page-container">
      {/* Back Button */}
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

      {/* Hero Customer Review Banner */}
      <div className="dashboard-hero animate-list" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem', background: '#FFFFFF', color: '#166534' }}>
            {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className="hero-status-pill">
                <IconCheckCircle size={14} color="#4ADE80" /> Verified Customer Review
              </span>
              <span className="hero-status-pill" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {store.name}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Review by {customer.name}</h1>
            <p style={{ color: '#D1E7DD', fontSize: '0.875rem' }}>
              📧 {customer.email} &nbsp;·&nbsp; 📍 {customer.address || 'Registered Roxiler Shopper'}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 'var(--space-xl)' }}>
        {/* Left Column: Rating & Written Experience */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Customer Rating & Experience Details</h3>
              <p style={{ fontSize: '0.8125rem' }}>Full transparent feedback submitted for your store</p>
            </div>
            <span
              className="verified-pill"
              style={{
                background: '#DCFCE7',
                color: '#166534',
                whiteSpace: 'nowrap',
                padding: '6px 14px',
                fontSize: '0.8125rem',
              }}
            >
              ★ {rating} / 5 Stars
            </span>
          </div>

          {/* Star Rating Section */}
          <div
            style={{
              background: '#F8FAF6',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '18px 20px',
              marginBottom: 'var(--space-xl)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              flexWrap: 'wrap',
            }}
          >
            <RatingStars value={rating} readonly size="lg" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-primary)' }}>
                {getScoreDescription(rating)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Verified star rating recorded on the platform
              </div>
            </div>
          </div>

          {/* Written Experience Feedback */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Customer's Written Experience Feedback:
            </label>

            {experience ? (
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #DCFCE7',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: '#14532D',
                  fontStyle: 'italic',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: '2rem', color: '#86EFAC', position: 'absolute', top: '8px', left: '10px', lineHeight: 1 }}>“</span>
                <p style={{ margin: 0, paddingLeft: '16px', color: '#166534', fontWeight: 500 }}>
                  {experience}
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                }}
              >
                The customer did not provide optional written comments with this rating.
              </div>
            )}
          </div>

          {/* Submission Timestamp & Audit Metadata */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div>
              <strong>Date Submitted:</strong>{' '}
              {new Date(created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            {updated_at && updated_at !== created_at && (
              <div>
                <strong>Last Updated:</strong>{' '}
                {new Date(updated_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer & Store Summary */}
        <div style={{ display: 'grid', gap: 'var(--space-lg)', height: 'fit-content' }}>
          {/* Customer Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3>Customer Information</h3>
                <p style={{ fontSize: '0.8125rem' }}>Verified account profile</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px', fontSize: '0.875rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Full Name
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {customer.name}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Email Address
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {customer.email}
                </div>
              </div>

              {customer.address && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Registered Address
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {customer.address}
                  </div>
                </div>
              )}

              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span className="verified-pill">
                  <IconCheckCircle size={12} color="#166534" /> Verified Platform User
                </span>
              </div>
            </div>
          </div>

          {/* Store Context Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3>Business Listing</h3>
                <p style={{ fontSize: '0.8125rem' }}>Target store profile</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px', fontSize: '0.875rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Store Name
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {store.name}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Location
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {store.address}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Store Contact
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {store.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
