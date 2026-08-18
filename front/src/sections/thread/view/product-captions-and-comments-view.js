'use client'

import { useState, useEffect, useMemo } from 'react'
import { Box, Button, Container, CssBaseline, Drawer, AppBar, Toolbar, Typography } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { take, orderBy, extend, isEmpty, uniq, map } from 'lodash';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import RedditIcon from '@mui/icons-material/Reddit';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SubtitlesIcon from '@mui/icons-material/Subtitles'
import SubtitlesOffIcon from '@mui/icons-material/SubtitlesOff'

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { LoadingScreen, SplashScreen } from 'src/components/loading-screen';
import { useSnackbar } from 'src/components/snackbar';

import {
  FetchAndSaveYoutubeThreadCaptions,
  FetchRedditThreadDetails,
  SetThreadState
} from 'src/app/lib/slices/thread-slice';
import { UpdateProject } from 'src/app/lib/slices/project-slice';

import { PLATFORMS } from 'src/utils/constants';

import Iconify from 'src/components/iconify';
import ThreadList from '../thread-list'
import YoutubeThreadContent from '../youtube-thread-content'
import RedditThreadContent from '../reddit-thread-content'

import { FormatRedditContent } from '../../../utils/helpers';

const drawerWidth = 280


export default function Home({
  open,
  onClose,
  handleSaveOptions,
  selectedRedditThreads: selectedRedditThreadsList,
  selectedYoutubeThreads: selectedYoutubeThreadsList,
  setSelectedRedditThreads,
  setSelectedYoutubeThreads,
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();


  const {
    youtubeDataForPreview,
    getYoutubeDataForPreviewLoading,
    getRedditDataForPreviewLoading,
    redditDataForPreview
  } = useAppSelector((state) => state.thread);

  const [selectedThread, setSelectedThread] = useState(null)
  const [selectedData, setSelectedData] = useState({})
  const [data, setData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeClass, setActiveClass] = useState(0);

  const handleSelectThread = (threadId) => {
    const currentThread = data.find(t => t.threadId === threadId);

    if (currentThread.platform === PLATFORMS.YOUTUBE) {
      const thread = selectedYoutubeThreadsList.find(row => String(row.threadId) === String(threadId));

      const { comments: threadComments } = currentThread;

      const top5CommentIds = take(orderBy(threadComments, ['likeCount'], ['desc']), 5).map(row => row._id);
      const {
        comments: prevSelectedComments,
        captions: prevSelectedCaptions
      } = thread;


      const updateParams = {};

      if (prevSelectedComments === 'top') {
        extend(updateParams, { comments: top5CommentIds });
      } else {
        extend(updateParams, { comments: prevSelectedComments });
      }

      if (prevSelectedCaptions === 'all') {
        extend(updateParams, { captions: 'all' });
      } else {
        extend(updateParams, { captions: prevSelectedCaptions });
      }

      setSelectedThread(currentThread);

      if (!selectedData[threadId]) {
        setSelectedData(prev => ({
          ...prev,
          [threadId]: {
            ...updateParams
          }
        }));
      }
    } else {
      setSelectedThread(currentThread);
    }
  }

  const handleCaptionSelection = ({ threadId, captionId, checked }) => {
    const captionsData = data.find(row => row.threadId === threadId);

    setSelectedData(prev => {
      // Get the current thread data or initialize if not exists
      const currentThread = prev[threadId] || { captions: [], comments: [] };

      // Create a new thread object to avoid mutating state
      const updatedThread = { ...currentThread };

      // If captions is not an array (i.e., 'all'), initialize it
      if (checked && !Array.isArray(updatedThread.captions)) {
        updatedThread.captions = [];
      }

      if (checked) {
        // Add caption ID if not already present
        if (!updatedThread.captions.includes(captionId)) {
          updatedThread.captions = [...updatedThread.captions, captionId];
        }
      } else if (!checked) {

        if (updatedThread.captions === 'all') {
          const captionData = data.find(row => row.threadId === threadId);

          const { captions } = captionData;

          updatedThread.captions = captions.filter(caption => caption.id !== captionId).map(row => row.id);

        } else {
          updatedThread.captions = updatedThread.captions.filter(id => id !== captionId);
        }
      }

      if (updatedThread.captions.length === captionsData.captions.length) {
        updatedThread.captions = 'all';
      }

      // Return updated state
      return {
        ...prev,
        [threadId]: updatedThread
      };
    });
  };

  const handleAllCommentsSelect = ({ threadId, checked }) => {
    const threadDetails = data.find(row => row.threadId === threadId);

    setSelectedData(prev => {
      const thread = { ...prev[threadId] }

      if (checked) {
        thread.comments = threadDetails?.comments?.map(row => row._id) || [];
      } else {
        thread.comments = []
      }
      return { ...prev, [threadId]: thread }
    })
  };

  const handleAllCaptionsSelect = ({ threadId, checked }) => {
    setSelectedData(prev => {
      const thread = { ...prev[threadId] }
      if (checked) {
        thread.captions = 'all';
      } else {
        thread.captions = []
      }
      return { ...prev, [threadId]: thread }
    })
  };

  const handleCommentSelection = ({ threadId, commentId, checked }) => {
    const thread = { ...selectedData[threadId] };

    if (checked) {
      thread.comments.push(commentId);
    } else {
      const filterComments = thread.comments.filter(row => row !== commentId);

      thread.comments = filterComments;
    }

    setSelectedData((prev) => ({ ...prev, [threadId]: thread }));
  };

  const handleDeleteThread = ({ threadId, platform }) => {

    const filterData = data.filter(row => row.threadId !== threadId);

    setData(filterData);

    const selectedDataCopy = selectedData;
    delete selectedDataCopy[threadId];

    if (platform === PLATFORMS.REDDIT) {
      setSelectedRedditThreads((prev) =>
        prev.filter((item) => item.threadId !== threadId)
      );
    } else if (platform === PLATFORMS.YOUTUBE) {
      setSelectedYoutubeThreads((prev) =>
        prev.filter((item) => item.threadId !== threadId)
      );
    }
    setSelectedData(selectedDataCopy);

    if (selectedThread.threadId === threadId) {
      setSelectedThread(filterData?.[0] || {});
    }
  }

  const handleRedditContent = ({
    redditData
  }) => {
    const processedThreads = redditData.map(thread => {
      const { title, postBody, commentsBody = [] } = thread;
      const formattedText = FormatRedditContent(title, postBody, commentsBody)

      return { postTitle: title, formattedText };
    });

    const postTitles = processedThreads.map(result => result.postTitle);
    const formattedTexts = processedThreads.map(result => result.formattedText);

    let combinedPostTitle;

    if (postTitles.length === 1) {
      combinedPostTitle = postTitles[0];
    } else {
      let numberOfLetters = Math.ceil(12 / Math.sqrt(postTitles.length));

      if (numberOfLetters < 3) {
        numberOfLetters = 3;
      } else if (numberOfLetters > 12) {
        numberOfLetters = 12;
      }

      combinedPostTitle = `combined${postTitles.length} ${postTitles.slice(0, 3).map(title => title.slice(0, numberOfLetters)).join(', ')}`;
    }

    const combinedFormattedText = formattedTexts.join('\n');

    dispatch(SetThreadState({
      field: 'redditPrePromptDetails',
      value: {
        chatTitle: combinedPostTitle,
        chatPrePrompt: combinedFormattedText
      }
    }));
  };


  const saveCurrentSelection = () => {
    const currentYoutubeSelection = Object.entries(selectedData).map(([threadId, { captions, comments }]) => ({
      threadId,
      captions,
      comments,
    }));

    setSelectedYoutubeThreads(currentYoutubeSelection);

    const redditThreadId = data.filter(row => row.platform === PLATFORMS.REDDIT).map(row => ({ threadId: row.threadId, mode: row.mode }));

    setSelectedRedditThreads(redditThreadId);

    handleSaveOptions({
      redditThreadsIds: redditThreadId,
      youtubeThreadsIds: currentYoutubeSelection
    });
  };

  const handleSelectPrompt = () => {
    const uniquePlatforms = uniq(map(data, 'platform'));

    const currentYoutubeSelection = Object.entries(selectedData).map(([threadId, { captions, comments }]) => ({
      threadId,
      captions,
      comments,
    }));

    const noCaptionsThreads = data.filter(row => row.captionTrackNotFound || row.engCaptionsNotAvailable);

    // Remove objects from `currentYoutubeSelection` if their `threadId` is in `noCaptionsThreads`
    const filteredYoutubeSelection = currentYoutubeSelection.filter(
      youtubeItem => !noCaptionsThreads.some(noCaptionItem => noCaptionItem.threadId === youtubeItem.threadId)
    );

    const redditData = data.filter(row => row.platform === PLATFORMS.REDDIT);

    const redditThreadId = redditData.map(row => ({
      threadId: row.threadId,
      mode: row.mode
    }));

    if (uniquePlatforms.length === 1) {
      const platform = uniquePlatforms[0];

      if (platform === PLATFORMS.REDDIT) {
        handleRedditContent({ redditData });

        dispatch(SetThreadState({ field: 'platformForContent', value: PLATFORMS.REDDIT }));
        dispatch(SetThreadState({ field: 'selectedRedditThreadsList', value: redditThreadId }));
        dispatch(SetThreadState({ field: 'selectedYoutubeThreadsList', value: filteredYoutubeSelection }));

        router.push(paths.dashboard.post.root);
        onClearData();
      } else if (platform === PLATFORMS.YOUTUBE) {
        if (!filteredYoutubeSelection.length) {
          enqueueSnackbar('Select Video with captions available to generate content!', { variant: 'warning' });
        } else {
          if (noCaptionsThreads.length) {
            enqueueSnackbar('Videos with no captions are skipped!', { variant: 'warning' });
          }

          dispatch(SetThreadState({ field: 'platformForContent', value: PLATFORMS.YOUTUBE }));
          dispatch(SetThreadState({ field: 'selectedRedditThreadsList', value: redditThreadId }));
          dispatch(SetThreadState({ field: 'selectedYoutubeThreadsList', value: filteredYoutubeSelection }));

          router.push(paths.dashboard.post.root);
          onClearData();
        }
      }
    } else if (uniquePlatforms.length > 1) {
      // call the multi platform
      if (!filteredYoutubeSelection.length && redditData.length) {
        if (noCaptionsThreads.length) {
          enqueueSnackbar('Videos with no captions are skipped!', { variant: 'warning' });
        }

        handleRedditContent({ redditData });

        dispatch(SetThreadState({ field: 'platformForContent', value: PLATFORMS.REDDIT }));
        dispatch(SetThreadState({ field: 'selectedRedditThreadsList', value: redditThreadId }));
        dispatch(SetThreadState({ field: 'selectedYoutubeThreadsList', value: filteredYoutubeSelection }));
        router.push(paths.dashboard.post.root);
        onClearData();
        return;
      }
      if (!filteredYoutubeSelection.length && !redditData.length) {
        enqueueSnackbar('Select threads which have content to proceed!', { variant: 'warning' });
        return;
      }

      dispatch(SetThreadState({ field: 'platformForContent', value: PLATFORMS.MULTIPLE_PLATFORMS }));
      dispatch(SetThreadState({ field: 'selectedRedditThreadsList', value: redditThreadId }));
      dispatch(SetThreadState({ field: 'selectedYoutubeThreadsList', value: filteredYoutubeSelection }));

      router.push(paths.dashboard.post.root);
      onClearData();
    }
  };

  useEffect(() => {
    if (youtubeDataForPreview.length) {
      const selectedDateCopy = youtubeDataForPreview.reduce((acc, row) => {
        const prevThread = selectedYoutubeThreadsList.find(rowVal => rowVal.threadId === row.threadId);
        const objectValues = {};
        const {
          comments: prevSelectedComments,
          captions: prevSelectedCaptions
        } = prevThread || {};

        const top5CommentIds = row.comments?.length ? take(orderBy(row.comments, ['likeCount'], ['desc']), 5).map(comment => comment._id) : [];

        if (prevSelectedComments === 'top') {
          extend(objectValues, { comments: top5CommentIds });
        } else {
          extend(objectValues, { comments: prevSelectedComments });
        }

        if (prevSelectedCaptions === 'all') {
          extend(objectValues, { captions: 'all' });
        } else {
          extend(objectValues, { captions: prevSelectedCaptions });
        }

        acc[row.threadId] = objectValues;
        return acc;
      }, {});

      setSelectedData({ ...selectedDateCopy });
    }
  }, [youtubeDataForPreview]);

  useEffect(() => {
    const youtubeThreadsId = selectedYoutubeThreadsList.map(row => row.threadId);

    dispatch(FetchAndSaveYoutubeThreadCaptions({
      youtubeThreadsId
    }));
  }, []);

  useEffect(() => {
    const redditThreadsId = selectedRedditThreadsList.map(row => row.threadId);

    dispatch(FetchRedditThreadDetails({
      redditThreadsId
    }));
  }, [])

  useEffect(() => {
    if (!getYoutubeDataForPreviewLoading && !getRedditDataForPreviewLoading) {
      const combineData = [
        ...youtubeDataForPreview,
        ...redditDataForPreview
      ];
      setData(combineData);

      if (isEmpty(selectedThread)) setSelectedThread(combineData?.[0] || null);
    }

  }, [redditDataForPreview, youtubeDataForPreview, getYoutubeDataForPreviewLoading, getRedditDataForPreviewLoading]);

  const onClearData = () => {
    setData([]);
    setSelectedData({});
    setSelectedThread({})

    dispatch(SetThreadState({ field: 'redditDataForPreview', value: [] }));
    dispatch(SetThreadState({ field: 'youtubeDataForPreview', value: [] }));
  };
  
  const md = useMediaQuery("(max-width:550px)");
  const isMobile = useMediaQuery("(max-width:767px)");
  const lg = useMediaQuery("(max-width:899px)");
  const xs = useMediaQuery("(max-width:375px)");
  const sm = useMediaQuery("(max-width:480px)");

  const sectionWidth = useMemo(() => {
    if (xs) return "calc(100vw - 70px)";
    if (sm) return "calc(100vw - 80px)";
    if (md) return "calc(100vw - 84px)";
    return 'calc(100vw - 110px)';
  }, [xs, sm, md]);

  const getPlatformIcons = () => {
    const icons = [];

    if (selectedYoutubeThreadsList.length > 0) {
      icons.push(
        <Box sx={{ position: 'relative', textAlign: 'center' }} key="youtube-icon">
          <IconButton color="primary">
            <YouTubeIcon color="error" />
          </IconButton>
          <Typography sx={{ color: 'green', fontSize: '0.75rem', }}>
            YouTube
          </Typography>
        </Box>
      );
    }

    if (selectedRedditThreadsList.length > 0) {
      icons.push(
        <Box sx={{ position: 'relative', textAlign: 'center' }} key="reddit-icon">
          <IconButton color="primary">
            <RedditIcon color="error" />
          </IconButton>
          <Typography sx={{ color: 'green', fontSize: '0.75rem', }}>
            Reddit
          </Typography>
        </Box>
      );
    }

    return icons;
  };
  const renderSubtitleIcon = (thread) => {
    if (thread.platform === PLATFORMS.YOUTUBE) {
      if (thread.captionTrackNotFound || thread.engCaptionsNotAvailable) {
        return <SubtitlesOffIcon color="error" />;
      }
      return <SubtitlesIcon color="success" />;
    }
    return null;
  };
  const isXxl = useMediaQuery("(max-width:1132)");
  const isXl = useMediaQuery("(max-width:1131)");
  const isLg = useMediaQuery("(min-width:1096px)");
  const isMd = useMediaQuery("(max-width:945px)");
  const isTab = useMediaQuery("(max-width:813px)");
  const isSmallMobile = useMediaQuery("(max-width:767px)");

  const containerWidth = useMemo(() => {
    if (isSmallMobile) return "81vw !important";
    if (isTab) return "50vw !important";
    if (isMd) return "53vw !important";
    if (isXl) return "62vw !important";
    if (isLg) return "72vw!important";
    if (isXxl) return "58vw";
    return "58vw";
}, [isXl, isLg, isMd, isSmallMobile, isTab, isXxl, xs, sm, md]);
  return (
    <Drawer
      open={open}
      onClose={() => {
        onClose();
        onClearData();
      }}
      anchor="right"
      sx={{
        '& .MuiDrawer-paper': {
          width: '90%',
        },

      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: isMobile ? '0px' : drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: isMobile ? '0px' : drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {isMobile ? null : <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
              }}
            >
              {getPlatformIcons()}
            </Box>
            <Box sx={{ overflow: 'auto' }}>
              <ThreadList
                threads={data}
                selectedThreadId={selectedThread?.threadId}
                onSelectThread={handleSelectThread}
                onDeleteThread={handleDeleteThread}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Button
                disabled={!data.length}
                variant="outlined"
                color="primary"
                onClick={() => {
                  saveCurrentSelection();
                  onClose();
                  onClearData();
                }}
              >
                Save Threads
              </Button>
            </Box>
          </Drawer>}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              p: 2,
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            {getPlatformIcons()}
          </Box>

          <Box sx={{ overflow: 'auto' }}>
            <ThreadList
              threads={data}
              selectedThreadId={selectedThread?.threadId}
              onSelectThread={handleSelectThread}
              onDeleteThread={handleDeleteThread}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              p: 2,
              left: 0,
              right: 0,
              borderTop: 1,
              borderColor: 'divider',
              position: 'fixed',
              bottom: 0,
              backgroundColor: 'background.paper',
              zIndex: 1,
            }}
          >
            <Button
              disabled={!data.length}
              variant="outlined" color="primary" onClick={() => { saveCurrentSelection(); onClose(); onClearData(); }}>
              Save Threads
            </Button>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          {isMobile && <Box >
            {isMobile && <Box sx={{ display: 'flex', pb: 1, justifyContent: 'space-between', borderBottom: `1px solid`, alignItems: 'center' }} >
              {isMobile && <IconButton
                color="primary"
                sx={{ padding: '0px' }}
                onClick={() => {
                  onClose();
                  onClearData();
                }}
              >
                <ArrowBackIcon />
              </IconButton>}
              <Box sx={{ display: 'flex', alignItems: 'center' }} gap={1}>
                <Button
                  sx={{ marginRight: '2px', fontSize: { xs: 10, sm: 14 } }}
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    saveCurrentSelection();
                    handleSelectPrompt();
                  }}
                  disabled={!data.length}
                >Save & Select Prompt</Button>

                <Button
                  variant="outlined"
                  sx={{ fontSize: { xs: 10, sm: 14 } }}
                  color="primary"
                  onClick={() => {
                    handleSelectPrompt();
                  }}
                  disabled={!data.length}
                >Select Prompt</Button>
              </Box>
            </Box>}
            <Box display="flex" mt={2} gap="16px" alignItems="flex-end">
              <Box display="flex" alignItems="center" gap={1} overflow="auto" width={sectionWidth}>
                {data.map((item, index) => (
                  <Box onClick={() => {
                    handleSelectThread(item.threadId);
                    setSelectedThread(item);
                    setActiveClass(index);
                  }} key={index} gap={1} borderRadius={1} sx={{ display: 'flex', width: '210px', py: '4px', justifyContent: 'space-between', background: activeClass === index ? '#006063' : '#ddd', px: 2, border: '1px solid #ddd', alignItems: 'center', marginBottom: '8px' }}>
                    {item.platform === PLATFORMS.YOUTUBE ? (
                      <YouTubeIcon color="error" />
                    ) : (
                      <RedditIcon color="error" />
                    )}
                    <Typography sx={{ fontSize: 14, whiteSpace: 'nowrap', color: activeClass === index ? '#fff' : '#000', }} onClick={() => handleSelectThread(item.threadId)}>{item.title.length > 10 ? `${item.title.slice(0, 10)}...` : item.title}</Typography>
                    <Box display="flex" alignItems="center" gap="2px">
                      {renderSubtitleIcon(item)}
                      <IconButton
                        edge="end"
                        sx={{ color: activeClass === index ? '#fff' : 'red' }}
                        aria-label="delete"
                        onClick={() => handleDeleteThread({ threadId: item.threadId, platform: item.platform })}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gridGap: 2,
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                {!isMobile && <IconButton
                  color="primary"
                  sx={{ padding: '0px', mt: lg ? '8px' : '4px' }}
                  onClick={() => {
                    onClose();
                    onClearData();
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>}
                <CustomBreadcrumbs
                  heading="Generate Content: Review Selection"
                  links={[
                    {
                      name: 'Threads List',
                    },
                    { name: 'Generate Content: Review Selection' },
                  ]}
                  sx={{
                    marginBottom: '0px !important',
                    marginTop: '0px !important',
                  }}
                />
              </Box>
            </Box>
            {!isMobile && <Box display="flex" alignItems="center" gap={1}>
              <Button
                sx={{ marginRight: '2px', }}
                variant="outlined"
                color="primary"
                onClick={() => {
                  saveCurrentSelection();
                  handleSelectPrompt();
                }}
                disabled={!data.length}
              >Save & Select Prompt</Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  handleSelectPrompt();
                }}
                disabled={!data.length}
              >Select Prompt</Button>
            </Box>}
          </Box>

          {(getYoutubeDataForPreviewLoading || getRedditDataForPreviewLoading) ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 200px)',
                width: '100%',
              }}
            >
              <LoadingScreen />
            </Box>
          ) : (
            <Container sx={{padding: '0 !important', maxWidth: containerWidth}}>
              {selectedThread && selectedThread.platform === PLATFORMS.YOUTUBE && (
                <YoutubeThreadContent
                  thread={selectedThread}
                  selectedData={selectedData[selectedThread.threadId]}
                  onSelectCaption={handleCaptionSelection}
                  onSelectComment={handleCommentSelection}
                  onAllCommentsSelect={handleAllCommentsSelect}
                  onAllCaptionsSelect={handleAllCaptionsSelect}
                />
              )}
              {selectedThread && selectedThread.platform === PLATFORMS.REDDIT && (
                <Box sx={{ marginTop: '0px', width:isMobile ? 'calc(100vw - 20vw)' : '100%' }}>
                  <RedditThreadContent
                    thread={selectedThread}
                  />
                </Box>
              )}
            </Container>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}
