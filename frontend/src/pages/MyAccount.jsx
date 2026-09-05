import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import {
  IconUsers,
  IconStore,
  IconCheckCircle,
  IconKey,
  IconStar,
  IconMapPin,
  IconFileText,
} from '../components/Icons';
import PasswordModal from '../components/PasswordModal';

export default function MyAccount() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Profile data
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
    created_at: null,
  });

  const [storeData, setStoreData] = useState(null);

  // Form State (for editing)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    store_name: '',
    gstin: '',
    store_address: '',
  });

  const isStoreOwner = user?.role === 'STORE_OWNER';
  const isNormalUser = user?.role === 'USER';
  const isAdmin = user?.role === 'ADMIN';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active Member';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Active Member';
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      const u = res.data.user;
      const s = res.data.store;

      let parsedGstin = s?.gstin || '';
      let cleanStoreAddress = s?.cleanAddress || s?.address || '';
      if (s?.address && s.address.includes('(GSTIN:')) {
        const match = s.address.match(/\(GSTIN:\s*([^)]+)\)/i);
        if (match) {
          parsedGstin = match[1].trim();
          cleanStoreAddress = s.address.replace(/\(GSTIN:\s*[^)]+\)/i, '').trim();
        }
      }

      setProfile({
        name: u.name || '',
        email: u.email || '',
        address: u.address || '',
        role: u.role || '',
        created_at: u.created_at || null,
      });

      if (s) {
        setStoreData({
          ...s,
          gstin: parsedGstin,
          cleanAddress: cleanStoreAddress,
        });
      }

      setFormData({
        name: u.name || '',
        email: u.email || '',
        address: u.address || '',
        store_name: s?.name || '',
        gstin: parsedGstin || '',
        store_address: cleanStoreAddress || u.address || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setServerError('Failed to load your account details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleStartEdit = () => {
    setErrors({});
    setServerError('');
    setSuccessMsg('');
    // Re-sync form with current profile
    setFormData({
      name: profile.name,
      email: profile.email,
      address: profile.address,
      store_name: storeData?.name || '',
      gstin: storeData?.gstin || '',
      store_address: storeData?.cleanAddress || profile.address || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setErrors({});
    setServerError('');
    setIsEditing(false);
  };

  const validate = () => {
    const newErrors = {};

    if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      newErrors.name = 'Full name must be between 20 and 60 characters.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (formData.address.trim().length < 20 || formData.address.trim().length > 400) {
      newErrors.address = 'Residential address must be between 20 and 400 characters.';
    }

    if (isStoreOwner) {
      if (!formData.store_name.trim() || formData.store_name.trim().length < 20 || formData.store_name.trim().length > 60) {
        newErrors.store_name = 'Store name must be between 20 and 60 characters.';
      }

      const cleanGstin = formData.gstin.trim().toUpperCase();
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z0-9]{1}[0-9A-Z]{1}$/i;
      if (!cleanGstin) {
        newErrors.gstin = 'GSTIN number is required for store owner registration.';
      } else if (!gstinRegex.test(cleanGstin)) {
        newErrors.gstin = 'Invalid GSTIN format. Must be a valid 15-character GSTIN (e.g. 27AAPFU0939F1ZV).';
      }

      if (!formData.store_address.trim() || formData.store_address.trim().length < 20 || formData.store_address.trim().length > 400) {
        newErrors.store_address = 'Store physical address must be between 20 and 400 characters.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      };

      if (isStoreOwner) {
        payload.store_name = formData.store_name.trim();
        payload.gstin = formData.gstin.trim().toUpperCase();
        payload.store_address = formData.store_address.trim();
      }

      const res = await API.put('/auth/profile', payload);

      if (res.data.user) {
        updateUserProfile(res.data.user);
        setProfile((prev) => ({
          ...prev,
          name: res.data.user.name,
          email: res.data.user.email,
          address: res.data.user.address,
          role: res.data.user.role,
        }));
      }

      if (res.data.store) {
        let parsedGstin = res.data.store.gstin || '';
        let cleanStoreAddress = res.data.store.cleanAddress || res.data.store.address || '';
        if (res.data.store.address && res.data.store.address.includes('(GSTIN:')) {
          const match = res.data.store.address.match(/\(GSTIN:\s*([^)]+)\)/i);
          if (match) {
            parsedGstin = match[1].trim();
            cleanStoreAddress = res.data.store.address.replace(/\(GSTIN:\s*[^)]+\)/i, '').trim();
          }
        }
        setStoreData((prev) => ({
          ...prev,
          ...res.data.store,
          gstin: parsedGstin,
          cleanAddress: cleanStoreAddress,
        }));
      }

      setSuccessMsg('Your account details have been updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      console.error('Update profile error:', err);
      setServerError(err.response?.data?.error || 'Failed to update account details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Hero Header Banner */}
      <div className="dashboard-hero animate-list" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              className="user-avatar"
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
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span className="hero-status-pill">
                  <IconCheckCircle size={13} color="#4ADE80" /> Verified Account
                </span>
                <span className="hero-status-pill" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {isStoreOwner ? 'Store Owner' : isNormalUser ? 'Normal Shopper' : 'Administrator'}
                </span>
                {profile.created_at && (
                  <span className="hero-status-pill" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    Member since {formatDate(profile.created_at)}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '1.85rem', marginBottom: '4px', fontWeight: 800 }}>{profile.name}</h1>
              <p style={{ color: '#D1E7DD', fontSize: '0.875rem' }}>
                📧 {profile.email}
              </p>
            </div>
          </div>

          {/* Quick Actions in Banner */}
          {!isEditing && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleStartEdit}
                style={{ background: '#FFFFFF', color: '#166534', border: 'none', fontWeight: 700 }}
              >
                ✏️ Update Details
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPasswordModal(true)}
                style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <IconKey size={14} color="#FFFFFF" /> Password
              </button>
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-lg)' }}>
          <IconCheckCircle size={18} color="#166534" />
          <span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {serverError && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
          ⚠️ {serverError}
        </div>
      )}

      {/* =========================================================================
          MODE 1: VIEW MODE (Real My Account profile overview with all details)
         ========================================================================= */}
      {!isEditing && (
        <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
          {/* Personal Account Details Card */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3>Personal Account Details</h3>
                <p style={{ fontSize: '0.8125rem' }}>Your verified platform identity and primary contact information</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleStartEdit}
              >
                Update Details
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', fontSize: '0.9375rem' }}>
              <div style={{ background: '#F8FAF6', padding: '16px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Full Name
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', fontSize: '1.05rem' }}>
                  {profile.name}
                </div>
              </div>

              <div style={{ background: '#F8FAF6', padding: '16px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Email Address (Login ID)
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {profile.email}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', background: '#F8FAF6', padding: '16px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isStoreOwner ? 'Merchant Residential Address' : 'Residential Address'}
                </div>
                <div style={{ color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {profile.address}
                </div>
              </div>
            </div>
          </div>

          {/* Store Owner Business Card */}
          {isStoreOwner && (
            storeData ? (
              <div className="card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3>Store Business & Commercial Registration</h3>
                    <p style={{ fontSize: '0.8125rem' }}>Commercial details entered and registered for your verified store</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/store-owner/dashboard" className="btn btn-secondary btn-sm">
                      Store Dashboard →
                    </Link>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', fontSize: '0.9375rem' }}>
                  {/* Store Name */}
                  <div style={{ background: '#F8FAF6', padding: '16px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Registered Store Name
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', fontSize: '1.05rem' }}>
                      {storeData.name}
                    </div>
                  </div>

                  {/* GSTIN Number */}
                  <div style={{ background: '#F8FAF6', padding: '16px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        GSTIN Number
                      </span>
                      <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                        ✓ Verified Tax ID
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, color: '#166534', fontSize: '1.15rem', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                      {storeData.gstin || 'Not Provided'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      15-Digit Goods & Services Tax Identification Number
                    </div>
                  </div>

                  {/* Store Contact Email */}
                  <div style={{ background: '#F8FAF6', padding: '16px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Store Business Email
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {storeData.email || profile.email}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Commercial inquiries and customer correspondence
                    </div>
                  </div>

                  {/* Onboarding Date */}
                  <div style={{ background: '#F8FAF6', padding: '16px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Partner Since
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                      📅 {formatDate(storeData.created_at || profile.created_at)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Active platform merchant
                    </div>
                  </div>

                  {/* Store Physical Address */}
                  <div style={{ gridColumn: '1 / -1', background: '#F8FAF6', padding: '16px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Store Physical Address
                    </div>
                    <div style={{ color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.6, fontWeight: 500 }}>
                      📍 {storeData.cleanAddress || storeData.address}
                    </div>
                  </div>

                  {/* Rating Overview Footer Tile */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Customer Rating Performance
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <RatingStars value={Math.round(storeData.rating || 0)} readonly size="sm" />
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          {storeData.rating ? `${Number(storeData.rating).toFixed(1)} / 5.0 (${storeData.totalRatings || 0} reviews)` : 'New Store (0 Ratings)'}
                        </span>
                      </div>
                    </div>
                    <Link to={`/stores/${storeData.id}`} className="btn btn-secondary btn-sm">
                      Inspect Live Store Page →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏪</div>
                <h3 style={{ marginBottom: '8px' }}>No Store Registered Yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto 16px auto' }}>
                  Your account is registered as a Store Owner, but no commercial store details are currently linked. Click below to add your store name and GSTIN.
                </p>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleStartEdit}>
                  Register Store Details
                </button>
              </div>
            )
          )}

          {/* Normal User Activity Context */}
          {isNormalUser && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Customer Participation</h3>
                  <p style={{ fontSize: '0.8125rem' }}>Your shopping reviews and verified activity</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="stat-icon" style={{ margin: 0 }}>
                    <IconStar size={20} color="#166534" fill="#166534" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Authentic Store Ratings</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Track and modify your submitted reviews anytime
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to="/user/my-reviews" className="btn btn-secondary btn-sm">
                    View My Reviews →
                  </Link>
                  <Link to="/user/stores" className="btn btn-primary btn-sm">
                    Browse Stores
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODE 2: EDIT MODE (Shown only when user clicks "Update Details")
         ========================================================================= */}
      {isEditing && (
        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Update Account Details</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Edit your personal identity and registered commercial store details below
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* User Profile Section */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                Personal Identification
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">Full Name</label>
                <input
                  id="edit-name"
                  type="text"
                  className="form-input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name (20-60 characters)"
                />
                <span className="form-hint">{formData.name.length}/60 characters (min 20)</span>
                {errors.name && <div className="form-error">⚠️ {errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-email">Email Address</label>
                <input
                  id="edit-email"
                  type="email"
                  className="form-input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                />
                <span className="form-hint">Used for signing in and account notifications</span>
                {errors.email && <div className="form-error">⚠️ {errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-address">
                  {isStoreOwner ? 'Merchant Residential Address' : 'Residential Address'}
                </label>
                <textarea
                  id="edit-address"
                  className="form-textarea"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete residential address (min 20 characters)"
                  rows={3}
                />
                <span className="form-hint">{formData.address.length}/400 characters (min 20)</span>
                {errors.address && <div className="form-error">⚠️ {errors.address}</div>}
              </div>
            </div>

            {/* Store Owner Section */}
            {isStoreOwner && (
              <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)', marginBottom: 'var(--space-xl)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                  Commercial Store Business Information
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-store-name">Store Commercial Name</label>
                  <input
                    id="edit-store-name"
                    type="text"
                    className="form-input"
                    name="store_name"
                    value={formData.store_name}
                    onChange={handleChange}
                    placeholder="Enter official registered store name (20-60 characters)"
                  />
                  <span className="form-hint">{formData.store_name.length}/60 characters (min 20)</span>
                  {errors.store_name && <div className="form-error">⚠️ {errors.store_name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-store-gstin">
                    GSTIN Number (15 Characters) <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    id="edit-store-gstin"
                    type="text"
                    className="form-input"
                    name="gstin"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="e.g. 27AAPFU0939F1ZV"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                  <span className="form-hint">🔒 Mandatory 15-character GSTIN registered for this business</span>
                  {errors.gstin && <div className="form-error">⚠️ {errors.gstin}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-store-address">Store Physical Location</label>
                  <textarea
                    id="edit-store-address"
                    className="form-textarea"
                    name="store_address"
                    value={formData.store_address}
                    onChange={handleChange}
                    placeholder="Shop number, building, street, area, city, pincode (min 20 characters)"
                    rows={3}
                  />
                  <span className="form-hint">{formData.store_address.length}/400 characters (min 20)</span>
                  {errors.store_address && <div className="form-error">⚠️ {errors.store_address}</div>}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-md" style={{ justifyContent: 'flex-end', paddingTop: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ minWidth: '160px' }}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
