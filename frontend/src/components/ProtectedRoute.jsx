import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects = {
      ADMIN: '/admin/dashboard',
      USER: '/user/stores',
      STORE_OWNER: '/store-owner/dashboard',
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return children;
}
