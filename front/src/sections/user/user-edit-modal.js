import React, { useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import LoadingButton from '@mui/lab/LoadingButton';

import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';

import { SetUserState, UpdateUserDetail } from 'src/app/lib/slices/user-slice';

import FormProvider, { RHFTextField } from 'src/components/hook-form';

const UserProfileForm = ({ user, onOpen, onClose }) => {
  const dispatch = useAppDispatch();

  const { userUpdated, updateUserLoading } = useAppSelector((state) => state.user);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const defaultValues = useMemo(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  }), [user]);

  const UserSchema = Yup.object().shape({
    firstName: Yup.string().trim().required('First Name is required'),
    lastName: Yup.string().trim().required('Last Name is required'),
    email: Yup.string().trim().required('Email is required').email('Invalid email format'),
  });

  const methods = useForm({
    resolver: yupResolver(UserSchema),
    defaultValues,
  });

  const {
    reset,
    formState: { errors },
    handleSubmit,
    watch
  } = methods;

  const formValues = watch();

  const onSubmit = handleSubmit(async (data) => {
    dispatch(UpdateUserDetail({ updateParams: data, userId: user._id }));
  });

  useEffect(() => {
    if (userUpdated) {
      reset(defaultValues);
      dispatch(SetUserState({ field: 'userUpdated', value: false }));
      onClose();
    }
  }, [userUpdated]);

  useEffect(() => {
    const hasChanges = Object
      .keys(defaultValues)
      .some((key) => key !== 'currentPassword' && formValues[key] !== defaultValues[key]);

    setIsButtonDisabled(!hasChanges);
  }, [formValues, defaultValues]);

  return (
    <Modal open={onOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography id="form-modal-title" variant="h6" component="h2">
          User Profile
        </Typography>

        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 2,
            }}
          >
            <RHFTextField
              disabled={Boolean(user)}
              name="email"
              label="Email Address"
            />
            <RHFTextField name="firstName" label="First Name" />
            <RHFTextField name="lastName" label="Last Name" />
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              marginTop: 'auto',
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                mt: 4,
                pt: 2,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <LoadingButton type="button" variant="outlined" onClick={onClose} sx={{ width: "48%" }}>
                Cancel
              </LoadingButton>

              <LoadingButton
                type="submit"
                variant="contained"
                color="success"
                loading={updateUserLoading}
                disabled={isButtonDisabled}
                sx={{ width: "48%" }}
              >
                Save Changes
              </LoadingButton>
            </Box>
          </Box>
        </FormProvider>
      </Box>
    </Modal>
  );
};

export default UserProfileForm;
