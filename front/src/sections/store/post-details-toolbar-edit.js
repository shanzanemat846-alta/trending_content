import PropTypes from 'prop-types';
// @mui

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
// routes
import { RouterLink } from 'src/routes/components';
// components
import Iconify from 'src/components/iconify';

import { useAppSelector } from "src/app/lib/hooks";


// ----------------------------------------------------------------------

export default function PostDetailsToolbarEdit({ editLink, sx, ...other }) {
  const { userSubscriptionPlanDetails } = useAppSelector((state) => state.subscription);
  const isFreePlan = userSubscriptionPlanDetails?.subscriptionPlan === 'free';

  return (
    <>
      <Stack
        spacing={1.5}
        direction="row"
        sx={{
          mb: { xs: 0.5, md: 1 },
          ...sx,
        }}
        {...other}
      >
        {/* <Button
          component={RouterLink}
          href={backLink}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
        >
          Back
        </Button> */}

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={isFreePlan ? "Upgrade your plan to edit" : "Edit"}>
          <span>
            <IconButton 
              component={isFreePlan ? 'span' : RouterLink} 
              href={isFreePlan ? undefined : editLink}
              disabled={isFreePlan}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </>
  );
}

PostDetailsToolbarEdit.propTypes = {
  backLink: PropTypes.string,
  editLink: PropTypes.string,
  sx: PropTypes.object,
};
