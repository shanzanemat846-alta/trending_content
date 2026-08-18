'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useSearchParams, useRouter } from 'src/routes/hooks';
import GoogleLoginButton from 'src/components/google-login-button/google-login-button';
// config
import { ADMIN_PATH_AFTER_LOGIN, PATH_AFTER_LOGIN } from 'src/config-global';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { USERS_ROLE } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { login, verifyUser, accessToken, user } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  console.log('login user details : ', user);

  const [errorMsg, setErrorMsg] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState(null);

  const userToken = searchParams.get('token');
  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const handleVerification = async () => {
      if (userToken) {
        const response = await verifyUser(userToken);
        if (response.status) {
          setVerificationStatus('success');
          setVerificationMessage(response.message || 'Your email has been successfully verified.');
        } else {
          setVerificationStatus('error');
          setVerificationMessage(response.errors || 'Verification failed.');
        }
      }
    };

    handleVerification();
  }, [userToken, verifyUser]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login?.(data.email, data.password);
      // localStorage.setItem("projectID", "");
      localStorage.setItem("image", "");
      localStorage.setItem("chatTitle", "");
      localStorage.setItem("chatpreprompt", "");
      localStorage.setItem('chatID', '');

      // console.log('role : ', user?.role === USERS_ROLE.ADMIN, user?.role, USERS_ROLE.ADMIN)
      // if (user?.role === USERS_ROLE.ADMIN) router.push(ADMIN_PATH_AFTER_LOGIN);
      // else router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  useEffect(() => {
    console.log('here first render: ', accessToken);

    if (accessToken) {
      console.log('here the response: ', accessToken, 'user present');
    }
  }, []);

  useEffect(() => {
    console.log('here the searchParams: ', searchParams);
  }, [searchParams]);

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign in to Trending Content</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">New user?</Typography>

        <Link component={RouterLink} href={paths.auth.jwt.register} variant="subtitle2">
          Create an account
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      {verificationMessage && (
        <Alert severity={verificationStatus} onClose={() => setVerificationMessage(null)}>
          {verificationMessage}
        </Alert>
      )}

      <RHFTextField name="email" label="Email address" />

      <RHFTextField
        name="password"
        label="Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Link variant="body2"
        color="inherit"
        underline="always"
        sx={{ 
          alignSelf: "flex-end", 
          cursor: "pointer",
          "&:hover": { cursor: "pointer" }
        }}
        onClick={() => router.push(paths.auth.jwt.forgotPassword)}
      >
        Forgot password?
      </Link>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <div>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderHead}

        {/* <Alert severity="info" sx={{ mb: 3 }}>
        Use email : <strong>jared@gmail.com</strong> / password :<strong> hgsy11681610227</strong>
      </Alert> */}

        {renderForm}
      </FormProvider>

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px' }}>
        <GoogleLoginButton />
      </div>
    </div>
  );
}
