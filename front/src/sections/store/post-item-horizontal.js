import PropTypes from 'prop-types';
// @mui
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// utils
import { fDateTime } from 'src/utils/format-time';

// components

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import TextMaxLine from 'src/components/text-max-line';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { HOST_API } from 'src/config-global';
import { useAppDispatch, useAppSelector } from "src/app/lib/hooks";

// ----------------------------------------------------------------------

export default function PostItemHorizontal({ post, onDelete }) {

    const { userSubscriptionPlanDetails } = useAppSelector((state) => state.subscription);

  const popover = usePopover();

  const router = useRouter();

  const {
    // publish,
    // coverUrl,
    _id,
    title,
    image,
    date,
  } = post;

  const renderImages = (
    <Stack
      spacing={0.5}
      direction="row"
      sx={{
        p: (theme) => theme.spacing(1, 1, 0, 1),
      }}
    >
      <Stack flexGrow={1} sx={{ position: 'relative' }}>
        {/* {renderPrice}
        {renderRating} */}
        <Image
          alt="images[0]"
          src={
            image === 'empty'
              ? `${HOST_API}/api/file/${_id}?${Date.now()}`
              : image
          }
          onClick={() => {
            router.push(paths.dashboard.tour.store.details(_id));
          }}
          sx={{ borderRadius: 1, height: 164, width: 1, cursor: 'pointer' }}
        />
      </Stack>
    </Stack>
  );

  const truncateTextFromStart = (text, maxLength) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  };

  const renderTexts = (
    <>
      <ListItemText
        sx={{
          p: (theme) => theme.spacing(2.5, 2.5, 2, 2.5),
        }}
        primary={`Created date: ${fDateTime(date)}`}
        secondary={
          <Link
            onClick={() => {
              router.push(paths.dashboard.tour.store.details(_id));
            }}
            color="inherit"
            style={{ cursor: 'pointer' }}
          >
            <TextMaxLine variant="subtitle2" line={1}>
              {truncateTextFromStart(title, 60)}
            </TextMaxLine>
          </Link>
        }
        primaryTypographyProps={{
          typography: 'caption',
          color: 'text.disabled',
        }}
        secondaryTypographyProps={{
          mt: 1,
          noWrap: true,
          component: 'span',
          color: 'text.primary',
          typography: 'subtitle1',
        }}
      />
      <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', bottom: 20, right: 8 }}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </>
  );

  return (
    <>
      <Card>
        {renderImages}

        {renderTexts}
      </Card>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="bottom-center"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(paths.dashboard.tour.store.details(_id));
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(paths.dashboard.tour.store.edit(_id));
          }}
          disabled={userSubscriptionPlanDetails?.subscriptionPlan === 'free'}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
}

PostItemHorizontal.propTypes = {
  post: PropTypes.shape({
    date: PropTypes.instanceOf(Date),
    _id: PropTypes.string,
    title: PropTypes.string,
    image: PropTypes.string,
  }),
  onDelete: PropTypes.func,
};
