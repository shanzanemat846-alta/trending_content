import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import SyncIcon from '@mui/icons-material/Sync';
import Tooltip from '@mui/material/Tooltip';
// utils
// routes
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { fDate } from 'src/utils/format-time';
import Button from '@mui/material/Button';
// import EastIcon from '@mui/icons-material/East';
import { useBoolean } from 'src/hooks/use-boolean';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import CommentIcon from '@mui/icons-material/Comment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';
import RedditIcon from '@mui/icons-material/Reddit';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { ConfirmDialog } from 'src/components/custom-dialog';

import { checkCreditAvailable } from '../../utils/helpers';

import { SUBSCRIPTION_PLANS } from '../../utils/constants';
// ----------------------------------------------------------------------

export default function JobItem({
  job,
  disabled,
  onView,
  onEdit,
  onDelete,
  userPlan,
  credits
}) {
  const popover = usePopover();

  // const { id, title, company, createdAt, candidates, experience, employmentTypes, salary, role } =  job;
  const { platforms, title, mode, date } = job;
  const [isHovered, setIsHovered] = useState(false);
  const confirm = useBoolean();

  const handleClick = () => {
    // if (showSplashd) {
    onView();
    // }
  };

  const getLabelFromMode = (label, config) => {
    if (!config) return `${label}: 0`;

    const { min = 0, max = 0, mode: modeVal = "" } = config;

    switch (modeVal) {
      case "range":
        return `${label}: ${min} - ${max}`;
      case "upto":
        return `${label}: Upto ${max}`;
      case "morethan":
        return `${label}: More than ${min}`;
      default:
        return `${label}: 0`;
    }
  };

  const details = [
    // Reddit Section
    {
      label: "Reddit",
      icon: <RedditIcon color="error" sx={{ fontSize: 20 }} />,
      // items: [
      //   { label: `Min UpVotes : ${(platforms?.reddit?.upVotes || 0)}`, icon: <ThumbUpIcon width={16} sx={{ flexShrink: 0 }} /> },
      //   { label: `Min Comments : ${(platforms?.reddit?.comments || 0)}`, icon: <CommentIcon width={16} sx={{ flexShrink: 0 }} /> },
      //   { label: `Threads : ${(platforms?.reddit?.threads || 0)}`, icon: <DynamicFeedIcon width={16} sx={{ flexShrink: 0 }} /> }
      // ]
      items: [
      {
        label: getLabelFromMode("UpVotes", platforms?.reddit?.upVotes),
        icon: <ThumbUpIcon width={16} sx={{ flexShrink: 0 }} />
      },
      {
        label: getLabelFromMode("Comments", platforms?.reddit?.comments),
        icon: <CommentIcon width={16} sx={{ flexShrink: 0 }} />
      },
      {
        label: getLabelFromMode("Threads", platforms?.reddit?.threads),
        icon: <DynamicFeedIcon width={16} sx={{ flexShrink: 0 }} />
      }
    ]
    },
    // YouTube Section
    {
      label: "YouTube",
      icon: <YouTubeIcon color="error" sx={{ fontSize: 20 }} />,
      items: [
      {
        label: getLabelFromMode("Likes", platforms?.youtube?.likes),
        icon: <ThumbUpIcon width={16} sx={{ flexShrink: 0 }} />
      },
      {
        label: getLabelFromMode("Comments", platforms?.youtube?.comments),
        icon: <CommentIcon width={16} sx={{ flexShrink: 0 }} />
      },
      {
        label: getLabelFromMode("Views", platforms?.youtube?.views),
        icon: <VisibilityIcon width={16} sx={{ flexShrink: 0 }} />
      }
    ]
      // items: [
      //   { label: `Min Likes :${(platforms?.youtube?.likes || 0)}`, icon: <ThumbUpIcon width={16} sx={{ flexShrink: 0 }} /> },
      //   { label: `Min Comments :${(platforms?.youtube?.comments || 0)}`, icon: <CommentIcon width={16} sx={{ flexShrink: 0 }} /> },
      //   { label: `Views : ${(platforms?.youtube?.views || 0)}`, icon: <VisibilityIcon width={16} sx={{ flexShrink: 0 }} /> },
      // ]
    },
    {
      label: "Twitter",
      icon: <TwitterIcon color="error" sx={{ fontSize: 20, mb: 1 }} />,
      items: [
        { label: `Min Likes :'${(platforms?.twitter?.likeCount || 0)}`, icon: <ThumbUpIcon width={16} sx={{ flexShrink: 0 }} /> },
        { label: `Min Comments :${(platforms?.twitter?.comments || 0)}`, icon: <CommentIcon width={16} sx={{ flexShrink: 0 }} /> },
        { label: `Re Tweets : ${(platforms?.twitter?.reTweets || 0)}`, icon: <VisibilityIcon width={16} sx={{ flexShrink: 0 }} /> },
      ]
    }
  ];

  const presentPlatform = details.filter((platform) => platforms[platform.label.toLowerCase()]);

  const { isCreditUnavailable, errorMessage: creditsErrorMessage } = useMemo(() => checkCreditAvailable({
    platforms,
    credits
  }), [
    platforms,
    credits
  ]);

  let tooltipMessage = "Resync the threads";
  if (userPlan === SUBSCRIPTION_PLANS.FREE || userPlan === SUBSCRIPTION_PLANS.STARTER) {
    tooltipMessage = "Please subscribe to our Advanced package to unlock this feature";
  } else if (isCreditUnavailable) {
    tooltipMessage = creditsErrorMessage;
  }
  return (
    <>
      <Card>
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        <Stack sx={{ p: 3, pb: 2 }}>
          <Tooltip title={title.length > 30 ? title : null} placement="top">
          <ListItemText
            sx={{ mb: 1 }}
            primary={
              <Typography variant="subtitle2" style={{ fontSize: '20px', height: '32px'}}>
                {title.length > 30 ? `${title.substring(0, 30)}...` : title}
              </Typography>
            }
            secondary={`Created date: ${fDate(date)}`}
            primaryTypographyProps={{
              typography: 'subtitle1',
            }}
            secondaryTypographyProps={{
              mt: 1,
              component: 'span',
              typography: 'caption',
              color: 'text.disabled',
            }}
            />
            </Tooltip>

          <Stack
            spacing={0.5}
            direction="row"
            alignItems="center"
            sx={{ color: 'primary.main', typography: 'caption' }}
          >
            {/* <Iconify width={16} icon="solar:users-group-rounded-bold" /> */}
            {mode?.type}
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box rowGap={1.5} gap={2} display="grid" gridTemplateColumns="repeat(2, 1fr)" sx={{ p: 3}}>
          {presentPlatform?.map((platform) => (
            <Box key={platform.label} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                {platform.icon}
                <Typography variant="subtitle2">{platform.label}</Typography>
              </Stack>
              {platform.items.map((item, index) => (
                <Stack
                  key={index}
                  spacing={0.5}
                  flexShrink={0}
                  direction="row"
                  alignItems="center"
                  sx={{ color: 'text.disabled', minWidth: 0 }}
                >
                  {item.icon}
                  <Typography variant="caption">
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            paddingRight: 2,
            marginBottom: 1
          }}
        >
        <Tooltip
          title={tooltipMessage}
          disableInteractive
          >
          <span>
            <IconButton
              disabled={disabled || (userPlan === SUBSCRIPTION_PLANS.FREE || userPlan === SUBSCRIPTION_PLANS.STARTER) || isCreditUnavailable}
              onClick={() => { handleClick() }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              sx={{
                cursor: 'pointer',
                color: isHovered ? 'inherit' : 'default',
              }}
            >
              <SyncIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Click to edit the campaign">
          <span>
            <IconButton
              disabled={disabled}
              onClick={() => { onEdit() }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              sx={{
                cursor: 'pointer',
                color: isHovered ? 'inherit' : 'default',
              }}
            >
              <ReplyAllIcon />
            </IconButton>
          </span>
          </Tooltip>
        </Box>
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> Campaign and threads </strong> ?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDelete();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            popover.onClose();
            onEdit();
          }}
        >
          <SettingsIcon />
          Setting
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            popover.onClose();
            confirm.onTrue();
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

JobItem.propTypes = {
  job: PropTypes.object,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
  disabled: PropTypes.bool,
};
