'use client';

import PropTypes from 'prop-types';
import { useEffect, useState, useCallback, useContext } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { isEmpty } from 'lodash';
import axios from "axios";
import { Modal, TextField, Button } from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams  } from 'src/routes/hooks';
// components
import { useSettingsContext } from 'src/components/settings';
import Stepper from 'src/components/stepper/stepper';
import { useHandleStepClick } from 'src/components/stepper/handle-step-click';
import { useSnackbar } from 'src/components/snackbar';
import { AuthContext } from 'src/auth/context/jwt/auth-context';

import { useAppDispatch, useAppSelector } from "src/app/lib/hooks";

import { GetUserSubscriptionPlanDetail } from 'src/app/lib/slices/subscription-slice';

import { storeRoute, chatupdateRoute, host } from 'src/utils/APIRoutes';
import { STORAGE_KEY } from 'src/utils/constants';

import { def_id } from 'src/config-global';

import { SplitText } from 'src/utils/helpers';

import ChatNav from '../chat-nav';
import ChatMessageList from '../chat-message-list';
import ChatMessageInput from '../chat-message-input';

// ----------------------------------------------------------------------

export default function ChatView({ id }) {
  const dispatch = useAppDispatch();
  const { userSubscriptionPlanDetails } = useAppSelector((state) => state.subscription);

  const { enqueueSnackbar } = useSnackbar();
  const { user: { _id: userId } } = useContext(AuthContext);


  const { handleStepClick } = useHandleStepClick();

  const router = useRouter();

  const settings = useSettingsContext();

  const searchParams = useSearchParams();

  const chatID = localStorage.getItem("chatID");

  const selectedConversationId = searchParams.get('id') || chatID;

  const [recipients, setRecipients] = useState([]);

  const [chats, setChats] = useState([]);

  const [linear, setLinear] = useState(false);

  const participants =  [];

  const [newContentName, setNewContentName] = useState('');
  const [openSaveContentModal, setOpenSaveContentModal] = useState(false);
  const [selectedStoreId, setSelectedStoreId]= useState(null);

  useEffect(() => {
    if (!selectedConversationId) {
      router.push(paths.dashboard.tour.chatgpt(id));
    }
  }, [ router, selectedConversationId, id]);

  const handleAddRecipients = useCallback((selected) => {
    setRecipients(selected);
  }, []);

 const fetchChats = useCallback(async () => {
  try {
    const response = await axios.get(`${host}/api/chatgpt/pull?projectid=${id}`);
    setChats(response.data);
  } catch (error) {
    console.error('Error fetching chatgpt:', error);
  }
}, [id, setChats]);

useEffect(() => {
  fetchChats();
}, [fetchChats]);

  useEffect(() => {
    if (id === def_id) enqueueSnackbar('Please select the Project!', { variant: 'warning' });
  }, [])
 
  const renderNav = (
    <ChatNav
      conversations={chats}
      loading={false}
      selectedConversationId={selectedConversationId}
      projectid={id}
    />
  );

 const tlinear = (val) => { setLinear(val)}


 const chatgpt = async (prompt) => {
  try {
    console.log("message", prompt);
    // const title = localStorage.getItem("chatTitle");
    ;
    const accessToken = localStorage.getItem(STORAGE_KEY);

      const response = await axios.post(chatupdateRoute, {
        // projectid: id,
        id: selectedConversationId,
        message: prompt,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });

      // setTexts(res.data.chat.chat);
      const { message: serverResponseMessage } = response.data;
      if (serverResponseMessage) enqueueSnackbar(serverResponseMessage, { variant:  'success' });
      fetchChats();
      dispatch(GetUserSubscriptionPlanDetail({ userId }));
      setLinear(false);
    } catch (error) {
      if ( error.response &&  error.response.data) {
        const { error: errorMessage } = error.response.data;
        enqueueSnackbar(errorMessage, { variant:  'error' });
      } else {
        enqueueSnackbar(`Send Message Failed with ${error?.message} `, { variant:  'error' });
      }
      setLinear(false);
    }
 }

 const handleDelete = useCallback(async (ID) => {
  await axios.delete(`${host}/api/chatgpt/${ID}`);
  console.info('DELETE', ID);
  setChats(prevChats => {
    const leftChat = prevChats.filter((chat) => chat._id !== ID);
    router.push(paths.dashboard.tour.chatgpt(id));
    return leftChat;
  });
}, [router, id]);

const handleStore = useCallback(async (d) => {
  const conversation = chats.find(chat => chat._id === d);
  const prestore = conversation?.chat;
  let lastAssistantItem = null;

  prestore?.forEach((item) => {
    if (item.user === "assistant") {
      lastAssistantItem = item;
    }
  });

 if (lastAssistantItem) {
    try {
      let title = '';
      const message = lastAssistantItem.message || '';

      const h1StartIndex = message.indexOf('<H1>');
      const h1EndIndex = message.indexOf('</H1>');
      const h2StartIndex = message.indexOf('<H2>');
      const h2EndIndex = message.indexOf('</H2>');

      if (
        (h1StartIndex !== -1 && h1EndIndex !== -1) ||
        (h2StartIndex !== -1 && h2EndIndex !== -1)
      ) {
        let startIndex;
        let endIndex;
        if (h1StartIndex !== -1 && (h1StartIndex < h2StartIndex || h2StartIndex === -1)) {
          startIndex = h1StartIndex;
          endIndex = h1EndIndex;
        } else {
          startIndex = h2StartIndex;
          endIndex = h2EndIndex;
        }

        const openingTagLength = startIndex === h1StartIndex ? 4 : 3; // Length of "<h1>" or "<h2>"
        title = message.substring(startIndex + openingTagLength, endIndex).trim();
      }

      let imageurl = localStorage.getItem('image');
      console.log(' imageurl', imageurl);
      if (imageurl === 'empty' || imageurl === '' || isEmpty(imageurl))
        imageurl = 'https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_4.jpg';
      if (isEmpty(title)) {
        title = conversation.title;
      }

      const stored = {
        userId,
        projectid: id,
        title: newContentName,
        content: `${lastAssistantItem.message} + "\n" `,
        image: imageurl,
      };


      const response = await axios.post(storeRoute, stored);
      const { errors, store, message: serverResponseMessage } = response.data;
      let storeId;
      if (!errors) {  storeId = store._id; }
      // localStorage.setItem('chatID', null);
      localStorage.setItem('threadUrl', '')

      if (!isEmpty(errors)) {
        enqueueSnackbar(errors, { variant: 'error' });
      }
      if (serverResponseMessage) {
        enqueueSnackbar(`${serverResponseMessage}`, { variant: 'success' });
        enqueueSnackbar(`Content saved successfully!`, { variant: 'success' });
      }
      dispatch(GetUserSubscriptionPlanDetail({ userId }));
      if (!errors && storeId) router.push(paths.dashboard.tour.store.details(storeId));
      setNewContentName('');
      setOpenSaveContentModal(false);
      setSelectedStoreId(null);
      // After storing, if you intend to navigate to another page, do it here
      // router.push(paths.dashboard.tour.store.edit(storeId));
    } catch (error) {
      console.error('Error while storing:', error);
      enqueueSnackbar("Your prompt isn't suitable", { variant: 'error' });
    }
 } else {
   // Handle the case where no assistant message is found
   console.log('No assistant message found for storage');
   enqueueSnackbar("No assistant message found for storage",  { variant: 'warning' })
 }
}, [chats, enqueueSnackbar, id, router, newContentName]);

const textsd = chats.find(chat => chat._id === selectedConversationId)?.chat;

const updatedMessages = textsd?.map((text) => ({
  attachments: [],
  body: text.message,
  contentType: "text",
  createdAt: new Date(),
  id: "15de0714-50c3-4c38-bfed-fe3e28fa3493",
  senderId: text.user,
}));

const updatedParticipants = participants.map((participant, index) => ({
  ...participant, // Spread the properties of the original participant object
  id: index === 0 ? "user" : "assistant", // Update the id property with the desired value
}));

  const renderMessages = (
    <Stack
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <ChatMessageList messages={updatedMessages} participants={updatedParticipants} />

      <ChatMessageInput
        chatAvailable={chats?.length}
        recipients={recipients}
        onAddRecipients={handleAddRecipients}
        startChatgpt={(message) => chatgpt(message)}
        selectedConversationId={selectedConversationId}
        disabled={!recipients.length && !selectedConversationId}
        tlinear={linear}
        ttlinear={(val) => tlinear(val)}
        onDelete={(ID) => handleDelete(ID)}
        onStore={(sid) => { setSelectedStoreId(sid); setOpenSaveContentModal(true); }}
        userPlan={userSubscriptionPlanDetails?.subscriptionPlan}
      />
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>     
      { id === def_id ? null : <Stepper activeStepNumber={4} handleStepClick={handleStepClick} /> }
      <Stack component={Card} direction="row" sx={{ height: '80vh' }}>
        {renderNav}

        <Stack
          sx={{
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
        >
          {/* {renderHead} */}

          <Stack
            direction="row"
            sx={{
              width: 1,
              height: 1,
              overflow: 'hidden',
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {renderMessages}

          </Stack>
        </Stack>
      </Stack>

      <Modal open={openSaveContentModal} onClose={() => setOpenSaveContentModal(false)}>
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '16px' }}>Add Title for the Content</h2>
          <TextField
            fullWidth
            required
            label="Title"
            value={newContentName}
            onChange={(e) => setNewContentName(e.target.value)}
            // error={error}
            // helperText={error ? "Title is required" : ""}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: '20px' }}
            disabled={isEmpty(newContentName) || isEmpty(chats)}
            onClick={() => handleStore(selectedStoreId)}
          >
            Save
          </Button>
        </div>
      </Modal>
    </Container>
  );
}

ChatView.propTypes = {
    id: PropTypes.string,
};
