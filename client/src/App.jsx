import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import PublicRoute from './routes/PublicRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResidentLayout from './components/layout/ResidentLayout';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import SlotDiscovery from './pages/resident/SlotDiscovery';
import SlotDetails from './pages/resident/SlotDetails';
import BookSlot from './pages/resident/BookSlot';
import CreateSlot from './pages/resident/CreateSlot';
import MySlots from './pages/resident/MySlots';
import MyBookings from './pages/resident/MyBookings';
import ReceivedBookings from './pages/resident/ReceivedBookings';
import Payments from './pages/resident/Payments';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminLayout from './components/layout/AdminLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

function RootRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading ParkShare..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Resident Routes wrapped in ResidentLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ResidentLayout>
                  <ResidentDashboard />
                </ResidentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/slots"
            element={
              <ProtectedRoute>
                <ResidentLayout>
                  <SlotDiscovery />
                </ResidentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/slots/create"
            element={
              <ProtectedRoute>
                <ResidentLayout>
                  <CreateSlot />
                </ResidentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/slots/:id"
            element={
              <ProtectedRoute>
                <ResidentLayout>
                  <SlotDetails />
                </ResidentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/slots/:id/book"
            element={
              <ProtectedRoute>
                <ResidentLayout>
                  <BookSlot />
                </ResidentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-slots"
            element={
              <ProtectedRoute>
                <ResidentLayout>
                  <MySlots />
                </ResidentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <ResidentLayout>
                  <MyBookings />
                </ResidentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/received-bookings"
            element={
              <ProtectedRoute>
                <ResidentLayout>
                  <ReceivedBookings />
                </ResidentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <ResidentLayout>
                  <Payments />
                </ResidentLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminBookings />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
