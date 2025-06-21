import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface SidebarLinkProps {
  to: string;
  icon: string;
  label: string;
  active: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <i className={`${icon} mr-3`}></i>
      <span>{label}</span>
    </Link>
  );
};

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <Link to="/dashboard" className="flex items-center">
          <span className="text-xl font-bold text-primary">Smart Lib</span>
        </Link>
      </div>

      <div className="px-2 py-4">
        <SidebarSection title="Main">
          <SidebarLink
            to="/dashboard"
            icon="fas fa-home"
            label="Dashboard"
            active={location.pathname === '/dashboard'}
          />
          <SidebarLink
            to="/libraries"
            icon="fas fa-building"
            label="Libraries"
            active={location.pathname.startsWith('/libraries') && location.pathname !== '/libraries/apply'}
          />
          <SidebarLink
            to="/my-libraries"
            icon="fas fa-star"
            label="My Libraries"
            active={location.pathname === '/my-libraries'}
          />
        </SidebarSection>

        <SidebarSection title="Resources">
          <SidebarLink
            to="/seats"
            icon="fas fa-chair"
            label="Seats"
            active={location.pathname === '/seats'}
          />
          <SidebarLink
            to="/books"
            icon="fas fa-book"
            label="Books"
            active={location.pathname === '/books'}
          />
          <SidebarLink
            to="/events"
            icon="fas fa-calendar"
            label="Events"
            active={location.pathname === '/events'}
          />
        </SidebarSection>

        <SidebarSection title="My Activity">
          <SidebarLink
            to="/my-bookings"
            icon="fas fa-calendar-check"
            label="My Bookings"
            active={location.pathname === '/my-bookings'}
          />
          <SidebarLink
            to="/my-reservations"
            icon="fas fa-bookmark"
            label="My Reservations"
            active={location.pathname === '/my-reservations'}
          />
          <SidebarLink
            to="/my-events"
            icon="fas fa-ticket-alt"
            label="My Events"
            active={location.pathname === '/my-events'}
          />
        </SidebarSection>

        {isAdmin && (
          <SidebarSection title="Administration">
            <SidebarLink
              to="/admin/dashboard"
              icon="fas fa-tachometer-alt"
              label="Admin Dashboard"
              active={location.pathname === '/admin/dashboard'}
            />
            <SidebarLink
              to="/admin/users"
              icon="fas fa-users"
              label="Manage Users"
              active={location.pathname === '/admin/users'}
            />
            <SidebarLink
              to="/admin/library-applications"
              icon="fas fa-clipboard-list"
              label="Library Applications"
              active={location.pathname === '/admin/library-applications'}
            />
            <SidebarLink
              to="/admin/books"
              icon="fas fa-book"
              label="Manage Books"
              active={location.pathname === '/admin/books'}
            />
            <SidebarLink
              to="/admin/seats"
              icon="fas fa-chair"
              label="Manage Seats"
              active={location.pathname === '/admin/seats'}
            />
            <SidebarLink
              to="/admin/events"
              icon="fas fa-calendar"
              label="Manage Events"
              active={location.pathname === '/admin/events'}
            />
            <SidebarLink
              to="/admin/analytics"
              icon="fas fa-chart-bar"
              label="Analytics"
              active={location.pathname === '/admin/analytics'}
            />
            <SidebarLink
              to="/admin/managed-library"
              icon="fas fa-cog"
              label="Library Settings"
              active={location.pathname === '/admin/managed-library'}
            />
          </SidebarSection>
        )}

        {isSuperAdmin && (
          <SidebarSection title="Super Admin">
            <SidebarLink
              to="/superadmin/dashboard"
              icon="fas fa-tachometer-alt"
              label="Admin Dashboard"
              active={location.pathname === '/superadmin/dashboard'}
            />
            <SidebarLink
              to="/superadmin/users"
              icon="fas fa-users"
              label="All Users"
              active={location.pathname === '/superadmin/users'}
            />
            <SidebarLink
              to="/superadmin/admins"
              icon="fas fa-user-shield"
              label="Manage Admins"
              active={location.pathname === '/superadmin/admins'}
            />
            <SidebarLink
              to="/superadmin/libraries"
              icon="fas fa-building"
              label="All Libraries"
              active={location.pathname === '/superadmin/libraries' && !location.pathname.includes('/library-applications')}
            />
            <SidebarLink
              to="/superadmin/library-applications"
              icon="fas fa-clipboard-list"
              label="Library Applications"
              active={location.pathname === '/superadmin/library-applications'}
            />
            <SidebarLink
              to="/superadmin/books"
              icon="fas fa-book"
              label="All Books"
              active={location.pathname === '/superadmin/books'}
            />
            <SidebarLink
              to="/superadmin/seats"
              icon="fas fa-chair"
              label="All Seats"
              active={location.pathname === '/superadmin/seats'}
            />
            <SidebarLink
              to="/superadmin/events"
              icon="fas fa-calendar"
              label="All Events"
              active={location.pathname === '/superadmin/events'}
            />
            <SidebarLink
              to="/superadmin/analytics"
              icon="fas fa-chart-bar"
              label="System Analytics"
              active={location.pathname === '/superadmin/analytics'}
            />
          </SidebarSection>
        )}

        <SidebarSection title="Account">
          <SidebarLink
            to="/profile"
            icon="fas fa-user"
            label="My Profile"
            active={location.pathname === '/profile'}
          />
          <SidebarLink
            to="/settings"
            icon="fas fa-cog"
            label="Settings"
            active={location.pathname === '/settings'}
          />
          <SidebarLink
            to="/subscriptions"
            icon="fas fa-credit-card"
            label="Subscriptions"
            active={location.pathname === '/subscriptions'}
          />
          <SidebarLink
            to="/notifications"
            icon="fas fa-bell"
            label="Notifications"
            active={location.pathname === '/notifications'}
          />
        </SidebarSection>
      </div>
    </div>
  );
};

export default Sidebar;