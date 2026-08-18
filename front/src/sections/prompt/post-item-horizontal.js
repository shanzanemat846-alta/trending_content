import PropTypes from 'prop-types';
// @mui
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { isEmpty } from 'lodash';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// utils
import { fDate } from 'src/utils/format-time';
// components
import axios from 'axios';
import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import TextMaxLine from 'src/components/text-max-line';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import { chatgptRoute } from "src/utils/APIRoutes";
// import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import SendIcon from '@mui/icons-material/Send';

import { STORAGE_KEY, PLATFORMS, USERS_ROLE } from 'src/utils/constants';
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { useAuthContext } from 'src/auth/hooks';
import CustomModal from "src/components/modal/modal"

import {
  CreateContent,
  SetChatgptState,
  ResetChatgptNotify
} from 'src/app/lib/slices/chatgpt-slice';
import {
  SetThreadState
} from 'src/app/lib/slices/thread-slice';
import { UpdateProject } from 'src/app/lib/slices/project-slice';

import { SplitText, BuildUserMessage } from 'src/utils/helpers';
// ----------------------------------------------------------------------

export default function PostItemHorizontal({ idValue, post, ShowSplash, onDelete }) {
  const { user: { _id: user_Id, role } } = useAuthContext();
  const popover = usePopover();

  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    platformForContent,
    selectedYoutubeThreadsList,
    selectedRedditThreadsList,
    redditPrePromptDetails
  } = useAppSelector((state) => state.thread);

  const {
    notifyMessage: chatgptNotifyMessage,
    notifyType: chatgptNotifyType,
    notify: chatgptNotify,
    createContentSuccess,
    createContentLoading,
    chat: currentSavedChat
  } = useAppSelector((state) => state.chatgpt);

  const { enqueueSnackbar } = useSnackbar();

  const [disabled, setDisabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [confirmDeletePrompt, setConfirmDeletePrompt] = useState(false);

  const {
    _id,
    title,
    content,
    date,
    userid
  } = post;

  const projectid = localStorage.getItem("projectID");

  // const postTitle = localStorage.getItem("chatTitle");
  // const preprompt = localStorage.getItem("chatpreprompt");

  const [showToggleId, setShowToggleId] = useState(null);

  useEffect(() => {
    console.log('platformForContent: ', platformForContent);

    if (platformForContent === PLATFORMS.MULTIPLE_PLATFORMS) {
      setDisabled(false);
    } else if (platformForContent === PLATFORMS.YOUTUBE) {
      setDisabled(false);
    } else if (platformForContent === PLATFORMS.REDDIT) {
      // if (postTitle !== "" && preprompt !== "") 
      setDisabled(false);
    }
  }, [
    // postTitle, 
    // preprompt,
    platformForContent
  ]);


  const handleChoose = async () => {
    // console.log("postTitle preprompt", postTitle, preprompt);

    if (platformForContent === PLATFORMS.YOUTUBE) {
      dispatch(CreateContent({
        contentCreationParams: {
          selectedYoutubeThreadsList
        },
        promptId: _id,
        platform: PLATFORMS.YOUTUBE,
      }));
    } else if (platformForContent === PLATFORMS.REDDIT) {
      ShowSplash(true);

      const {
        chatTitle: postTitle,
        chatPrePrompt: preprompt
      } = redditPrePromptDetails;

      // add-chat
      if (postTitle !== "" && preprompt !== "") {
        const prompt = BuildUserMessage(content, preprompt);

        const accessToken = localStorage.getItem(STORAGE_KEY);

        try {
          const response = await axios.post(chatgptRoute, { projectid, title: postTitle, message: prompt }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          });
          const { chat, message: serverResponseMessage } = response.data;
          const { errors, status } = response.data;

          if (status === false) {
            throw new Error(errors || 'Some issue in creating post!');
          }

          dispatch(SetThreadState({
            field: 'redditPrePromptDetails',
            value: {
              chatTitle: "",
              preprompt: ""
            }
          }))

          // localStorage.setItem("chatTitle", "");
          // localStorage.setItem("chatpreprompt", "");

          ShowSplash(false);
          enqueueSnackbar('Content Created successfully.', { variant: 'success' });

          if (serverResponseMessage) {
            enqueueSnackbar(serverResponseMessage, { variant: 'success' });
          }          

          // dispatch(UpdateProject({
          //   projectId: projectid, 
          //   action: "deleteSaveThreads",
          //   updateParams: {
          //     selectedThreadsList: {
          //       redditThreadsIds: selectedRedditThreadsList.map(row => row.threadId),
          //       youtubeThreadsIds: []
          //     }
          //   }
          // }));

          dispatch(SetThreadState({ field: 'selectedRedditThreadsList', value: [] }));
          dispatch(SetThreadState({ field: 'platformForContent', value: null }));
          
          localStorage.setItem("chatID", chat._id);
          router.push(paths.dashboard.tour.chatgpt(projectid));
        } catch (error) {
          console.log('here the error : ', error);
          ShowSplash(false);
          let errMessage = '';
          if (error.response && error.response.data) {
            const { error: errorMessage } = error.response.data;
            enqueueSnackbar(errorMessage, { variant: 'error' });
            errMessage = errorMessage;
          } else {
            errMessage = `Unable to create chat with error: ${error.message}`;
            enqueueSnackbar(`${error.message}`, { variant: 'error' });
          }

          // if error redirect to the threads page
          dispatch(SetThreadState({
            field: 'contentCreationFails',
            value: {
              errorMessage: errMessage,
              platform: platformForContent
            }
          }));

          router.push(paths.dashboard.tour.threads(projectid));
        }
      } else {
        ShowSplash(false);
        enqueueSnackbar('Please select the thread!', { variant: 'error' });
      }
    } else if (platformForContent === PLATFORMS.MULTIPLE_PLATFORMS) {
      dispatch(CreateContent({
        contentCreationParams: {
          selectedYoutubeThreadsList,
          selectedRedditThreadsList,
        },
        promptId: _id,
        platform: PLATFORMS.MULTIPLE_PLATFORMS,
      }));
    }
  };


  useEffect(() => {
    if (chatgptNotify && !isEmpty(chatgptNotifyMessage)) {
      enqueueSnackbar(chatgptNotifyMessage, { variant: chatgptNotifyType });

      console.log('here the error comes: ', {
        chatgptNotify,
        chatgptNotifyMessage
      });
      if (platformForContent === PLATFORMS.YOUTUBE || platformForContent === PLATFORMS.MULTIPLE_PLATFORMS) {
        if (chatgptNotifyType === 'error') {
          dispatch(SetThreadState({
            field: 'contentCreationFails',
            value: {
              errorMessage: chatgptNotifyMessage,
              platform: platformForContent
            }
          }));

          router.push(paths.dashboard.tour.threads(projectid));
        }
      }
      dispatch(ResetChatgptNotify());
    }
  }, [chatgptNotifyMessage, chatgptNotifyType, chatgptNotify]);

  useEffect(() => {
    if (!createContentLoading && createContentSuccess) {

      // enqueueSnackbar('Create success!', { variant: 'success' });

      const { _id: chatId } = currentSavedChat;

      localStorage.setItem("chatID", chatId);

      let updateParams = {};

      if (platformForContent === PLATFORMS.YOUTUBE) {
        updateParams = {
          selectedThreadsList: {
            redditThreadsIds: [],
            youtubeThreadsIds: selectedYoutubeThreadsList.map(row => row.threadId)
          }
        }
      } if (platformForContent === PLATFORMS.MULTIPLE_PLATFORMS) {
        updateParams = {
          selectedThreadsList: {
            redditThreadsIds: selectedRedditThreadsList.map(row => row.threadId),
            youtubeThreadsIds: selectedYoutubeThreadsList.map(row => row.threadId)
          }
        }
      }
      // dispatch(UpdateProject({
      //   projectId: projectid,
      //   action: "deleteSaveThreads", 
      //   updateParams
      // }));

      dispatch(SetThreadState({ field: 'platformForContent', value: null }));
      dispatch(SetThreadState({ field: 'selectedYoutubeThreadsList', value: [] }));
      dispatch(SetThreadState({ field: 'selectedRedditThreadsList', value: [] }));
      dispatch(SetChatgptState({ field: 'createContentSuccess', value: false }));

      console.log('here redirect to threads: ', { projectid });

      router.push(paths.dashboard.tour.chatgpt(projectid));
    }
  }, [createContentSuccess, createContentLoading, currentSavedChat]);


  const handleToggleContent = (id) => {
    setShowFullContent((prevState) => !prevState);
    setShowToggleId(id);
  };

  return (
    <>
      <Card
        sx={{
          cursor: 'pointer',
          maxHeight: showFullContent && showToggleId === _id ? 'none' : '100px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >

      {userid !== user_Id && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "#3fca89",
              color: "#ffff",
              fontWeight: "bold",
              fontSize: "0.75rem",
              padding: "4px 12px",
              borderRadius: "6px",
              zIndex: 1,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            Premium Prompt
          </Box>
        )}

        {createContentLoading ?
          <LoadingScreen sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 9999
          }}
          />
          : null
        }
        <CardContent onClick={() => handleToggleContent(_id)} sx={{ cursor: 'pointer', padding: '8px' }}>
          <Box
            component="span"
            sx={{
              typography: 'caption',
              color: 'text.disabled',
            }}
          >
            {fDate(date)}
          </Box>
          {showFullContent && showToggleId === _id ? (
            <Typography gutterBottom variant="subtitle2" component="div">
              {title}
            </Typography>
          ) : (
            <TextMaxLine variant="subtitle2" line={1}>
              {title}
            </TextMaxLine>
          )}
          {showFullContent && showToggleId === _id ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {content}
            </Typography>
          ) : (
            null
          )}
        </CardContent>

        <Stack direction="row" alignItems="center" justifyContent="space-between" style={{ marginBottom: '2px' }} sx={{ mx: 1 }}>
          {
            <IconButton 
              color={popover.open ? 'inherit' : 'default'} 
              onClick={popover.onOpen}
              disabled={userid !== user_Id}
              sx={{
                ...(userid !== user_Id && {  // Only apply these styles when disabled
                  opacity: 0.5,
                  pointerEvents: 'none',
                  '&:hover': {
                    backgroundColor: 'transparent'
                  }
                }),
              // Normal state styles can go here
              '&:not(:disabled)': {
                opacity: 1,
                pointerEvents: 'auto'
              }
            }}
            >
              <Iconify icon="eva:more-horizontal-fill" />
            </IconButton>
          }
          {role !== USERS_ROLE.ADMIN && (
            <IconButton
              onClick={handleChoose}
              disabled={disabled}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              sx={{
                color: isHovered ? 'primary.main' : 'default',
              }}
            >
              <SendIcon />

            </IconButton>
          )}
        </Stack>
      </Card>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="bottom-center"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={ () => { handleChoose();  popover.onClose(); }}
        >
          <Iconify icon="solar:eye-bold" />
          choose
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(paths.dashboard.post.edit(_id));
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            setConfirmDeletePrompt(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
      <CustomModal
        open={confirmDeletePrompt}
        onClose={() => setConfirmDeletePrompt(false)}
        onConfirm={() => { onDelete(); setConfirmDeletePrompt(false); }}
        title="Delete Prompt"
        actions={
          <>
            <Button onClick={() => setConfirmDeletePrompt(false)} variant="outlined">
              Cancel
            </Button>
            <Button onClick={() => {onDelete(); setConfirmDeletePrompt(false);}} variant="contained" color="error">
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete prompt? This action cannot be undone.</p>
      </CustomModal>
    </>
  );
}

PostItemHorizontal.propTypes = {
  post: PropTypes.shape({
    date: PropTypes.instanceOf(Date),
    content: PropTypes.string,
    title: PropTypes.string,
    _id: PropTypes.string,
  }),
  onDelete: PropTypes.func,
  ShowSplash: PropTypes.string,
  idValue: PropTypes.string,
};
