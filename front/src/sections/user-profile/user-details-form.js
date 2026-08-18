'use client';

import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {Divider, Paper} from '@mui/material';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { registerRoute, host } from 'src/utils/APIRoutes';
import ProfileImageUpload from 'src/components/profileImageUpload/profile-image-upload';

import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';

import { SetUserState, UpdateMedia, GetMedia, DeleteMedia } from 'src/app/lib/slices/user-slice';

export default function  UserNewEditForm({ currentUser, handleSubmitRequest }) {
  const dispatch = useAppDispatch();
  
  const { userProfileImageDetails, profileImageUpdated } = useAppSelector((state) => state.user);

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
        firstName: Yup.string().trim().required('First Name is required'),
        lastName: Yup.string().trim().required('Last Name is required'),
        email: Yup.string().trim().required('Email is required').email('Invalid email format'),
        password: Yup.string().trim()
          .required('Password is required')
          .min(6, 'Password must be at least 6 characters'),
        confirmPassword: Yup.string().trim()
          .required('Confirm Password is required')
          .oneOf([Yup.ref('password')], 'Passwords must match'),
      });
    }
  
    if (!currentUserDetails.password && currentUserDetails.loginWithGoogle) {
      return Yup.object().shape({
        firstName: Yup.string().trim().required('First Name is required'),
        lastName: Yup.string().trim().required('Last Name is required'),
        email: Yup.string().trim().required('Email is required').email('Invalid email format'),
        newPassword: Yup.string().trim()
          .notRequired()
          .test(
            'minLength',
            'Password must be at least 6 characters',
            (value) => !value || value.length >= 6
          ),
        confirmPassword: Yup.string().trim()
          .notRequired()
          .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
      });
    }
  
    return Yup.object().shape({
      firstName: Yup.string().trim().required('First Name is required'),
      lastName: Yup.string().trim().required('Last Name is required'),
      email: Yup.string().trim().required('Email is required').email('Invalid email format'),
      newPassword: Yup.string().trim()
        .notRequired()
        .test(
          'minLength',
          'Password must be at least 6 characters',
          (value) => !value || value.length >= 6
        ),
      confirmPassword: Yup.string().trim()
        .notRequired()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
      currentPassword: Yup.string().trim()
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
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      globalOpenAIKey: currentUser?.globalOpenAIKey || '',
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
    formState: { isSubmitting },
    watch,
  } = methods;

  const formValues = watch();

  useEffect(() => {
    const hasChanges = Object
    .keys(defaultValues)
    .some((key) =>  key !== 'currentPassword' && formValues[key] !== defaultValues[key]);

    setIsButtonDisabled(!hasChanges);
  }, [formValues, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    if (changeInProfile) {
      if (selectedFile === null) {
        dispatch(DeleteMedia({  userId: currentUser._id, type: 'profileImage' }));
      } else {
        const formData = new FormData();
        formData.append("type", 'profile');
        formData.append("profileImage", selectedFile);
  
        dispatch(UpdateMedia({
          userId: currentUser._id,
          formData,
        }));
      }
    }

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

      handleSubmitRequest({ data: payload })
    }
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (profileImageUpdated) {
      dispatch(SetUserState({ field: 'profileImageUpdated', value: false }));
      dispatch(GetMedia({ userId: currentUser._id, type: 'profileImage' }));
      setChangeInProfile(false);
    }
  }, [profileImageUpdated]);


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
        <Grid item xs={12} md={2} style={{ textAlign: 'center' }}>
            <ProfileImageUpload 
              setSelectedFile={setSelectedFile}
              setChangeInProfile={setChangeInProfile}
              userProfileImageDetails={userProfileImageDetails} 
            />
        </Grid>

        <Grid item xs={12} md={10} style={{ marginTop: '14px' }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              }}
            >
              <RHFTextField
                disabled={Boolean(currentUser)}
                name="email"
                label="Email Address"
              />
              <RHFTextField name="firstName" label="First Name" />
              <RHFTextField name="lastName" label="Last Name" />
              {currentUser ? (
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
              ) : (
                <>
                  <RHFTextField
                    name="password"
                    label="Password"
                    type={showPassword.password ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleClickShowPassword('password')}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword.password ? <VisibilityOff /> : <Visibility />}
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
              )}
            </Box>
            <Divider style={{ marginTop: '20px' }} />
            <Box sx={{ mt: 3 }}>
              <RHFTextField name="globalOpenAIKey" label="Global OpenAI Key" autoComplete="off" />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={isButtonDisabled && !changeInProfile}
              >
                {!currentUser ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
        </Grid>
      </Grid>
      </Paper>
    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.shape({
    _id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    globalOpenAIKey: PropTypes.string,
  }),
  handleSubmitRequest: PropTypes.func
};
