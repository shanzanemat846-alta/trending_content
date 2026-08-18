// @mui
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// components
import  { usePopover } from 'src/components/custom-popover';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function ChatNavAccount() {
  const { user } = useMockedUser();

  const popover = usePopover();

  return (
    <Badge 
      // variant={status} 
      // anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar
          // src={user?.photoURL}
          src="/assets/chatgpt-icon.png"
          alt={user?.displayName}
          onClick={popover.onOpen}
          sx={{ cursor: 'pointer', width: 48, height: 48 }}
        />
        <Label
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
            chatGPT
          </Label>
      </Badge>
  );
}
