'use client';

import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Paper } from '@mui/material';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';

import { SetUserState, UpdateUserDetail } from 'src/app/lib/slices/user-slice';

export default function UserNewEditForm({ currentUser }) {
  const dispatch = useAppDispatch();

  const { userUpdated, updateUserLoading } = useAppSelector((state) => state.user);

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [changeInProfile, setChangeInProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleClickShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const getUserSchema = (currentUserDetails) => {
    if (!currentUserDetails) {
      return Yup.object().shape({
        password: Yup.string()
          .required('Password is required')
          .min(6, 'Password must be at least 6 characters'),
        confirmPassword: Yup.string()
          .required('Confirm Password is required')
          .oneOf([Yup.ref('password')], 'Passwords must match'),
      });
    }

    if (!currentUserDetails.password && currentUserDetails.loginWithGoogle) {
      return Yup.object().shape({
        newPassword: Yup.string()
          .notRequired()
          .test(
            'minLength',
            'Password must be at least 6 characters',
            (value) => !value || value.length >= 6
          ),
        confirmPassword: Yup.string()
          .notRequired()
          .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
      });
    }

    return Yup.object().shape({
      newPassword: Yup.string()
        .notRequired()
        .test(
          'minLength',
          'Password must be at least 6 characters',
          (value) => !value || value.length >= 6
        ),
      confirmPassword: Yup.string()
        .notRequired()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
      currentPassword: Yup.string()
        .when('newPassword', {
          is: (val) => val !== '' && val !== null,
          then: (schema) => schema.required('Current Password is required to set a new password'),
          otherwise: (schema) => schema.notRequired(),
        }),
    });
  };

  const UserSchema = useMemo(() => getUserSchema(currentUser), [currentUser]);

  const defaultValues = useMemo(() => {
    const values = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    return values;
  }, [currentUser]);

  const methods = useForm({
    resolver: yupResolver(UserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
  } = methods;

  const formValues = watch();

  useEffect(() => {
    const hasChanges = Object
      .keys(defaultValues)
      .some((key) => key !== 'currentPassword' && formValues[key] !== defaultValues[key]);

    setIsButtonDisabled(!hasChanges);
  }, [formValues, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    if (!isButtonDisabled) {
      const payload = { ...data };

      if (currentUser) {
        if (!payload.newPassword) {
          delete payload.newPassword;
          delete payload.confirmPassword;
          delete payload.currentPassword;
        }
      } else {
        console.log('Add user request')
      }
      dispatch(UpdateUserDetail({ updateParams: payload, userId: currentUser._id }));
    }
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (userUpdated) {
      reset(defaultValues);
      dispatch(SetUserState({ field: 'userUpdated', value: false }));
    }
  }, [userUpdated]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Paper
        elevation={3}
        style={{
          padding: '16px',
          borderRadius: '8px',
        }}
      >
        <Grid
          container
          spacing={3}
          alignItems="center"
        >
          <Grid item xs={12} md={10} style={{ marginTop: '14px' }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
            >
              <>
                <RHFTextField
                  name="currentPassword"
                  label="Current Password"
                  type={showPassword.currentPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('currentPassword')}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword.currentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <RHFTextField
                  name="newPassword"
                  label="New Password"
                  type={showPassword.newPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('newPassword')}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <RHFTextField
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('confirmPassword')}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={updateUserLoading}
                disabled={isButtonDisabled && !changeInProfile}
              >
                Update Password
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </FormProvider>
  );
};
