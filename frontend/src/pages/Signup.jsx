import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'USER' or 'STORE_OWNER' (Normal User selected by default)
  const [accountType, setAccountType] = useState('USER');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
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

  const handleTabChange = (type) => {
    setAccountType(type);
    setErrors({});
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};

    // Common validations
    if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      newErrors.name = accountType === 'STORE_OWNER'
        ? 'Owner name must be between 20 and 60 characters.'
        : 'Name must be between 20 and 60 characters.';
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

    // Normal User specific validations
    if (accountType === 'USER') {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required.';
      } else if (formData.address.trim().length > 400) {
        newErrors.address = 'Address must not exceed 400 characters.';
      }
    }

    // Store Owner specific validations
    if (accountType === 'STORE_OWNER') {
      if (formData.store_name.trim().length < 20 || formData.store_name.trim().length > 60) {
        newErrors.store_name = 'Store name must be between 20 and 60 characters.';
      }

      const gstinClean = formData.gstin.trim().toUpperCase();
      // Indian GSTIN: 15 alphanumeric characters (e.g. 27AAPFU0939F1ZV)
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z0-9]{1}[0-9A-Z]{1}$/i;
      if (!gstinClean) {
        newErrors.gstin = 'GSTIN number is required for business verification.';
      } else if (!gstinRegex.test(gstinClean)) {
        newErrors.gstin = 'Invalid GSTIN. Must be 15 characters (e.g. 27AAPFU0939F1ZV).';
      }

      if (!formData.store_address.trim()) {
        newErrors.store_address = 'Store physical address is required.';
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
      if (accountType === 'USER') {
        await signup({
          name: formData.name.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          password: formData.password,
          role: 'USER',
        });
        navigate('/user/stores');
      } else {
        await signup({
          name: formData.name.trim(),
          email: formData.email.trim(),
          address: formData.store_address.trim(),
          password: formData.password,
          role: 'STORE_OWNER',
          store_name: formData.store_name.trim(),
          gstin: formData.gstin.trim().toUpperCase(),
          store_address: formData.store_address.trim(),
        });
        navigate('/store-owner/dashboard');
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        const fieldErrors = {};
        errorData.errors.forEach((e) => {
          fieldErrors[e.path] = e.msg;
        });
        setErrors(fieldErrors);
      } else {
        setServerError(errorData?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Header */}
      <header className="auth-top-header">
        <BrandLogo size="md" />
        <div className="auth-top-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '580px' }}>
          
          {/* Account Type Segmented Tab (Normal User vs Store Owner) */}
          <div className="account-type-tabs">
            <button
              type="button"
              className={`account-type-tab ${accountType === 'USER' ? 'active' : ''}`}
              onClick={() => handleTabChange('USER')}
            >
              👤 Normal User
            </button>
            <button
              type="button"
              className={`account-type-tab ${accountType === 'STORE_OWNER' ? 'active' : ''}`}
              onClick={() => handleTabChange('STORE_OWNER')}
            >
              🏪 Store Owner
            </button>
          </div>

          {/* Badge Icon */}
          <div className="auth-badge-icon">
            {accountType === 'USER' ? (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L14.8 8.2H21.5L16.1 12.3L18.2 18.5L12 14.7L5.8 18.5L7.9 12.3L2.5 8.2H9.2L12 2Z"
                  fill="#FFFFFF"
                />
              </svg>
            ) : (
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🏪</span>
            )}
          </div>

          <div className="auth-header">
            <h1 className="auth-title">
              {accountType === 'USER' ? 'Create User Account' : 'Register as Store Owner'}
            </h1>
            <p className="auth-subtitle">
              {accountType === 'USER'
                ? 'Join StoreRater and submit verified store reviews'
                : 'Register your business with verified GSTIN to receive store ratings'}
            </p>
          </div>

          {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}

          <form onSubmit={handleSubmit}>
            {/* Owner/User Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">
                {accountType === 'STORE_OWNER' ? 'Owner / Representative Name' : 'Full Name'}
              </label>
              <input
                id="signup-name"
                type="text"
                className="form-input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={accountType === 'STORE_OWNER' ? 'Enter business owner full name' : 'Enter your full name'}
              />
              <span className="form-hint">{formData.name.length}/60 characters (min 20)</span>
              {errors.name && <div className="form-error">⚠️ {errors.name}</div>}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">
                {accountType === 'STORE_OWNER' ? 'Business / Store Email' : 'Email Address'}
              </label>
              <input
                id="signup-email"
                type="email"
                className="form-input"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={accountType === 'STORE_OWNER' ? 'store@business.com' : 'you@example.com'}
              />
              <span className="form-hint">Used for logging into your StoreRater account</span>
              {errors.email && <div className="form-error">⚠️ {errors.email}</div>}
            </div>

            {/* STORE OWNER SPECIFIC FIELDS */}
            {accountType === 'STORE_OWNER' && (
              <>
                {/* Store Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-store-name">Store Name</label>
                  <input
                    id="signup-store-name"
                    type="text"
                    className="form-input"
                    name="store_name"
                    value={formData.store_name}
                    onChange={handleChange}
                    placeholder="Enter official registered store name"
                  />
                  <span className="form-hint">{formData.store_name.length}/60 characters (min 20)</span>
                  {errors.store_name && <div className="form-error">⚠️ {errors.store_name}</div>}
                </div>

                {/* GSTIN Verification Number */}
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-gstin">
                    GSTIN Number (Business Tax ID)
                  </label>
                  <input
                    id="signup-gstin"
                    type="text"
                    className="form-input"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="e.g. 27AAPFU0939F1ZV (15 characters)"
                    maxLength={15}
                    style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                  <span className="form-hint">
                    🔒 Required 15-character GSTIN ensures only verified store owners can register
                  </span>
                  {errors.gstin && <div className="form-error">⚠️ {errors.gstin}</div>}
                </div>

                {/* Store Physical Address */}
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-store-address">Store Physical Address</label>
                  <textarea
                    id="signup-store-address"
                    className="form-textarea"
                    name="store_address"
                    value={formData.store_address}
                    onChange={handleChange}
                    placeholder="Enter complete store address (Shop No., Street, Area, City, Pincode)"
                    rows={3}
                  />
                  <span className="form-hint">{formData.store_address.length}/400 characters</span>
                  {errors.store_address && <div className="form-error">⚠️ {errors.store_address}</div>}
                </div>
              </>
            )}

            {/* NORMAL USER ADDRESS */}
            {accountType === 'USER' && (
              <div className="form-group">
                <label className="form-label" htmlFor="signup-address">Address</label>
                <textarea
                  id="signup-address"
                  className="form-textarea"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your residential address"
                  rows={3}
                />
                <span className="form-hint">{formData.address.length}/400 characters</span>
                {errors.address && <div className="form-error">⚠️ {errors.address}</div>}
              </div>
            )}

            {/* Passwords */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">Password</label>
                <div className="input-icon-wrapper">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input has-trailing-icon"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="8-16 chars"
                  />
                  <button
                    type="button"
                    className="input-trailing-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <div className="form-error">⚠️ {errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
                <input
                  id="signup-confirm"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                />
                {errors.confirmPassword && <div className="form-error">⚠️ {errors.confirmPassword}</div>}
              </div>
            </div>

            <span className="form-hint mb-lg">
              Password requirement: 8-16 chars, at least 1 uppercase letter and 1 special character
            </span>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading
                ? 'Processing Registration...'
                : accountType === 'STORE_OWNER'
                ? 'Register Store & Create Account'
                : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
