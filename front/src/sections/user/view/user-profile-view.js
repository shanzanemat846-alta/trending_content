'use client';

import { useState, useCallback, useContext, useEffect } from 'react';
import { isEmpty } from 'lodash';
// @mui
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import PasswordIcon from '@mui/icons-material/Password';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import KeyIcon from '@mui/icons-material/Key';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _userAbout, _userFeeds, _userFriends, _userGallery, _userFollowers } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { enqueueSnackbar } from 'src/components/snackbar';

import { AuthContext } from 'src/auth/context/jwt/auth-context';

import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';

import { SubscriptionView } from 'src/sections/subscriptionFlow/view';

import { GetMedia, DeleteMedia, UpdateUserDetail, UpdateMedia, SetUserState, ResetNotify } from 'src/app/lib/slices/user-slice';
import { GetUserSubscriptionPlanDetail, getContentCount } from 'src/app/lib/slices/subscription-slice';
//
import { USERS_ROLE } from 'src/utils/constants';
import ProfileHome from '../profile-home';
import ProfileCover from '../profile-cover';
import ProfileFollowers from '../profile-followers';
import UserChangePasswordForm from '../user-change-password-form';
import UserEditModal from '../user-edit-modal';
import UserChangeGlobalOpenAIKey from '../user-change-global-open-ai-key';
import AdminChangeApiKeys from '../admin-change-api-keys';
import AddOpenAIModel from '../add-open-ai-model';

import { SplitText } from '../../../utils/helpers';
// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'profile',
    label: 'Profile',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'password',
    label: 'Password',
    icon: <PasswordIcon />,
  },
  {
    value: 'subscription',
    label: 'Subscription',
    icon: <CardMembershipIcon />,
  },
  {
    value: 'globalAIKey',
    label: 'Global AI Key',
    icon: <KeyIcon />,
  },
  // {
  //   value: 'openAIKey',
  //   label: 'Open AI Keys',
  //   icon: <KeyIcon />,
  // },
  {
    value: 'openAIModels',
    label: 'OpenAI Models',
    icon: <KeyIcon />,
  }
];

// ----------------------------------------------------------------------

export default function UserProfileView() {
  const dispatch = useAppDispatch();

  const {
    userCoverImageDetails,
    userProfileImageDetails,
    notify: userNotify,
    notifyMessage: userNotifyMessage,
    notifyType: userNotifyType,
    profileImageUpdated,
    userDetails,
    updatePlanFromSaveContent
  } = useAppSelector((state) => state.user);
  const {
    userSubscriptionPlanDetails,
    getUserSubscriptionPlanLoading,
    contentCount
  } = useAppSelector((state) => state.subscription);

  const settings = useSettingsContext();
  const { user, updateUser } = useContext(AuthContext);

  const [imagePreview, setImagePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState();
  const [updateUserDetail, setUpdateUserDetail] = useState();
  const [currentTab, setCurrentTab] = useState('profile');
  const [tabsList, setTabsList] = useState(TABS);

  useEffect(() => {
    if (!isEmpty(userDetails)) {
      updateUser(userDetails);
    }
  }, [userDetails])

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleUpdateImage = ({ selectedFile, type }) => {
    if (selectedFile === null) {
      dispatch(DeleteMedia({ userId: user?._id, type }));
    } else {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("profileImage", selectedFile);

      dispatch(UpdateMedia({
        userId: user?._id,
        formData,
      }));
    }
  };

  const handleClearCover = () => {
    handleUpdateImage({ selectedFile: null, type: 'coverImage' });
  };

  const handleClearImage = () => {
    handleUpdateImage({ selectedFile: null, type: 'profileImage' });
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);

      handleUpdateImage({ selectedFile: file, type: 'coverImage' });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      handleUpdateImage({ selectedFile: file, type: 'profileImage' });
    }
  };

  const updateUserDetails = useCallback(
    ({ data }) => {
      dispatch(UpdateUserDetail({ updateParams: data, userId: user?._id }));
    },
    [dispatch, user]
  );

  useEffect(() => {
    if (user?.role === USERS_ROLE.ADMIN) {
      const filteredTabs = TABS.filter((tab) => !(tab.value === 'subscription' || tab.value === 'globalAIKey'));
      setTabsList(filteredTabs);
    }
    if (user._id && user?.role === USERS_ROLE.USER) {
      const filteredTabs = TABS.filter((tab) => !(tab.value === 'openAIKey' || tab.value === 'openAIModels'));
      setTabsList(filteredTabs);
      dispatch(GetUserSubscriptionPlanDetail({ userId: user._id }));
      dispatch(getContentCount({ userId: user._id }));
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) dispatch(GetMedia({ userId: user?._id, type: 'profileImage' }));
  }, [user]);

  useEffect(() => {
    if (user?._id) dispatch(GetMedia({ userId: user?._id, type: 'coverImage' }));
  }, [user]);

  useEffect(() => {
    if (
      !isEmpty(userCoverImageDetails.base64Image) &&
      !isEmpty(userCoverImageDetails.mimeType)
    ) {
      setCoverPreview(
        `data:${userCoverImageDetails.mimeType};base64,${userCoverImageDetails.base64Image}`
      );
    } else setCoverPreview(null);
  }, [userCoverImageDetails]);

  useEffect(() => {
    if (updatePlanFromSaveContent) {
      setCurrentTab('subscription')
    }
  }, [updatePlanFromSaveContent]);

  useEffect(() => {
    if (
      !isEmpty(userProfileImageDetails.base64Image) &&
      !isEmpty(userProfileImageDetails.mimeType)
    ) {
      setImagePreview(
        `data:${userProfileImageDetails.mimeType};base64,${userProfileImageDetails.base64Image}`
      );
    } else setImagePreview(null);
  }, [userProfileImageDetails]);

  useEffect(() => {
    if (profileImageUpdated) {
      dispatch(SetUserState({ field: 'profileImageUpdated', value: false }));
    }
  }, [profileImageUpdated]);

  useEffect(() => {
    if (userNotify && !isEmpty(userNotifyMessage)) {
      enqueueSnackbar(SplitText(userNotifyMessage), { variant: userNotifyType });
      dispatch(ResetNotify());
    }
  }, [userNotify, userNotifyMessage, userNotifyType]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          { name: 'Profile' },
          { name: `${user?.firstName || ''} ${user?.lastName || ''}` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card
        sx={{
          mb: 3,
          height: 290,
        }}
      >
        <ProfileCover
          role={user?.role}
          name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
          imagePreview={imagePreview}
          userProfileImageDetails={userProfileImageDetails}
          coverUrl={coverPreview}
          handleFileChange={handleFileChange}
          handleClearImage={handleClearImage}
          handleCoverChange={handleCoverChange}
          handleClearCover={handleClearCover}
          handleEditUserDetails={() => setUpdateUserDetail(true)}
        />

        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            position: 'absolute',
            bgcolor: 'background.paper',
            [`& .${tabsClasses.flexContainer}`]: {
              pr: { md: 3 },
              justifyContent: {
                sm: 'center',
                md: 'flex-end',
              },
            },
          }}
        >
          {tabsList.map((tab) => (
            <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Card>

      {currentTab === 'profile' && <ProfileHome 
        info={{
          creditLoading: getUserSubscriptionPlanLoading,
          role: user?.role,
          email: user?.email,
          contentCount,
          userSubscription: userSubscriptionPlanDetails?.subscriptionPlan,
          usedCredits: userSubscriptionPlanDetails?.credits?.used || 0, 
          totalCredits: userSubscriptionPlanDetails?.credits?.total || 0,
          freeCreditsDate: userSubscriptionPlanDetails?.freeCreditsDate
        }} posts={_userFeeds} />
      }

      {currentTab === 'subscription' && user?.role === USERS_ROLE.USER && <SubscriptionView />}

      {currentTab === 'password' && <UserChangePasswordForm currentUser={user} handleSubmitRequest={updateUserDetails} />}
      {currentTab === 'globalAIKey' && user?.role === USERS_ROLE.USER && <UserChangeGlobalOpenAIKey currentUser={user} />}
      {currentTab === 'openAIKey' && user?.role === USERS_ROLE.ADMIN && <AdminChangeApiKeys currentUser={user} />}
      {currentTab === 'openAIModels' && user?.role === USERS_ROLE.ADMIN && <AddOpenAIModel currentUser={user} />}

      {
        updateUserDetail ?
          <UserEditModal
            onOpen={updateUserDetail}
            onClose={() => setUpdateUserDetail(false)}
            user={user}
            onSubmit={() => { console.log('handle submit') }}
          />
          : null
      }
    </Container>
  );
}
