import PropTypes from 'prop-types';
import { useCallback} from 'react';

// @mui
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import MenuItem from '@mui/material/MenuItem';
import Iconify from 'src/components/iconify';
// utils
import { fDateTime } from 'src/utils/format-time';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';


// ----------------------------------------------------------------------

export default function ChatNavItem({ selected, collapse, conversation, onCloseMobile , projectID}) {

  const mdUp = useResponsive('up', 'md');

  const router = useRouter();
 
  const  displayName = conversation.title;
  
  const { date } = conversation;

  const popover = usePopover();
// new 
 
  const handleClickConversation = useCallback(async () => {
    try {
      if (!mdUp) {
        onCloseMobile();
      }

      // await clickConversation(conversation.id);
      localStorage.setItem("chatTitle", displayName);
      router.push(`${paths.dashboard.tour.chatgpt(projectID)}?id=${conversation._id}`);
    } catch (error) {
      console.error(error);
    }
  }, [ mdUp, onCloseMobile, router, conversation._id, displayName, projectID]);

 

  return (
    <ListItemButton
      disableGutters
      onClick={handleClickConversation}
      sx={{
        py: 1.5,
        px: 2.5,
        ...(selected && {
          bgcolor: 'action.selected',
        }),
      }}
    >
    

      {!collapse && (
        <>
          <ListItemText
            sx={{ ml: 2 }}
            primary={displayName}
            primaryTypographyProps={{
              noWrap: true,
              variant: 'subtitle2',
            }}
            secondary={`Created date: ${fDateTime(date)}`}
            secondaryTypographyProps={{
              noWrap: true,
              component: 'span',
              variant: conversation.unreadCount ? 'subtitle2' : 'body2',
              color: conversation.unreadCount ? 'text.primary' : 'text.secondary',
            }}
          />
          
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
      
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            // popover.onClose();
            // onDelete();
           
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

          {/* <Stack alignItems="flex-end" sx={{ ml: 2, height: 44 }}>
            <Typography
              noWrap
              variant="body2"
              component="span"
              sx={{
                mb: 1.5,
                fontSize: 12,
                color: 'text.disabled',
              }}
            >
              {formatDistanceToNowStrict(new Date(lastActivity), {
                addSuffix: false,
              })}
            </Typography>

            {!!conversation.unreadCount && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: 'info.main',
                  borderRadius: '50%',
                }}
              />
            )}
          </Stack> */}
        </>
      )}
    </ListItemButton>
  );
}

ChatNavItem.propTypes = {
  collapse: PropTypes.bool,
  conversation: PropTypes.object,
  onCloseMobile: PropTypes.func,
  selected: PropTypes.bool,
  projectID: PropTypes.string,
};
