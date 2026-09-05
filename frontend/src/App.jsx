import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageStores from './pages/admin/ManageStores';
import AddUser from './pages/admin/AddUser';
import AddStore from './pages/admin/AddStore';
import UserDetail from './pages/admin/UserDetail';
import UserDashboard from './pages/user/UserDashboard';
import MyReviews from './pages/user/MyReviews';
import StoreOwnerDashboard from './pages/store-owner/StoreOwnerDashboard';
import ReviewDetail from './pages/store-owner/ReviewDetail';
import StoreDetail from './pages/StoreDetail';
import MyAccount from './pages/MyAccount';

function AppRoutes() {
  const { user } = useAuth();

  // Redirect logged-in users from login/signup to their dashboard
  const getRedirectPath = () => {
    if (!user || !user.role) return null;
    const routes = {
      ADMIN: '/admin/dashboard',
      USER: '/user/stores',
      STORE_OWNER: '/store-owner/dashboard',
    };
    return routes[user.role] || null;
  };

  const redirectPath = getRedirectPath();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={redirectPath ? <Navigate to={redirectPath} replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={redirectPath ? <Navigate to={redirectPath} replace /> : <Signup />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/add"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageStores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores/add"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AddStore />
            </ProtectedRoute>
          }
        />

        {/* Normal User Routes */}
        <Route
          path="/user/stores"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/my-reviews"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/account"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyAccount />
            </ProtectedRoute>
          }
        />

        {/* Store Owner Routes */}
        <Route
          path="/store-owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STORE_OWNER']}>
              <StoreOwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-owner/account"
          element={
            <ProtectedRoute allowedRoles={['STORE_OWNER']}>
              <MyAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-owner/reviews/:id"
          element={
            <ProtectedRoute allowedRoles={['STORE_OWNER', 'ADMIN']}>
              <ReviewDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute allowedRoles={['USER', 'STORE_OWNER', 'ADMIN']}>
              <MyAccount />
            </ProtectedRoute>
          }
        />

        {/* Dedicated Store Detail & Ratings (All roles) */}
        <Route
          path="/stores/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'USER', 'STORE_OWNER']}>
              <StoreDetail />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={redirectPath || "/login"} replace />} />
        <Route path="*" element={<Navigate to={redirectPath || "/login"} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
