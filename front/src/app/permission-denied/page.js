'use client'

import { m } from 'framer-motion';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// assets
import { ForbiddenIllustration } from 'src/assets/illustrations';
// components
import { MotionContainer, varBounce } from 'src/components/animate';
// config
import { ADMIN_PATH_AFTER_LOGIN, PATH_AFTER_LOGIN } from 'src/config-global';
import { USERS_ROLE } from 'src/utils/constants';

export default function PermissionDeniedPage() {
  const { user } = useAuthContext();

  return (
    <Container component={MotionContainer} sx={{ textAlign: 'center', mt: 5 }}>
      <m.div variants={varBounce().in}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Permission Denied
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        {/* <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          {user?.role === 'admin'
            ? 'This page is only accessible to regular users.'
            : 'You do not have permission to access this page.'}
        </Typography> */}
      </m.div>

      <m.div variants={varBounce().in}>
        <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
      </m.div>

      <Button component={Link}
        href={user?.role === USERS_ROLE.ADMIN ? ADMIN_PATH_AFTER_LOGIN : PATH_AFTER_LOGIN}
        variant="contained" startIcon={<ArrowBackIcon />} size="large">
          Back to Home
      </Button>
    </Container>
  );
}
