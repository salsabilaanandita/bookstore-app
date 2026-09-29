// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './store/useSession';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute, RoleRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/auth/Login';

// User Pages
import { Home } from './pages/user/Home';
import { Browse } from './pages/user/Browse';
import { BookDetail } from './pages/user/BookDetail';
import { Cart } from './pages/user/Cart';
import { Checkout } from './pages/user/Checkout';
import { MyLibrary } from './pages/user/MyLibrary';
import { Reader } from './pages/user/Reader';
import { Wishlist } from './pages/user/Wishlist';
import { Orders } from './pages/user/Orders';
import { Profile } from './pages/user/Profile';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffOrders } from './pages/staff/StaffOrders';
import { StaffInventory } from './pages/staff/StaffInventory';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminBooks } from './pages/admin/AdminBooks';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminUsers } from './pages/admin/AdminUsers';

export function App() {
  const { initSession } = useSession();

  useEffect(() => {
    initSession();
  }, [initSession]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login & Register */}
        <Route path="/login" element={<Login initialMode="login" />} />
        <Route path="/register" element={<Login initialMode="register" />} />

        {/* Reader Fullscreen */}
        <Route
          path="/library/:id/read"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['user']}>
                <Reader />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* App Main Shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* User Routes */}
          <Route
            index
            element={
              <RoleRoute allowedRoles={['user']}>
                <Home />
              </RoleRoute>
            }
          />
          <Route
            path="browse"
            element={
              <RoleRoute allowedRoles={['user']}>
                <Browse />
              </RoleRoute>
            }
          />
          <Route
            path="books/:id"
            element={
              <RoleRoute allowedRoles={['user']}>
                <BookDetail />
              </RoleRoute>
            }
          />
          <Route
            path="library"
            element={
              <RoleRoute allowedRoles={['user']}>
                <MyLibrary />
              </RoleRoute>
            }
          />
          <Route
            path="wishlist"
            element={
              <RoleRoute allowedRoles={['user']}>
                <Wishlist />
              </RoleRoute>
            }
          />
          <Route
            path="cart"
            element={
              <RoleRoute allowedRoles={['user']}>
                <Cart />
              </RoleRoute>
            }
          />
          <Route
            path="checkout"
            element={
              <RoleRoute allowedRoles={['user']}>
                <Checkout />
              </RoleRoute>
            }
          />
          <Route
            path="orders"
            element={
              <RoleRoute allowedRoles={['user']}>
                <Orders />
              </RoleRoute>
            }
          />
          <Route
            path="profile"
            element={
              <RoleRoute allowedRoles={['user', 'staff', 'admin']}>
                <Profile />
              </RoleRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="staff"
            element={
              <RoleRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="staff/books"
            element={
              <RoleRoute allowedRoles={['staff']}>
                <AdminBooks />
              </RoleRoute>
            }
          />
          <Route
            path="staff/orders"
            element={
              <RoleRoute allowedRoles={['staff']}>
                <StaffOrders />
              </RoleRoute>
            }
          />
          <Route
            path="staff/inventory"
            element={
              <RoleRoute allowedRoles={['staff']}>
                <StaffInventory />
              </RoleRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminReports />
              </RoleRoute>
            }
          />
          <Route
            path="admin/books"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminBooks />
              </RoleRoute>
            }
          />
          <Route
            path="admin/categories"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminCategories />
              </RoleRoute>
            }
          />
          <Route
            path="admin/inventory"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <StaffInventory />
              </RoleRoute>
            }
          />
          <Route
            path="admin/orders"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <StaffOrders />
              </RoleRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminUsers />
              </RoleRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
