import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
//

// ----------------------------------------------------------------------

export default function NavDesktop({ offsetTop}) {
  return (
    <Stack component="nav" direction="row" spacing={5} sx={{ mr: 2.5, height: 1 }}>
      {}
    </Stack>
  );
}

NavDesktop.propTypes = {
  offsetTop: PropTypes.bool,
};
