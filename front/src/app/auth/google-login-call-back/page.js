'use client';

import { useEffect } from 'react';

import { paths } from 'src/routes/paths';

import { useAuthContext } from 'src/auth/hooks';
import { SplashScreen } from 'src/components/loading-screen';
import { enqueueSnackbar } from 'src/components/snackbar';
import { useSearchParams, useRouter } from 'src/routes/hooks';

import { PATH_AFTER_LOGIN } from 'src/config-global';

const GoogleLoginRedirectLoadingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { googleLogin } = useAuthContext();

  const returnTo = searchParams.get('returnTo');

  const handleGoogleLogin = async ({ userId }) => {
    try {
      await googleLogin({ userId });
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      enqueueSnackbar('Error in saving user!', { variant: 'error' });
      router.push(paths.auth.jwt.login);
    }
  };

  useEffect(() => {
    const userId = searchParams.get('userId'); // Fetch the `userId` from the URL

    console.log('here the userid : ', userId)

    if (userId) {
      handleGoogleLogin({ userId })
    } else {
      enqueueSnackbar('Error in SSO with Google!', { variant: 'error' });
      router.push(paths.auth.jwt.login);
    }
  }, [])
  
  return (
     <SplashScreen />
  )
};

export default GoogleLoginRedirectLoadingPage;
