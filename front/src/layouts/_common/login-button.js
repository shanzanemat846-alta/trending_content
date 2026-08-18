import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
// routes
import { RouterLink } from 'src/routes/components';
// config
import { ADMIN_PATH_AFTER_LOGIN, PATH_AFTER_LOGIN } from 'src/config-global';
import { useAuthContext } from 'src/auth/hooks';
import { USERS_ROLE } from 'src/utils/constants';
// ----------------------------------------------------------------------

export default function LoginButton({ sx }) {
  const { user } = useAuthContext();

  return (
    <Button component={RouterLink}
      href={user?.role === USERS_ROLE.ADMIN ? ADMIN_PATH_AFTER_LOGIN : PATH_AFTER_LOGIN} 
      variant="outlined"
       sx={{ mr: 1, ...sx }}
       >
      Login
    </Button>
  );
}

LoginButton.propTypes = {
  sx: PropTypes.object,
};
