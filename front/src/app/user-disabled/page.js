'use client';

import { Box, Typography, Button } from '@mui/material';

import DashboardLayout from 'src/layouts/dashboard';
// auth
import { RoleBasedGuard } from 'src/auth/guard';

const DisabledOverlay = () => (
  <DashboardLayout>
    <RoleBasedGuard />
 </DashboardLayout>
);

export default DisabledOverlay;
