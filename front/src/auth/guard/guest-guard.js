'use client'

import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { USERS_ROLE } from 'src/utils/constants';
//
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

export default function GuestGuard({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { authenticated, user } = useAuthContext();

  const returnToValue = searchParams.get('returnTo');

  console.log('here in the re direct : returnToValue',returnToValue);
  let returnTo = returnToValue || user?.role === USERS_ROLE.ADMIN ? paths.dashboard.user.list : paths.dashboard.root;
  console.log('here in the re direct returnTo: ',returnTo);

  if (returnTo.includes('/user/list') && user?.role === USERS_ROLE.USER) returnTo = paths.dashboard.root;
  if (user?.role === USERS_ROLE.ADMIN) returnTo = paths.dashboard.user.list;
  
  const check = useCallback(() => {
    if (authenticated) {
      router.replace(returnTo);
    }
  }, [authenticated, returnTo, router]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

GuestGuard.propTypes = {
  children: PropTypes.node,
};
