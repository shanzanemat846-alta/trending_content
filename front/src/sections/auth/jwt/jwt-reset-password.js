'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { jwtDecode } from 'jwt-decode';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PasswordStrengthBar from 'react-password-strength-bar';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
// routes
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ResetPassword, ResetAuthNotify, SetAuthState } from 'src/app/lib/slices/auth-slice';
import { useSnackbar } from 'src/components/snackbar';

export default function ResetPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const {
    resetPasswordLoading,
    notifyMessage,
    notify,
    notifyType,
    passwordReset
  } = useAppSelector(state => state.auth);
  const resetPasswordToggle = useBoolean();
  const confirmPasswordToggle = useBoolean();
  const [errorMessage, setErrorMessage] = useState('');

  const [passwordMatch, setPasswordMatch] = useState(false);

  const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string().trim()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
      // .required('Password is required')
      // .test('password-strength', 'Password must be 8-30 characters long, include a lowercase, uppercase, number, and symbol', (value) => {
      //   if (!value) return false;
      //   return (
      //     value.length >= 8 &&
      //     value.length <= 30 &&
      //     /[a-z]/.test(value) &&
      //     /[A-Z]/.test(value) &&
      //     /[0-9]/.test(value) &&
      //     /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)
      //   );
      // }),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  });

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const {
    handleSubmit,
    watch,
  } = methods;

  useEffect(() => {
    if (notify && notifyMessage) {
      enqueueSnackbar(notifyMessage, { variant: notifyType });
      dispatch(ResetAuthNotify());
    }
  }, [notify, notifyMessage, notifyType]);

  useEffect(() => {
    if (passwordReset) {
      router.push(paths.auth.jwt.login);
      SetAuthState({ field: 'passwordReset', value: false });
    }
  }, [passwordReset]);

  useEffect(() => {
    const subscription = watch(({ password, confirmPassword }) => {
      setPasswordMatch(password === confirmPassword);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data) => {
    const { password } = data;
    const query = new URLSearchParams(window.location.search);

    if (query.get('token') === null) {
      enqueueSnackbar('Kindly Verify the Email Address', { variant: 'error' });
      return;
    }

    console.log('user id: here done ');
    const jwtToken = query.get('token');

    try {
      const decoded = jwtDecode(jwtToken);
      const { userId, exp } = decoded;
      const expirationTime = new Date(exp * 1000);
  
      if (expirationTime < new Date()) {
        enqueueSnackbar('Your link has expired!', { variant: 'error' });
        router.push(paths.auth.jwt.forgotPassword);
      } else if (userId) {
        dispatch(ResetPassword({ userId, token: jwtToken, password }));
      }
    } catch (error) {
      console.log(error.message)
      enqueueSnackbar(error.message || 'Invalid Token!', { variant: 'error' });
    }

    // const decoded = jwtDecode(jwtToken);
    // const { userId, exp } = decoded;
    // const expirationTime = new Date(exp * 1000);

    // console.log('user id: ', userId, exp);
    // if (expirationTime < new Date()) {
    //   router.push(paths.auth.jwt.forgotPassword);
    //   enqueueSnackbar('Your link has been expired!', { variant: 'error' });
    // } else if (userId) {
    //   dispatch(ResetPassword({ userId, token:jwtToken, password }));
    // }
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Reset Your Password</Typography>
      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">Remember your password?</Typography>
        <Link component={RouterLink} href={paths.auth.jwt.login} variant="subtitle2">
          Login
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <Box>
        <RHFTextField
          name="password"
          label="New Password"
          placeholder="Enter password"
          type={resetPasswordToggle.value ? 'text' : 'password'}
          helperText={errorMessage}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={resetPasswordToggle.onToggle} edge="end">
                  <Iconify icon={resetPasswordToggle.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <PasswordStrengthBar password={watch('password')} minLength={5} />
      </Box>
      <Box>
        <RHFTextField
          name="confirmPassword"
          label="Confirm Password"
          type={confirmPasswordToggle.value ? 'text' : 'password'}
          placeholder="Enter confirm password"
          // value={password}
          // onChange={(e) => {
          //   setPassword(e.target.value);
          //   validatePassword(e.target.value);
          // }}
          // helperText={errorMessage} 

          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={confirmPasswordToggle.onToggle} edge="end">
                  <Iconify icon={confirmPasswordToggle.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <LoadingButton
        color="primary"
        className="w-100"
        variant="contained"
        type="submit"
        loading={resetPasswordLoading}
        disabled={!passwordMatch}
      >
        Reset Password
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {renderHead}
      {renderForm}
    </FormProvider>
  );
}
