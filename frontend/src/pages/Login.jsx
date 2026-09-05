import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === 'true';
  const inactivityExpired = searchParams.get('inactivity') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const user = await login(cleanEmail, password);
      const routes = {
        ADMIN: '/admin/dashboard',
        USER: '/user/stores',
        STORE_OWNER: '/store-owner/dashboard',
      };
      navigate(routes[user.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Header matching design */}
      <header className="auth-top-header">
        <BrandLogo size="md" />
        <div className="auth-top-switch">
          New here? <Link to="/signup">Sign up</Link>
        </div>
      </header>

      {/* Main Center Auth Container */}
      <div className="auth-container">
        <div className="auth-card">
          {/* Green Circle Badge with White Star */}
          <div className="auth-badge-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L14.8 8.2H21.5L16.1 12.3L18.2 18.5L12 14.7L5.8 18.5L7.9 12.3L2.5 8.2H9.2L12 2Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue to your StoreRater account</p>
          </div>

          {inactivityExpired && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}>
              🔒 Session timed out after 30 minutes of inactivity for your security. Please sign in again.
            </div>
          )}

          {sessionExpired && !inactivityExpired && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}>
              🔒 Your session has expired. Please sign in again.
            </div>
          )}

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="input-icon-wrapper">
                <span className="input-leading-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="email"
                  className="form-input has-leading-icon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-icon-wrapper">
                <span className="input-leading-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-leading-icon has-trailing-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
            </div>

            {/* Session Security Indicator & Forgot Password */}
            <div className="form-checkbox-row">
              <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('Please contact the administrator or use Change Password once logged in.'); }}>
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Bottom Link */}
          <div className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
