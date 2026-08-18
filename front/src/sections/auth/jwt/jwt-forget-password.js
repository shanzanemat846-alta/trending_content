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
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import { ForgotPassword, ResetAuthNotify } from 'src/app/lib/slices/auth-slice';

export default function JwtForgetPassword() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const {
    forgetPasswordLoading,
    notifyMessage,
    notify,
    notifyType
  } = useAppSelector(state => state.auth);
 
  const ForgetPasswordSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const methods = useForm({
    resolver: yupResolver(ForgetPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setError,
  } = methods;

  const onSubmit = async (data) => {
    console.log('data: ', data);
    const { email } = data;
    dispatch(ForgotPassword({ email }));
  };

  useEffect(() => {
    if (notify && notifyMessage) {
      enqueueSnackbar(notifyMessage, { variant: notifyType });
      dispatch(ResetAuthNotify());
    }
  }, [notify, notifyMessage, notifyType]);

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
      <Alert severity="warning" icon={false} marginBottom="26px">
        Enter your email and instructions will be sent to you!
      </Alert>
      <Box className="auth-content-top">
        <RHFTextField name="email" label="Email Address" placeholder="Enter email address" />
      </Box>
      <LoadingButton
        size="large"
        color="inherit"
        variant="contained"
        type="submit"
        loading={forgetPasswordLoading}
      >
        Send
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
