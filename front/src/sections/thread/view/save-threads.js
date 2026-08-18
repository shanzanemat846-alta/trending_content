'use client';

import { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import RedditIcon from '@mui/icons-material/Reddit';
import YoutubeIcon from '@mui/icons-material/YouTube';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import { CustomSwitch } from 'src/components/toggle';
import Tooltip from '@mui/material/Tooltip';
import { def_id } from 'src/config-global';
import { Divider, Stack } from '@mui/material';
import Image from 'next/image';

import { LoadingScreen } from 'src/components/loading-screen';
import { useSnackbar } from 'src/components/snackbar';
import { AuthContext } from 'src/auth/context/jwt/auth-context';


import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';

import { GetUserSubscriptionPlanDetail } from 'src/app/lib/slices/subscription-slice';
import { UpdateProject, GetProject, SetProjectState } from 'src/app/lib/slices/project-slice';

import { GetSaveThreads, SetThreadState, SummarizeThreads, DownloadThreads, ResetThreadNotify } from 'src/app/lib/slices/thread-slice';

import { PLATFORMS } from 'src/utils/constants';

import ProductCaptionsAndCommentsView from './product-captions-and-comments-view';
import SummaryModal from '../summarize-finding';

const SAVE_THREADS_HEADER = [
  { id: 'name', label: 'Title' },
  { id: 'url', label: 'Url' },
  { id: 'imageUrl', label: 'Image Url' },
  { id: 'upVotes/likes', label: 'UpVotes/Likes' },
  { id: 'comments', label: 'Comments' },
  { id: 'category', label: 'Category' },
  { id: 'action', label: 'Action' },
];

const SaveThreads = ({
  setSaveThreads,
  projectId,
  setSaveThreadsSelection,
  handleSaveOptions
}) => {
  const dispatch = useAppDispatch();

  const {
    summaryFailed,
    notify: threadNotify,
    notifyMessage: threadNotifyMessage,
    notifyType: threadNotifyType,
    getSummarizeFindingLoading,
    getSaveThreadsLoading,
    saveThreads,
    summaryFindingDetails,
    exportThreadsLoading
  } = useAppSelector((state) => state.thread);

  const {
    projectUpdated,
    updatingProjectDetails,
    currentProject,
  } = useAppSelector((state) => state.project);

  const { user } = useContext(AuthContext);

  const { enqueueSnackbar } = useSnackbar();
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedYoutubeThreads, setSelectedYoutubeThreads] = useState([]);
  const [selectedRedditThreads, setSelectedRedditThreads] = useState([]);
  const [makeSelection, setMakeSelection] = useState(false);
  const [deleteThread, setDeleteThread] = useState();
  const [deleteRow, setDeleteRow] = useState(null);
  const [allReadyVisited, setAllReadyVisited] = useState(true);
  const [isAllThreads, setIsAllThreads] = useState('save threads');
  const [summarizeFindModal, setSummarizeFindModal] = useState(false);


  useEffect(() => {
    console.log('threadNotify && threadNotifyMessage: ', threadNotify, threadNotifyMessage);
    if (threadNotify && threadNotifyMessage) {
      enqueueSnackbar(threadNotifyMessage, { variant: threadNotifyType });
      dispatch(ResetThreadNotify());

      dispatch(GetUserSubscriptionPlanDetail({ userId: user._id }));
    }
  }, [threadNotifyMessage, threadNotify, threadNotifyType]);

  useEffect(() => {
    if (summaryFailed) {
      setSummarizeFindModal(false);
      SetThreadState({
        field: "summaryFindingDetails",
        value: {
          summary: "",
          subReddit: [],
          faqs: [],
          threads: []
        },
      });
      dispatch(SetThreadState({ field: "summaryFailed", value: false }))
    }
  }, [summaryFailed]);

  useEffect(() => {
    if (projectId !== def_id) {
      dispatch(GetProject({
        projectId
      }));
    }
  }, []);

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? tableData.map((row) => row._id) : []);
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const getSaveThreads = () => {
    if (projectId !== def_id) {
      dispatch(GetSaveThreads({ projectId }));
    }
  }

  const handleGenerateContent = () => {
    const { selectedThreadsList } = currentProject;

    const { redditThreadsIds = [], youtubeThreadsIds = [] } = selectedThreadsList;

    const filteredRedditThreads = redditThreadsIds.filter(row => selectedRows.includes(row.threadId));
    const filteredYoutubeThreads = youtubeThreadsIds.filter(row => selectedRows.includes(row.threadId));

    setSelectedYoutubeThreads(filteredYoutubeThreads);
    setSelectedRedditThreads(filteredRedditThreads);
    setMakeSelection(true);
  }

  useEffect(() => {
    if (saveThreads.length) {
      if (allReadyVisited) setSelectedRows(saveThreads.map((row) => row._id));
      setAllReadyVisited(false);
      setTableData(saveThreads);
    }
    else {
      setTableData([]);
      setSelectedRows([]);
    }
  }, [saveThreads]);

  useEffect(() => {
    getSaveThreads();
  }, []);

  useEffect(() => () => {
    console.log('here un-mount component');
    dispatch(SetThreadState({ field: 'saveThreads', value: [] }));
  }, [])

  useEffect(() => {
    if (selectedRows.length) setSaveThreadsSelection(true);
    else setSaveThreadsSelection(false);
  }, [selectedRows]);

  const getIcon = ({ platform }) => {
    if (platform === PLATFORMS.REDDIT) return <RedditIcon color="error" sx={{ width: 20, height: 20, mr: 2 }} />
    if (platform === PLATFORMS.YOUTUBE) return <YoutubeIcon color="error" sx={{ width: 20, height: 20, mr: 2 }} />

    return null;
  }

  const handleDeleteSaveThreads = (row) => {
    const { _id: threadId, platform } = row;

    const updateParams = {
      selectedThreadsList: {
        redditThreadsIds: [],
        youtubeThreadsIds: []
      }
    };

    if (platform === PLATFORMS.YOUTUBE) {
      updateParams.selectedThreadsList.youtubeThreadsIds = [
        ...(updateParams.selectedThreadsList.youtubeThreadsIds || []),
        threadId
      ];
    } else if (platform === PLATFORMS.REDDIT) {
      updateParams.selectedThreadsList.redditThreadsIds = [
        ...(updateParams.selectedThreadsList.redditThreadsIds || []),
        threadId
      ];
    }
    setDeleteThread(true);
    setDeleteRow(row);

    dispatch(UpdateProject({
      projectId,
      action: "deleteSaveThreads",
      updateParams
    }));
  };

  const handleBulkDeleteSaveThreads = () => {

    const updateParams = {
      selectedThreadsList: {
        redditThreadsIds: [],
        youtubeThreadsIds: []
      }
    };

    const rowsToDelete = tableData.filter(row => selectedRows.includes(row._id));

    rowsToDelete.forEach(row => {
      const { _id: threadId, platform } = row;

      if (platform === PLATFORMS.YOUTUBE) {
        updateParams.selectedThreadsList.youtubeThreadsIds.push(threadId);
      } else if (platform === PLATFORMS.REDDIT) {
        updateParams.selectedThreadsList.redditThreadsIds.push(threadId);
      }
    });

    setDeleteThread(true);
    setDeleteRow(rowsToDelete);

    dispatch(UpdateProject({
      projectId,
      action: "deleteSaveThreads",
      updateParams
    }));
  };

  const handleSummarized = () => {
    console.log('here the selected threads', { selectedRows });
    setSummarizeFindModal(true);
    dispatch(SummarizeThreads({
      threadsList: selectedRows
    }))
  };

  const handleDownload = () => {
    dispatch(DownloadThreads({ threadsList: selectedRows }))
  };

  useEffect(() => {
    if (!summarizeFindModal) {
      dispatch(SetThreadState({
        field: "summaryFindingDetails", value: {
          summary: "",
          subReddit: [],
          faqs: [],
          threads: []
        }
      }));
    }
  }, [summarizeFindModal]);

  useEffect(() => {
    if (deleteThread && !isEmpty(deleteRow) && projectUpdated) {
      let updatedThreads = saveThreads;
      let updatedSelectedRows = selectedRows;

      if (Array.isArray(deleteRow)) {
        const deleteIds = deleteRow.map(row => row._id);
        updatedThreads = saveThreads.filter(row => !deleteIds.includes(row._id));
        updatedSelectedRows = selectedRows.filter(id => !deleteIds.includes(id));
      } else {
        updatedThreads = saveThreads.filter(row => row._id !== deleteRow._id);
        updatedSelectedRows = selectedRows.filter(id => id !== deleteRow._id);
      }

      setSelectedRows(updatedSelectedRows);
      dispatch(SetThreadState({ field: 'saveThreads', value: updatedThreads }));
      dispatch(SetProjectState({ field: 'projectUpdated', value: false }));
      setDeleteThread(false);
      setDeleteRow(null);
    }
  }, [deleteThread, projectUpdated])

  useEffect(() =>
    () => {
      setTableData([]);
      setSelectedRedditThreads([]);
      setSelectedYoutubeThreads([]);
    }, [])

  return (
    <>
      <Box
        sx={{
          backgroundColor: '#c8fad6',
          display: {
            xs: 'none',
            sm: 'flex',
          },
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gridRowGap: 8,
          padding: 2,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
          <CustomSwitch setShowAllThreads={setSaveThreads} showAllThreads={saveThreads} />
          <Box sx={{ typography: 'body2' }}>
            <strong>{`${saveThreads.length} : `}</strong>
            <Box component="span" sx={{ color: 'text.secondary', }}>
              results found
            </Box>
          </Box>

          <Box sx={{ typography: 'body2', }}>
            <strong>{`${selectedRows.length} : `}</strong>
            <Box component="span" sx={{ color: 'text.secondary' }}>
              Selected
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, md: 2 } }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              handleDownload();
            }}
            sx={{
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              // width: { xs: '80vw', sm: 'auto' },
              gap: '8px',
            }}
            disabled={exportThreadsLoading || !selectedRows?.length}
          >
            <Image src={exportThreadsLoading || !selectedRows?.length ? "/assets/export-grey-icon.svg" : "/assets/export-icon.svg"} width={20} height={20} />
            <Typography variant="body2" sx={{ color: exportThreadsLoading || !selectedRows?.length ? 'grey' : 'black' }}>
              {exportThreadsLoading ? "Exporting..." : "Export"}
            </Typography>
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              handleSummarized();
            }}
            sx={{
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              width: { xs: '80vw', sm: 'auto' },
              gap: '8px',
            }}
            disabled={!selectedRows?.length}
          >
            <Image src={!selectedRows?.length ? "/assets/file-grey.svg" : "/assets/file.svg"} width={20} height={20} />
            <Typography variant="body2" sx={{ color: !selectedRows?.length ? 'grey' : 'black' }}>
              Summarize Finding
            </Typography>
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              handleBulkDeleteSaveThreads();
            }}
            sx={{
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              width: { xs: '80vw', sm: 'auto' },
              gap: '8px',
            }}
          >
            <Image src="/assets/un-safe.svg" width={20} height={20} />
            <Typography variant="body2" sx={{ color: 'black' }}>
              Unsave Threads
            </Typography>
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleGenerateContent}
            sx={{
              backgroundColor: 'transparent',
              '&:hover': { backgroundColor: 'transparent' },
              gap: '8px',
            }}
            disabled={!saveThreads.length || !selectedRows.length}
          >
            <Image src={!saveThreads.length || !selectedRows.length ? "/assets/Plus-grey-icon.svg" : "/assets/Plus-icon.svg"} width={20} height={20} />
            <Typography variant="body2" sx={{ color: !saveThreads.length || !selectedRows.length ? 'grey' : 'black' }}>
              Generate Content
            </Typography>
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: '#c8fad6',
          display: {
            xs: 'flex',
            sm: 'none',
          },
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gridRowGap: {
            xs: '2px',
            sm: 8
          },
          padding: 2,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
          <CustomSwitch setShowAllThreads={setSaveThreads} showAllThreads={saveThreads} />
        </Box>
        <Box width='100%'>
          <Box width='100%' sx={{
            display: {
              xs: 'flex',
              sm: 'none'
            }
          }} maxWidth='100%' borderRadius='5px' p='4px' gap='6px' bgcolor='#63AA58' display='grid' gridTemplateColumns='1fr 1fr'>
            <Typography onClick={() => {
              setSaveThreads(!saveThreads);
            }} width='100%' textAlign='center' padding='5px 13px' fontSize='12px' fontWeight='600' color={isAllThreads === 'all threads' ? "#63AA58" : '#C1DDBC'} bgcolor={isAllThreads === 'all threads' ? '#fff' : null} borderRadius='5px'>All Threads</Typography>
            <Typography width='100%' textAlign='center' padding='5px 13px' fontSize='12px' fontWeight='600' color={isAllThreads === 'save threads' ? "#63AA58" : '#C1DDBC'} bgcolor={isAllThreads === 'save threads' ? '#fff' : null} borderRadius='5px'>Save Threads</Typography>
          </Box>
          <Divider sx={{
            borderColor: '#939AA766', display: {
              xs: 'flex',
              sm: 'none'
            }, marginBlock: '6px'
          }} />
          <Box sx={{
            display: {
              xs: 'flex',
              sm: 'none'
            }
          }} gap="24px" alignItems='center' justifyContent="space-between">
            <Stack direction='row' spacing={2}>
              <Typography fontSize={10} fontWeight={500} color='#63AA58'>results found:</Typography>
              <Typography fontSize={10} fontWeight={500} color='#898989'>{saveThreads.length}</Typography>
            </Stack>
            <Box orientation='vertical' sx={{ backgroundColor: '#939AA766', width: "1px", height: '12px', marginBlock: '6px' }} />
            <Stack direction='row' spacing={2}>
              <Typography fontSize={10} fontWeight={500} color='#63AA58'>Selected:</Typography>
              <Typography fontSize={10} fontWeight={500} color='#898989'>{selectedRows.length}</Typography>
            </Stack>
          </Box>
          <Box sx={{
            typography: 'body2', display: {
              xs: 'none',
              sm: 'flex'
            }
          }}>
            <strong>{`${saveThreads.length} : `}</strong>
            <Box component="span" sx={{ color: 'text.secondary', }}>
              results found
            </Box>
          </Box>

          <Box sx={{
            typography: 'body2', display: {
              xs: 'none',
              sm: 'flex'
            }
          }}>
            <strong>{`${selectedRows.length} : `}</strong>
            <Box component="span" sx={{ color: 'text.secondary' }}>
              Selected
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { sm: 'row' }, gap: { xs: '6px', md: 2 } }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleGenerateContent}
            sx={{
              backgroundColor: 'transparent',
              borderColor: '#63AA58',
              flexDirection: 'column',
              gap: '2px',
              height: '42px',
              paddingInline: '8px',
              '&:hover': { backgroundColor: 'transparent' },
              gridGap: '3px',
            }}
            disabled={!saveThreads.length || !selectedRows.length}
          >
            <Image src={!saveThreads.length || !selectedRows.length ? "/assets/Plus-grey-icon.svg" : "/assets/Plus-icon.svg"} width={12} height={12} />
            <Typography variant="body2" sx={{
              color: !saveThreads.length || !selectedRows.length ? 'grey' : '#63AA58', fontWeight: '500', fontSize: {
                xs: 10,
                sm: 14
              }
            }}>
              Generate Content
            </Typography>
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              handleDownload();
            }}
            sx={{
              backgroundColor: 'transparent',
              borderColor: '#63AA58',
              padding: 0,
              '&:hover': {
                backgroundColor: 'transparent',
              },
              flexDirection: 'column',
              width: { sm: 'auto' },
              gap: '2px',
              height: '42px',
            }}
            disabled={exportThreadsLoading || !selectedRows?.length}
          >
            <Image src={exportThreadsLoading || !selectedRows?.length ? "/assets/export-grey-icon.svg" : "/assets/export-icon.svg"} width={12} height={12} />
            <Typography variant="body2" sx={{
              color: exportThreadsLoading || !selectedRows?.length ? 'grey' : '#63AA58', fontWeight: '500', fontSize: {
                xs: 10,
                sm: 14
              }
            }}>
              {exportThreadsLoading ? "Exporting..." : "Export"}
            </Typography>
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              handleBulkDeleteSaveThreads();
            }}
            sx={{
              backgroundColsor: 'transparent',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              flexDirection: 'column',
              width: { sm: 'auto' },
              gap: '2px',
              height: '42px',
            }}
            disabled={exportThreadsLoading || !selectedRows?.length}
          >
            <Image src={exportThreadsLoading || !selectedRows?.length ? "/assets/un-safe-grey.svg" : "/assets/un-safe.svg"} width={12} height={12} />
            <Typography variant="body2" sx={{
              color: exportThreadsLoading || !selectedRows?.length ? 'grey' : '#63AA58', fontWeight: '500', fontSize: {
                xs: 10,
                sm: 14
              }
            }}>
              Unsave
            </Typography>
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              handleSummarized();
            }}
            sx={{
              backgroundColor: 'transparent',
              borderColor: '#63AA58',
              padding: 0,
              '&:hover': {
                backgroundColor: 'transparent',
              },
              flexDirection: 'column',
              width: { sm: 'auto' },
              gap: '2px',
              height: '42px',
            }}
            disabled={!selectedRows?.length}
          >
            <Image src={!selectedRows?.length ? "/assets/file-grey.svg" : "/assets/file.svg"} width={12} height={12} />
            <Typography variant="body2" sx={{
              color: !selectedRows?.length ? 'grey' : '#63AA58', fontWeight: '500', fontSize: {
                xs: 10,
                sm: 14
              }
            }}>
              Summarize
            </Typography>
          </Button>
        </Box>
      </Box>
      {updatingProjectDetails || getSaveThreadsLoading ? <LoadingScreen
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999
        }}
      /> : null}

      <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
        <Table stickyHeader aria-label="sticky table">
          {/* Table Head */}
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={(selectedRows.length > 0) && (selectedRows.length < saveThreads.length)}
                  checked={selectedRows.length && selectedRows.length === saveThreads.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              {SAVE_THREADS_HEADER.map((header) => (
                <TableCell sx={{ whiteSpace: 'nowrap' }} key={header.id}>{header.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {tableData.length > 0 ? tableData.map((row) => (
              <TableRow key={row.id} selected={selectedRows.includes(row.id)}>
                <TableCell sx={{ whiteSpace: 'nowrap' }} padding="checkbox">
                  <Checkbox
                    checked={selectedRows.includes(row._id)}
                    onChange={() => handleSelectRow(row._id)}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }} > {getIcon({ platform: row.platform })}
                  <Tooltip title={row.title?.length > 60 ? row.title : ''} arrow>
                    <Typography
                      variant="p"
                      gutterBottom
                      sx={{
                        position: 'relative',
                        textAlign: 'left',
                      }}
                    >
                      {row.title?.length > 60 ? `${row.title?.slice(0, 60)} ...` : row.title}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <a href={row.platform === PLATFORMS.REDDIT ? `https://reddit.com${row.url}` : row.url} target="_blank" rel="noopener noreferrer">
                    {row.platform === PLATFORMS.REDDIT ? "https://reddit.com/r/..." : "https://youtube.com/r..."}
                  </a>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {row.imageurl === 'empty' || isEmpty(row.imageurl) ? <p>empty</p> :
                    <a href={row.imageurl} target="_blank" rel="noopener noreferrer" style={{ color: 'grey' }}>
                      {row.platform === PLATFORMS.REDDIT ? 'https://i.reddit.it/...' : 'https://i.ytimg.com'}
                    </a>
                  }
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {row.platform === PLATFORMS.REDDIT ? (row?.upvotes || 0) : (row?.youtubeVideoDetails?.likeCount || 0)}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {row.platform === PLATFORMS.REDDIT ? (row?.comments || 0) : (row?.youtubeVideoDetails?.comments || 0)}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={row.category?.length > 15 ? row.category : ''} arrow>
                    <Typography
                      variant="p"
                      gutterBottom
                      sx={{
                        position: 'relative',
                        textAlign: 'left',
                      }}
                    >
                      {row.category?.length > 15 ? `${row.category?.slice(0, 15)} ...` : row.category}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteSaveThreads(row)}
                  >
                    <BookmarkRemoveIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
              : <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap' }} colSpan={7} align="center">
                  <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    No saved data
                  </div>
                </TableCell>
              </TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {makeSelection
        ?
        <ProductCaptionsAndCommentsView
          setSelectedRedditThreads={setSelectedRedditThreads}
          setSelectedYoutubeThreads={setSelectedYoutubeThreads}
          selectedRedditThreads={selectedRedditThreads}
          selectedYoutubeThreads={selectedYoutubeThreads}
          handleSaveOptions={handleSaveOptions}
          open={makeSelection}
          onClose={() => setMakeSelection(false)}
        />
        : null
      }

      {
        summarizeFindModal ?
          <SummaryModal
            open={summarizeFindModal}
            onClose={() => {
              setSummarizeFindModal(false)
              SetThreadState({
                field: "summaryFindingDetails",
                value: {
                  summary: "",
                  subReddit: [],
                  faqs: [],
                  threads: []
                },
              })
            }}
            loading={getSummarizeFindingLoading}
            summary={summaryFindingDetails?.summary}
            subReddit={summaryFindingDetails?.subReddit}
            faqs={summaryFindingDetails?.faqs}
            threads={summaryFindingDetails?.threads}
          />
          : null
      }
    </>
  );
};

SaveThreads.propTypes = {
  projectId: PropTypes.string,
};

export default SaveThreads;
