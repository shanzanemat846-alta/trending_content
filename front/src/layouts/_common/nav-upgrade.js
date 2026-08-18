// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
// routes
// components
import { useContext, useEffect } from 'react';
import { AuthContext } from 'src/auth/context/jwt/auth-context';
import { _mock } from 'src/_mock';
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { GetUserSubscriptionPlanDetail } from 'src/app/lib/slices/subscription-slice';

import { USERS_ROLE } from '../../utils/constants';

export default function NavUpgrade() {
  // const { user } = useMockedUser();
  const dispatch = useAppDispatch();

  const { 
    userProfileImageDetails,
  } = useAppSelector((state) => state.user);

  // side-bar
  const { 
    userSubscriptionPlanDetails
  } = useAppSelector((state) => state.subscription);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?._id) {
      dispatch(GetUserSubscriptionPlanDetail({ userId: user._id }));
    }
  }, [user]);

  return (
    <Stack
      sx={{
        // px: 2,
        // py: 5,
        textAlign: 'center',
        position: 'absolute',
        bottom:2,
        left: 0,
        right: 0,
        px:{xs:3, sm: 4},
        bgcolor:'#ffffff',
      }}
    >
      <Stack sx={{flexDirection:{ xs: 'row', sm: 'column'}, gridGap:{ xs: '16px', sm: '0px'}}} alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar
           src={userProfileImageDetails?.base64Image ? `data:${userProfileImageDetails.mimeType};base64,${userProfileImageDetails.base64Image}` : _mock.image.avatar(24)}
           alt={user?.displayName} 
           sx={{ width: 48, height: 48 }} 
          />
          {/* <Label
            color="success"
            variant="filled"
            sx={{
              top: -6,
              px: 0.5,
              left: 40,
              height: 20,
              position: 'absolute',
              borderBottomLeftRadius: 2,
            }}
          >
            Free
          </Label> */}
        </Box>

        <Stack spacing={0.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center'}, mt: 1.5, mb: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {`${user?.firstName || '' } ${  user?.lastName || ''}`}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.disabled' }}>
            {user?.email}
          </Typography>
        </Stack>
      </Stack>

      {user?.role === USERS_ROLE.USER ? 
        <Stack spacing={0.5} sx={{ marginLeft: '10px', marginRight: '10px', mb: 2  }}>
          <Box display="flex" sx={{gap:{ xs: '12px', sm: '12px'}, flexDirection: { xs: 'row', sm: 'row'}}} justifyContent="space-between">
            <Typography variant="subtitle2" noWrap>
              Available Credits:
            </Typography>
            <Typography variant="subtitle2" noWrap>
              {((userSubscriptionPlanDetails?.credits?.total || 0) - (userSubscriptionPlanDetails?.credits?.used || 0))?.toFixed(2)}
            </Typography>
          </Box>
        </Stack>
      : null}
     
    </Stack>
  );
}
