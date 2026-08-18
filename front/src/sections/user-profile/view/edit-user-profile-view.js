'use client';

import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSnackbar } from 'src/components/snackbar';
// redux hooks
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { GetUserDetail, ResetNotify, UpdateUserDetail } from 'src/app/lib/slices/user-slice';
import { useAuthContext } from 'src/auth/hooks';

import { SplitText } from 'src/utils/helpers';

import EditUserDetailsForm from '../user-details-form';

export default function EditUserProfileView({ id }) {
  const dispatch = useAppDispatch();
  const { updateUser } = useAuthContext();

  const {
    userDetails,
    notifyType,
    notifyMessage,
    notify,
    updateUserLoading,
    getUserLoading,
  } = useAppSelector((state) => state.user);

  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [currentUser, setCurrentUser] = useState({});

  const getUserDetails = useCallback(
    ({ userId }) => {
      console.log('\n\n user id: ', userId);
      dispatch(GetUserDetail({ userId }));
    },
    [dispatch]
  );

  const updateUserDetails = useCallback(
    ({ data }) => {
      dispatch(UpdateUserDetail({ updateParams: data, userId: id }));
    },
    [dispatch, id]
  );

  useEffect(() => {
    if (id) {
      getUserDetails({ userId: id });
    }
  }, [id, getUserDetails]);

  useEffect(() => {
    if (!isEmpty(userDetails)) {
      setCurrentUser(userDetails);
      updateUser(userDetails);
    }
    else setCurrentUser({});
  }, [userDetails])

  useEffect(() => {
    if (notify && notifyMessage) {
      console.log('\n\n enqueueSnackbar: ', notifyType);
      if (notifyType === 'error' ) {
         enqueueSnackbar(SplitText(notifyMessage) || 'Server error', { variant:'error'  });
      } else if (notifyType === 'success' ) {
        enqueueSnackbar(SplitText(notifyMessage));
     }
      dispatch(ResetNotify());
    }
  }, [notifyType, notifyMessage, notify, enqueueSnackbar, dispatch]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[{
          name: 'Dashboard',
          href: paths.dashboard.root,
        }, {
          name: 'User',
          href: paths.dashboard.user.root,
        }, {
          name: currentUser?.name
        }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {getUserLoading || updateUserLoading ? <LoadingScreen sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999
        }} /> : null }
      <EditUserDetailsForm currentUser={currentUser} handleSubmitRequest={updateUserDetails} />

    </Container>
  );
}

EditUserProfileView.propTypes = {
  id: PropTypes.string,
};
