import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { IconUsers, IconStore, IconShield, IconCheckCircle } from '../../components/Icons';

export default function AddUser() {
  const navigate = useNavigate();

  // Selected Tab: 'USER', 'STORE_OWNER', or 'ADMIN'
  const [role, setRole] = useState('USER');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    // Store Owner specific fields
    store_name: '',
    gstin: '',
    store_address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrors({});
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};

    // Common validations
    if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      newErrors.name = role === 'STORE_OWNER'
        ? 'Owner name must be between 20 and 60 characters.'
        : 'Full name must be between 20 and 60 characters.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (formData.password.length < 8 || formData.password.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters.';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Role specific validations
    if (role === 'USER' || role === 'ADMIN') {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required.';
      } else if (formData.address.trim().length < 20) {
        newErrors.address = 'Address must be at least 20 characters.';
      } else if (formData.address.trim().length > 400) {
        newErrors.address = 'Address must not exceed 400 characters.';
      }
    }

    if (role === 'STORE_OWNER') {
      if (formData.store_name.trim().length < 20 || formData.store_name.trim().length > 60) {
        newErrors.store_name = 'Store name must be between 20 and 60 characters.';
      }

      const cleanGstin = formData.gstin.trim().toUpperCase();
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z0-9]{1}[0-9A-Z]{1}$/i;
      if (!cleanGstin) {
        newErrors.gstin = 'GSTIN number is required for business onboarding.';
      } else if (!gstinRegex.test(cleanGstin)) {
        newErrors.gstin = 'Invalid GSTIN. Must be 15 characters (e.g. 27AAPFU0939F1ZV).';
      }

      if (!formData.store_address.trim()) {
        newErrors.store_address = 'Store physical address is required.';
      } else if (formData.store_address.trim().length < 20) {
        newErrors.store_address = 'Store address must be at least 20 characters.';
      } else if (formData.store_address.trim().length > 400) {
        newErrors.store_address = 'Store address must not exceed 400 characters.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role,
      };

      if (role === 'STORE_OWNER') {
        payload.store_name = formData.store_name.trim();
        payload.gstin = formData.gstin.trim().toUpperCase();
        payload.store_address = formData.store_address.trim();
        payload.address = formData.store_address.trim();
      } else {
        payload.address = formData.address.trim();
      }

      await API.post('/users', payload);
      navigate('/admin/users');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        const fieldErrors = {};
        errorData.errors.forEach((errItem) => {
          fieldErrors[errItem.path] = errItem.msg;
        });
        setErrors(fieldErrors);
      } else {
        setServerError(errorData?.error || 'Failed to create user account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Platform Account</h1>
        <p>Register a verified Normal Shopper, Store Owner, or Admin user</p>
      </div>

      <div className="card" style={{ padding: 'var(--space-2xl)' }}>
        {/* Account Role Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            background: '#F1F5F9',
            padding: '6px',
            borderRadius: '12px',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <button
            type="button"
            className="chip-btn"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: role === 'USER' ? '#FFFFFF' : 'transparent',
              color: role === 'USER' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: role === 'USER' ? '1px solid #E2E8F0' : '1px solid transparent',
              boxShadow: role === 'USER' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
            }}
            onClick={() => handleRoleChange('USER')}
          >
            <IconUsers size={16} color={role === 'USER' ? '#166534' : '#64748B'} />
            Normal User
          </button>

          <button
            type="button"
            className="chip-btn"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: role === 'STORE_OWNER' ? '#FFFFFF' : 'transparent',
              color: role === 'STORE_OWNER' ? '#B45309' : 'var(--text-secondary)',
              border: role === 'STORE_OWNER' ? '1px solid #E2E8F0' : '1px solid transparent',
              boxShadow: role === 'STORE_OWNER' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
            }}
            onClick={() => handleRoleChange('STORE_OWNER')}
          >
            <IconStore size={16} color={role === 'STORE_OWNER' ? '#B45309' : '#64748B'} />
            Store Owner
          </button>

          <button
            type="button"
            className="chip-btn"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: role === 'ADMIN' ? '#FFFFFF' : 'transparent',
              color: role === 'ADMIN' ? '#0369A1' : 'var(--text-secondary)',
              border: role === 'ADMIN' ? '1px solid #E2E8F0' : '1px solid transparent',
              boxShadow: role === 'ADMIN' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
            }}
            onClick={() => handleRoleChange('ADMIN')}
          >
            <IconShield size={16} color={role === 'ADMIN' ? '#0369A1' : '#64748B'} />
            Administrator
          </button>
        </div>

        {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: User / Owner Personal Info */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
              {role === 'STORE_OWNER' ? '1. Merchant Personal Information' : 'Account Credentials'}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-name">
                {role === 'STORE_OWNER' ? 'Owner Full Name' : 'Full Name'}
              </label>
              <input
                id="add-name"
                type="text"
                className="form-input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={role === 'STORE_OWNER' ? 'Enter owner name (20-60 characters)' : 'Enter full name (20-60 characters)'}
              />
              <span className="form-hint">{formData.name.length}/60 characters (min 20)</span>
              {errors.name && <div className="form-error">⚠️ {errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-email">
                {role === 'STORE_OWNER' ? 'Owner Email Address' : 'Email Address'}
              </label>
              <input
                id="add-email"
                type="email"
                className="form-input"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
              />
              {errors.email && <div className="form-error">⚠️ {errors.email}</div>}
            </div>

            {/* Password and Confirm Password Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="add-password">Password</label>
                <input
                  id="add-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8-16 chars, 1 uppercase, 1 special"
                />
                {errors.password && <div className="form-error">⚠️ {errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-confirm-password">Confirm Password</label>
                <input
                  id="add-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && <div className="form-error">⚠️ {errors.confirmPassword}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
              <label className="checkbox-label" style={{ fontSize: '0.8125rem' }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                Show Passwords
              </label>
              <span className="form-hint" style={{ margin: 0 }}>8-16 chars, 1 uppercase, 1 special character</span>
            </div>
          </div>

          {/* Section 2: If Normal User or Admin -> Address */}
          {(role === 'USER' || role === 'ADMIN') && (
            <div className="form-group">
              <label className="form-label" htmlFor="add-address">
                {role === 'ADMIN' ? 'Office / Administrative Address' : 'Residential Address'}
              </label>
              <textarea
                id="add-address"
                className="form-textarea"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete physical address (min 20 characters)"
                rows={3}
              />
              <span className="form-hint">{formData.address.length}/400 characters (min 20)</span>
              {errors.address && <div className="form-error">⚠️ {errors.address}</div>}
            </div>
          )}

          {/* Section 2: If Store Owner -> Store Business Details */}
          {role === 'STORE_OWNER' && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                2. Business Store Information
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-store-name">Store Name</label>
                <input
                  id="add-store-name"
                  type="text"
                  className="form-input"
                  name="store_name"
                  value={formData.store_name}
                  onChange={handleChange}
                  placeholder="Enter business store name (min 20 characters)"
                />
                <span className="form-hint">{formData.store_name.length}/60 characters (min 20)</span>
                {errors.store_name && <div className="form-error">⚠️ {errors.store_name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-gstin">GSTIN Number (15 Characters)</label>
                <input
                  id="add-gstin"
                  type="text"
                  className="form-input"
                  name="gstin"
                  maxLength={15}
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <span className="form-hint">Official 15-character Indian GSTIN for tax & location verification</span>
                {errors.gstin && <div className="form-error">⚠️ {errors.gstin}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-store-address">Store Physical Address</label>
                <textarea
                  id="add-store-address"
                  className="form-textarea"
                  name="store_address"
                  value={formData.store_address}
                  onChange={handleChange}
                  placeholder="Shop number, street, locality, landmark, city, state, pincode (min 20 characters)"
                  rows={3}
                />
                <span className="form-hint">{formData.store_address.length}/400 characters (min 20)</span>
                {errors.store_address && <div className="form-error">⚠️ {errors.store_address}</div>}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-md" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '160px' }}>
              {loading ? 'Registering...' : role === 'STORE_OWNER' ? 'Create Store Owner' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}