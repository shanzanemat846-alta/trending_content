'use client'

import PropTypes from 'prop-types';
import { m } from 'framer-motion';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { useAuthContext } from 'src/auth/hooks';
// assets
import { ForbiddenIllustration } from 'src/assets/illustrations';
// components
import { MotionContainer, varBounce } from 'src/components/animate';
import { USER_STATUS } from '../../utils/constants';

// ----------------------------------------------------------------------

export default function RoleBasedGuard({ hasContent, roles, children, sx }) {
  // Logic here to get current user role
  // const { user } = useMockedUser();
  const { user } = useAuthContext();
  const currentRole = user?.role;

  if (user && user.status === USER_STATUS.DISABLED) {
    return <Container component={MotionContainer} sx={{ textAlign: 'center', ...sx }}>
        <Box
          sx={{
            height: '82vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            padding: 3,
          }}
        >
          <svg
            width="200"
            height="200"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="#ff5252" strokeWidth="2" fill="#ffe6e6" />
            <line x1="7" y1="7" x2="17" y2="17" stroke="#ff5252" strokeWidth="2" />
            <line x1="7" y1="17" x2="17" y2="7" stroke="#ff5252" strokeWidth="2" />
          </svg>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2 }}>
            Access Restricted
          </Typography>
          <Typography variant="body1" sx={{ color: 'gray', maxWidth: 400, mt: 1 }}>
            Your account is currently disabled. If you believe this is a mistake, please contact support.
          </Typography>
        </Box>
      </Container>
    ;
  }
  if (user && typeof roles !== 'undefined' && !roles.includes(currentRole)) {
    return hasContent ? (
      <Container component={MotionContainer} sx={{ textAlign: 'center', ...sx }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Permission Denied
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>

          {user?.role === 'admin' ? (
          <p>This page is only accessible to regular users.</p>
          ) : (
            <p>You do not have permission to access this page.</p>
          )}

          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration
            sx={{
              height: 260,
              my: { xs: 5, sm: 10 },
            }}
          />
        </m.div>
      </Container>
    ) : null;
  }

  if (!user) return null;

  return <> {children} </>;
}

RoleBasedGuard.propTypes = {
  children: PropTypes.node,
  hasContent: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string),
  sx: PropTypes.object,
};
