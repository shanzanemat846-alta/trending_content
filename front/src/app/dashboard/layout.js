'use client';

import PropTypes from 'prop-types';
// auth
import { AuthGuard, RoleBasedGuard } from 'src/auth/guard';
// components
import DashboardLayout from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <AuthGuard>
      <DashboardLayout>
        <RoleBasedGuard>
          {children}
        </RoleBasedGuard>
      </DashboardLayout>
    </AuthGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
