import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import RatingStars from '../../components/RatingStars';
import {
  IconUsers,
  IconStore,
  IconCheckCircle,
  IconStar,
  IconFileText,
  IconMapPin,
  IconShield,
} from '../../components/Icons';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/users/${id}`);
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: 'badge-admin',
      USER: 'badge-user',
      STORE_OWNER: 'badge-store-owner',
    };
    return (
      <span className={`badge ${badges[role] || ''}`} style={{ fontSize: '0.8125rem', padding: '5px 14px' }}>
        {role === 'USER' ? 'Normal Shopper' : role.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="stat-icon" style={{ margin: '0 auto var(--space-md)' }}>
            <IconUsers size={24} color="#166534" />
          </div>
          <h3>User Not Found</h3>
          <p>The requested user profile does not exist or has been removed.</p>
          <button className="btn btn-primary mt-lg" onClick={() => navigate('/admin/users')}>
            ← Back to Users Directory
          </button>
        </div>
      </div>
    );
  }

  const isStoreOwner = user.role === 'STORE_OWNER';
  const isNormalUser = user.role === 'USER';
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="page-container">
      {/* Top Navigation */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/admin/users')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back to Users Directory
        </button>
      </div>

      {/* Hero Profile Banner */}
      <div className="dashboard-hero animate-list" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div
            className={`user-avatar ${isAdmin ? 'admin' : isStoreOwner ? 'owner' : ''}`}
            style={{
              width: '68px',
              height: '68px',
              fontSize: '1.75rem',
              fontWeight: 800,
              background: '#FFFFFF',
              color: isStoreOwner ? '#B45309' : isAdmin ? '#0369A1' : '#166534',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {getRoleBadge(user.role)}
              <span className="hero-status-pill">
                <IconCheckCircle size={13} color="#4ADE80" /> Verified Account
              </span>
              <span className="hero-status-pill" style={{ background: 'rgba(255,255,255,0.1)' }}>
                Member Since {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', marginBottom: '4px', fontWeight: 800 }}>{user.name}</h1>
            <p style={{ color: '#D1E7DD', fontSize: '0.9375rem' }}>
              📧 {user.email} &nbsp;·&nbsp; 📍 {user.address}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-2xl)' }}>
        {/* Role Metric Card */}
        <div className="stat-card">
          <div className="stat-icon">
            {isStoreOwner ? <IconStore size={22} color="#166534" /> : <IconUsers size={22} color="#166534" />}
          </div>
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>
            {user.role === 'USER' ? 'Normal User' : user.role === 'STORE_OWNER' ? 'Store Owner' : 'Administrator'}
          </div>
          <div className="stat-label">Platform Role & Access Tier</div>
          <div className="stat-trend trend-up">
            <span>●</span> {isStoreOwner ? 'Business Listing Owner' : isNormalUser ? 'Verified Customer Shopper' : 'System Admin'}
          </div>
        </div>

        {/* Member Since Card */}
        <div className="stat-card">
          <div className="stat-icon">
            <IconFileText size={22} color="#166534" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>
            {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <div className="stat-label">Registration Date</div>
          <div className="stat-trend trend-neutral">
            <span>📅</span> Account Onboarding
          </div>
        </div>

        {/* Dynamic Context Card */}
        <div className="stat-card">
          <div className="stat-icon">
            <IconStar size={22} color="#166534" fill="#166534" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>
            {isStoreOwner
              ? user.storeRating
                ? `${user.storeRating.toFixed(1)} / 5.0`
                : 'New Store'
              : isNormalUser
              ? `${user.totalReviews || 0} Reviews`
              : 'Admin Access'}
          </div>
          <div className="stat-label">
            {isStoreOwner ? 'Business Rating Score' : isNormalUser ? 'Total Store Reviews Logged' : 'Platform Governance'}
          </div>
          <div className="stat-trend trend-up">
            <span>✔</span> {isStoreOwner ? `${user.totalStoreRatings || 0} Customer Ratings` : isNormalUser ? 'Active Shopper' : 'Full Permissions'}
          </div>
        </div>
      </div>

      {/* Main Details Grid (2 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-xl)' }}>
        {/* Left Column: Account & Contact Profile */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Account Profile Details</h3>
              <p style={{ fontSize: '0.8125rem' }}>Personal identification and registered contact information</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '18px', fontSize: '0.875rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Full Legal Name
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', fontSize: '1rem' }}>
                {user.name}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
              </div>
              <div style={{ color: 'var(--text-primary)', marginTop: '4px', fontSize: '0.9375rem', fontWeight: 500 }}>
                {user.email}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Registered Physical Address
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                {user.address}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  System Role
                </div>
                <div style={{ marginTop: '4px' }}>
                  {getRoleBadge(user.role)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Account Status
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span className="verified-pill">
                    <IconCheckCircle size={12} color="#166534" /> Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Context Activity Card */}
        <div style={{ display: 'grid', gap: 'var(--space-lg)', height: 'fit-content' }}>
          {isStoreOwner && user.store && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Assigned Business Listing</h3>
                  <p style={{ fontSize: '0.8125rem' }}>Store owned and operated by this merchant</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '16px', fontSize: '0.875rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Store Name
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', fontSize: '1.05rem' }}>
                    {user.store.name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Store Rating & Reputation
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <RatingStars value={Math.round(user.storeRating || 0)} readonly size="md" />
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>
                      {user.storeRating ? `${user.storeRating.toFixed(1)} / 5.0` : 'No ratings yet'}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Store Physical Address
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {user.store.address}
                  </div>
                </div>

                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <Link
                    to={`/stores/${user.store.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    View Store Audit Trail →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isStoreOwner && !user.store && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Business Listing</h3>
                  <p style={{ fontSize: '0.8125rem' }}>Store association</p>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                This store owner does not have a registered store linked to their account yet.
              </p>
              <Link to="/admin/stores/add" className="btn btn-primary btn-sm mt-md" style={{ justifyContent: 'center' }}>
                Register Store For Owner →
              </Link>
            </div>
          )}

          {isNormalUser && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Shopper Activity Summary</h3>
                  <p style={{ fontSize: '0.8125rem' }}>Verified platform ratings & participation</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '14px', fontSize: '0.875rem' }}>
                <div style={{ background: '#F8FAF6', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Store Ratings
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
                    {user.totalReviews || 0}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Store reviews and ratings submitted across all registered businesses
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  <IconCheckCircle size={14} color="#166534" />
                  Eligible to rate and review any verified physical merchant
                </div>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Administrative Privileges</h3>
                  <p style={{ fontSize: '0.8125rem' }}>System governance rights</p>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '10px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconShield size={16} color="#0369A1" /> Full read/write access to User Directory
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconShield size={16} color="#0369A1" /> Store registration and ownership assignment
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconShield size={16} color="#0369A1" /> Transparent ratings audit trail moderation
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
