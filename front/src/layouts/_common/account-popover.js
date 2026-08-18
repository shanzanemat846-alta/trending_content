'use Client';

import { m } from 'framer-motion';
import { useContext, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// hooks
// auth
import { useAuthContext } from 'src/auth/hooks';

import { AuthContext } from 'src/auth/context/jwt/auth-context';
// components
import { varHover } from 'src/components/animate';
import { useSnackbar } from 'src/components/snackbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { GetMedia } from 'src/app/lib/slices/user-slice';

import { _mock } from 'src/_mock';
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter();

  const { 
    userProfileImageDetails
  } = useAppSelector((state) => state.user);

  const dispatch = useAppDispatch();
  // const { user } = useMockedUser();
  
  // const { user } = useMemo();
  const { user } = useContext(AuthContext);
  
  const { logout } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const popover = usePopover();

  const handleProfileClick = () => {
    router.push(paths.dashboard.user.root)
    popover.onClose()
  }

  const handleLogout = async () => {
    try {
      await logout();

      popover.onClose();
      // router.replace('/');
       router.push(paths.auth.jwt.login);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };
 
  useEffect(() => {
    if (user) {
      dispatch(GetMedia({ userId: user?._id, type: 'profileImage' }));
    }
  }, [user]);

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src={userProfileImageDetails?.base64Image ? `data:${userProfileImageDetails.mimeType};base64,${userProfileImageDetails.base64Image}` : _mock.image.avatar(24)}
          alt={user?.firstName}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {user?.firstName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5, cursor: "pointer" }} onClick={() => { router.push(paths.dashboard.user.root); popover.onClose(); }}>
          <Typography variant="subtitle2" noWrap>
            {`${user?.firstName || ''} ${user?.lastName || ''}`}
          </Typography>

          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 1 }}>
          <MenuItem
            onClick={handleProfileClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Profile
          </MenuItem>
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack> */}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  );
}
