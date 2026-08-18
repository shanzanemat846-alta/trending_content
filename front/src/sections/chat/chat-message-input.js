import PropTypes from 'prop-types';
import { sub } from 'date-fns';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import {
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// utils
import uuidv4 from 'src/utils/uuidv4';
// api
import { createConversation } from 'src/api/chat';
import { GetUserSubscriptionPlanDetail } from 'src/app/lib/slices/subscription-slice';
import { useAuthContext } from 'src/auth/hooks';
// components
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import Iconify from 'src/components/iconify';
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from '@mui/material/CircularProgress';

import { useAppDispatch, useAppSelector } from "src/app/lib/hooks";
import { SetUserState } from 'src/app/lib/slices/user-slice';
import { useSnackbar } from 'src/components/snackbar';

import { checkCreditAvailable } from '../../utils/helpers';

import { COSTING_TYPES } from '../../utils/constants';

export default function ChatMessageInput({
  chatAvailable,
  recipients,
  startChatgpt,
  onAddRecipients,
  ttlinear,
  disabled,
  selectedConversationId,
  tlinear,
  onDelete,
  onStore,
  userPlan
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    userSubscriptionPlanDetails,
    getUserSubscriptionPlanLoading,
  } = useAppSelector((state) => state.subscription);

  const { user } = useMockedUser();
  const { user: { _id: userId } } = useAuthContext();

  const fileRef = useRef(null);

  const [message, setMessage] = useState('');
  const [redirectToSubscription, setRedirectToSubscription] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const myContact = useMemo(
    () => ({
      id: `${user?.id}`,
      role: `${user?.role}`,
      email: `${user?.email}`,
      address: `${user?.address}`,
      name: `${user?.displayName}`,
      lastActivity: new Date(),
      avatarUrl: `${user?.photoURL}`,
      phoneNumber: `${user?.phoneNumber}`,
      status: 'online',
    }),
    [user]
  );

  const messageData = useMemo(
    () => ({
      id: uuidv4(),
      attachments: [],
      body: message,
      contentType: 'text',
      createdAt: sub(new Date(), { minutes: 1 }),
      senderId: myContact.id,
    }),
    [message, myContact.id]
  );

  const conversationData = useMemo(
    () => ({
      id: uuidv4(),
      messages: [messageData],
      participants: [...recipients, myContact],
      type: recipients.length > 1 ? 'GROUP' : 'ONE_TO_ONE',
      unreadCount: 0,
    }),
    [messageData, myContact, recipients]
  );

  const handleChangeMessage = useCallback((event) => {
    setMessage(event.target.value);
  }, []);

  useEffect(() => {
    if (userId) {
      dispatch(GetUserSubscriptionPlanDetail({ userId }));
    }
  }, [userId]);

  const { isCreditUnavailable, errorMessage: creditsErrorMessage } = useMemo(() => checkCreditAvailable({
    costingType: COSTING_TYPES.SAVE_CONTENT,
    credits: userSubscriptionPlanDetails?.credits
  }), [
    userSubscriptionPlanDetails
  ]);

  function LinearIndeterminate() {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }
  
const projectID = localStorage.getItem("projectID");

  const handleSendMessage = useCallback(
    async (event) => {
      try {
        if (event.key === 'Enter') {
         ttlinear(true);
      
          if (message) {
            if (selectedConversationId) {
              startChatgpt(message);
            } else {
              const res = await createConversation(conversationData);
              router.push(`${paths.dashboard.tour.chatgpt(projectID)}?id=${res.conversation.id}`);
              onAddRecipients([]);
            }
          }
          setMessage('');
        }
      } catch (error) {
        console.error(error);
      }
    },
    [conversationData, message, onAddRecipients, router, selectedConversationId,startChatgpt, ttlinear, projectID]
  );

  const handleSaveClick = () => {
    if (!chatAvailable) {
      enqueueSnackbar('No chat available', { variant: "warning"})
      return;
    }
    if (isCreditUnavailable) {
      enqueueSnackbar("You don't have the enough credits, purchase some tokens", { variant: 'warning' });
      return;
    }
    onStore(selectedConversationId);
  };

  const getTooltipMessage = (action) => {
    if (!chatAvailable) {
      return `No chat available to ${action}!`;
    }
    if (isCreditUnavailable) {
      return creditsErrorMessage;
    }
    return "";
  };

  const handleRedirection = () => {
    dispatch(SetUserState({ field: 'updatePlanFromSaveContent', value: true }));
    router.push(paths.dashboard.user.root);
  };

  const handleDeleteChat = (chatId) => {
    if (!chatAvailable) {
      enqueueSnackbar('No chat available', { variant: "warning"})
      return;
    }

    onDelete(chatId)
  }

  return (
    <>
      <InputBase
        value={message}
        onKeyUp={handleSendMessage}
        onChange={handleChangeMessage}
        placeholder="Type a message"
        disabled={disabled}
        startAdornment={<IconButton>{/* <Iconify icon="eva:smiling-face-fill" /> */}</IconButton>}
        endAdornment={
          <Stack direction="row" sx={{ flexShrink: 0 }}>
            <Tooltip title={getTooltipMessage("saved")}>
              <span>
                <IconButton
                  onClick={handleSaveClick}
                >
                  {getUserSubscriptionPlanLoading ? <CircularProgress size={24} /> :
                    <SaveRoundedIcon />
                  }
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={getTooltipMessage("delete")}>
            <IconButton onClick={() => handleDeleteChat(selectedConversationId)} disabled={disabled}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
            </Tooltip>
          </Stack>
        }
        sx={{
          px: 1,
          height: 56,
          flexShrink: 0,
          borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      />
      {tlinear ? LinearIndeterminate() : null}

      <input type="file" ref={fileRef} style={{ display: 'none' }} />
      <Dialog 
        open={redirectToSubscription} 
        onClose={() => setRedirectToSubscription(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 3,
          bgcolor: 'primary.main',
          color: 'common.white',
          typography: 'h5',
          textAlign: 'center'
        }}>
          Upgrade Your Plan
          <IconButton
            aria-label="close"
            onClick={() => setRedirectToSubscription(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'common.white',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Iconify 
            icon="mdi:lock-open-outline" 
            width={60} 
            height={60} 
            color="primary.main"
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Unlock Premium Features
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your current plan doesn&#39;t include this powerful feature.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upgrade now to get full access and enhance your experience.
          </Typography>
          
          <Box sx={{
            bgcolor: 'background.neutral',
            p: 2,
            borderRadius: 1,
            mt: 3,
            textAlign: 'left'
          }}>
            <Typography variant="subtitle2" gutterBottom>
              What you&#39;ll get:
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon="mdi:check-circle" width={20} height={20} color="success.main" sx={{ mr: 1 }} />
                <Typography variant="body2">Store data</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon="mdi:check-circle" width={20} height={20} color="success.main" sx={{ mr: 1 }} />
                <Typography variant="body2">GPT-4 Access</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon="mdi:check-circle" width={20} height={20} color="success.main" sx={{ mr: 1 }} />
                <Typography variant="body2">Free Credits</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon="mdi:check-circle" width={20} height={20} color="success.main" sx={{ mr: 1 }} />
                <Typography variant="body2">Plus many other premium benefits</Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          justifyContent: 'center', 
          pb: 3,
          px: 3
        }}>
          <Button 
            onClick={() => setRedirectToSubscription(false)} 
            variant="outlined" 
            size="large"
            sx={{ minWidth: 120 }}
          >
            Maybe Later
          </Button>
          <Button 
            onClick={handleRedirection}
            variant="contained"
            size="large"
            sx={{ 
              minWidth: 120,
              boxShadow: (theme) => theme.customShadows.z8
            }}
            startIcon={<Iconify icon="mdi:rocket-launch" />}
          >
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

ChatMessageInput.propTypes = {
  disabled: PropTypes.bool,
  onAddRecipients: PropTypes.func,
  recipients: PropTypes.array,
  selectedConversationId: PropTypes.string,
  startChatgpt: PropTypes.func,
  ttlinear: PropTypes.func,
  onDelete: PropTypes.func,
  onStore: PropTypes.func,
  tlinear: PropTypes.bool,
  userPlan: PropTypes.string,
};
