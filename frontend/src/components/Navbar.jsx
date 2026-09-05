import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import PasswordModal from './PasswordModal';
import BrandLogo from './BrandLogo';
import { IconKey } from './Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Do not render navbar on login or signup pages, or when user is not logged in
  if (!user || location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const homeRoute = {
    ADMIN: '/admin/dashboard',
    USER: '/user/stores',
    STORE_OWNER: '/store-owner/dashboard',
  }[user.role] || '/login';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to={homeRoute} style={{ textDecoration: 'none' }}>
            <BrandLogo size="sm" showTagline={false} />
          </Link>

          <ul className="navbar-nav">
            {user.role === 'ADMIN' && (
              <>
                <li><NavLink to="/admin/dashboard">Home</NavLink></li>
                <li><NavLink to="/admin/users">Users</NavLink></li>
                <li><NavLink to="/admin/stores">Stores</NavLink></li>
              </>
            )}
            {user.role === 'USER' && (
              <>
                <li><NavLink to="/user/stores">Browse Stores</NavLink></li>
                <li><NavLink to="/user/my-reviews">My Reviews</NavLink></li>
                <li><NavLink to="/user/account">My Account</NavLink></li>
              </>
            )}
            {user.role === 'STORE_OWNER' && (
              <>
                <li><NavLink to="/store-owner/dashboard">Store Dashboard</NavLink></li>
                <li><NavLink to="/store-owner/account">My Account</NavLink></li>
              </>
            )}
          </ul>

          <div className="navbar-user">
            <Link
              to={user.role === 'STORE_OWNER' ? '/store-owner/account' : user.role === 'USER' ? '/user/account' : '/admin/dashboard'}
              className="user-info"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
              title="Click to view & edit your account"
            >
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role ? user.role.replace('_', ' ') : ''}</div>
            </Link>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowPasswordModal(true)}
              title="Change Password"
            >
              <IconKey size={14} color="#166534" /> Password
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
}
