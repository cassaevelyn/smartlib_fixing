import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Library Pages
import LibrariesPage from './pages/libraries/LibrariesPage';
import LibraryDetailPage from './pages/libraries/LibraryDetailPage';
import MyLibrariesPage from './pages/libraries/MyLibrariesPage';
import LibraryApplicationPage from './pages/libraries/LibraryApplicationPage';

// Seat Pages
import SeatsPage from './pages/seats/SeatsPage';
import SeatBookingPage from './pages/seats/SeatBookingPage';
import MyBookingsPage from './pages/seats/MyBookingsPage';

// Book Pages
import BooksPage from './pages/books/BooksPage';
import BookDetailPage from './pages/books/BookDetailPage';
import MyReservationsPage from './pages/books/MyReservationsPage';

// Event Pages
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';
import MyEventsPage from './pages/events/MyEventsPage';

// Profile Pages
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/profile/SettingsPage';
import SubscriptionsPage from './pages/profile/SubscriptionsPage';

// Notification Pages
import NotificationsPage from './pages/notifications/NotificationsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminLibraryApplicationsPage from './pages/admin/AdminLibraryApplicationsPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminSeatsPage from './pages/admin/AdminSeatsPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminLibrariesPage from './pages/admin/AdminLibrariesPage';
import AdminLibraryDetailPage from './pages/admin/AdminLibraryDetailPage';
import AdminManagedLibraryPage from './pages/admin/AdminManagedLibraryPage';

// Super Admin Pages
import SuperAdminDashboardPage from './pages/superadmin/AdminDashboardPage';
import SuperAdminUsersPage from './pages/superadmin/AdminUsersPage';
import SuperAdminAdminsPage from './pages/superadmin/AdminAdminsPage';
import SuperAdminBooksPage from './pages/superadmin/AdminBooksPage';
import SuperAdminSeatsPage from './pages/superadmin/AdminSeatsPage';
import SuperAdminEventsPage from './pages/superadmin/AdminEventsPage';
import SuperAdminAnalyticsPage from './pages/superadmin/AdminAnalyticsPage';
import SuperAdminLibrariesPage from './pages/superadmin/AdminLibrariesPage';
import SuperAdminLibraryDetailPage from './pages/superadmin/AdminLibraryDetailPage';
import SuperAdminLibraryApplicationsPage from './pages/superadmin/SuperAdminLibraryApplicationsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/verify-email/:token?" element={<VerifyEmailPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Libraries */}
          <Route path="/libraries" element={<LibrariesPage />} />
          <Route path="/libraries/:id" element={<LibraryDetailPage />} />
          <Route path="/my-libraries" element={<MyLibrariesPage />} />
          <Route path="/libraries/apply/:id?" element={<LibraryApplicationPage />} />
          
          {/* Seats */}
          <Route path="/seats" element={<SeatsPage />} />
          <Route path="/seats/book/:id" element={<SeatBookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          
          {/* Books */}
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/my-reservations" element={<MyReservationsPage />} />
          
          {/* Events */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/my-events" element={<MyEventsPage />} />
          
          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          
          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/library-applications" element={<ProtectedRoute roles={['ADMIN']}><AdminLibraryApplicationsPage /></ProtectedRoute>} />
          <Route path="/admin/books" element={<ProtectedRoute roles={['ADMIN']}><AdminBooksPage /></ProtectedRoute>} />
          <Route path="/admin/seats" element={<ProtectedRoute roles={['ADMIN']}><AdminSeatsPage /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute roles={['ADMIN']}><AdminEventsPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute roles={['ADMIN']}><AdminAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/libraries" element={<ProtectedRoute roles={['ADMIN']}><AdminLibrariesPage /></ProtectedRoute>} />
          <Route path="/admin/libraries/:id" element={<ProtectedRoute roles={['ADMIN']}><AdminLibraryDetailPage /></ProtectedRoute>} />
          <Route path="/admin/managed-library" element={<ProtectedRoute roles={['ADMIN']}><AdminManagedLibraryPage /></ProtectedRoute>} />
          
          {/* Super Admin Routes */}
          <Route path="/superadmin/dashboard" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminDashboardPage /></ProtectedRoute>} />
          <Route path="/superadmin/users" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminUsersPage /></ProtectedRoute>} />
          <Route path="/superadmin/admins" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminAdminsPage /></ProtectedRoute>} />
          <Route path="/superadmin/books" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminBooksPage /></ProtectedRoute>} />
          <Route path="/superadmin/seats" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminSeatsPage /></ProtectedRoute>} />
          <Route path="/superadmin/events" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminEventsPage /></ProtectedRoute>} />
          <Route path="/superadmin/analytics" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminAnalyticsPage /></ProtectedRoute>} />
          <Route path="/superadmin/libraries" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminLibrariesPage /></ProtectedRoute>} />
          <Route path="/superadmin/libraries/:id" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminLibraryDetailPage /></ProtectedRoute>} />
          <Route path="/superadmin/library-applications" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminLibraryApplicationsPage /></ProtectedRoute>} />
        </Route>

        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;