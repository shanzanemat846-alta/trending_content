import { useCallback, useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  Container,
  Tooltip
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import { isEmpty } from 'lodash';
// hooks
import { paths } from 'src/routes/paths';

import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { enqueueSnackbar } from 'src/components/snackbar';

import { GetCaption, GetThreadComments, SetThreadState, ResetThreadNotify } from 'src/app/lib/slices/thread-slice';

import { SplitText } from 'src/utils/helpers';

import CommentDisplay from './comment-display';

const CommentsDrawer = ({
  projectId,
  threadId,
  threadTitle,
  open,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const settings = useSettingsContext();

  const {
    notifyType: threadSliceNotifyType,
    notifyMessage: threadSliceNotifyMessage,
    notify: threadSliceNotify,
    getThreadCommentsLoading,
    threadComments,
    captionDetails,
    getCaptionsLoading
  } = useAppSelector((state) => state.thread);

  const [tableData, setTableData] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [captionsMessage, setCaptionsMessage] = useState('');
  const [captionsData, setCaptionsData] = useState('');

  const fetchThreadsComments = useCallback(() => {
    dispatch(GetThreadComments({ threadId }));
  }, [threadId]);

  const fetchCaptionDetails = useCallback(() => {
    dispatch(GetCaption({ threadId }));
  }, [threadId]);

  const handleCloseCaptionsDrawer = () => {
    onClose();
    setTableData([]);
    setCaptions([]);
    setCaptionsMessage('');
    dispatch(SetThreadState({ field: 'threadComments', value: [] }));
    dispatch(SetThreadState({ field: 'captionDetails', value: {} }));
  };

  useEffect(() => {
    if (threadId) {
      fetchThreadsComments();
      fetchCaptionDetails();
    }
  }, [threadId, fetchCaptionDetails, fetchThreadsComments]);

  useEffect(() => {
    if (threadComments.length) {
      setTableData(threadComments);
    } else {
      setTableData([]);
    }
  }, [threadComments]);

  useEffect(() => {
    if (threadSliceNotify && threadSliceNotifyMessage) {
      enqueueSnackbar(SplitText(threadSliceNotifyMessage), { variant: threadSliceNotifyType });
      dispatch(ResetThreadNotify());
    }
  }, [threadSliceNotifyType, threadSliceNotifyMessage, threadSliceNotify]);

  useEffect(() => {
    const { captions: captionsList, engCaptionsNotAvailable, captionTrackNotFound } = captionDetails;

    if (!isEmpty(captionDetails) && engCaptionsNotAvailable) {
      setCaptionsMessage('Sorry english captions for this is not available!');
    } else if (!isEmpty(captionDetails) && captionTrackNotFound) {
      setCaptionsMessage('Sorry captions are disable for this video!');
    } else if (captionsList?.length) {

      const captionsParagraph = createParagraph(captionsList, 10);
      setCaptionsData(captionsParagraph);

      setCaptions(captionsList);
    } else {
      setCaptions([]);
      setCaptionsData('')
    }
  }, [captionDetails]);

  const createParagraph = (captionsList, maxLines = 10) => {
    if (!Array.isArray(captionsList) || captionsList.length === 0) {
      return '';
    }

    let finalString = '';
    let currentLines = [];

    for (let i = 0; i < captionsList.length; i += 1) {
      currentLines.push(captionsList[i].transcription);

      if (currentLines.length === maxLines || i === captionsList.length - 1) {
        finalString += (finalString ? '\n\n' : '') + currentLines.join(' ');

        currentLines = [];
      }
    }

    return finalString;
  };

  return (
    <Drawer
      open={open}
      onClose={handleCloseCaptionsDrawer}
      anchor="right"
      sx={{
        '& .MuiDrawer-paper': {
          width: '70%',
        },

      }}
      // ModalProps={{
      //   BackdropProps: { onClick: (e) => e.stopPropagation() },
      //   disableEscapeKeyDown: true
      // }}
    >
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: '16px',
            width: '100%',
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: '60%', marginBottom: '0px !important' }}>
            <IconButton color="primary" sx={{ marginLeft: '1px' }} onClick={() => { handleCloseCaptionsDrawer() }}>
              <ArrowBackIcon />
            </IconButton>
            <CustomBreadcrumbs
              heading='Caption & Comment Viewer'
              links={[
                {
                  name: 'Threads List',
                  href: paths.dashboard.tour.threads(projectId),
                },
                { name: 'Caption & Comment Viewer' }
              ]}
              sx={{
                marginBottom: '0px !important',
                marginTop: '0px !important',
              }}
            />
          </Box>

        </Box>

        <Tooltip title={threadTitle?.length > 89 ? threadTitle : ''} arrow>
          <Typography
            variant="p"
            gutterBottom
            sx={{
              position: 'relative',
              height: '1.7em',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis',
              fontWeight: "bold",
              marginTop: "24px"
            }}
          >
          {threadTitle}
          </Typography>
        </Tooltip>

        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
          <Typography variant="h5">Caption List</Typography>

          <Box
            sx={{
              height: 'calc(100vh - 620px)',
              backgroundColor: 'white',
              overflow: 'auto',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {getCaptionsLoading || (captionDetails?.captions?.length !== captions.length) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '10px' }}>
                <CircularProgress size={24} />
                <Typography>Loading captions...</Typography>
              </Box>
            )}
            {!getCaptionsLoading && captionsData.length > 0 && (
              <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                {captionsData.split('\n\n').map((paragraph, index) => (
                  <Typography key={index} paragraph>
                    {paragraph}
                  </Typography>
                ))}
              </Typography>
            )}
            {!getCaptionsLoading && captionsData.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography align="center" sx={{ fontWeight: 'bold' }}>
                  {captionsMessage}
                </Typography>
              </Box>
            )}
          </Box>

          <Typography variant="h5" sx={{ mt: 3 }}>Top Comments</Typography>

          <Box
            sx={{
              height: 'calc(100vh - 650px)',
              backgroundColor: 'white',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              padding: tableData.length > 0 ? '16px' : '0',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {(getThreadCommentsLoading || threadComments.length !== tableData.length) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '8px' }}>
                <CircularProgress size={24} />
                <Typography>Loading comments...</Typography>
              </Box>
            )}
            {!getThreadCommentsLoading && threadComments.length === tableData.length && tableData.length > 0 && (
              tableData.map((row, index) => (
                <CommentDisplay key={index} comments={tableData} />
              ))
            )}
            {!getThreadCommentsLoading && threadComments.length === tableData.length && tableData.length === 0 && (
              <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>No comments found</Typography>
            )}
          </Box>
        </Container>
      </Container>
    </Drawer>
  )
}

export default CommentsDrawer;
