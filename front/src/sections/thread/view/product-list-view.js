'use client';

import PropTypes from 'prop-types';
import { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { extend, uniq, isEmpty, isEqual } from 'lodash';
import Image from 'next/image';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import RedditIcon from '@mui/icons-material/Reddit';
import YoutubeIcon from '@mui/icons-material/YouTube';
import SaveIcon from '@mui/icons-material/Save';
import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Checkbox from '@mui/material/Checkbox';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapVertIcon from '@mui/icons-material/SwapVert';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';

import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import VideoCard from 'src/components/cards';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Stepper from 'src/components/stepper/stepper';
import { useHandleStepClick } from 'src/components/stepper/handle-step-click';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomSwitch } from 'src/components/toggle';
import { host } from 'src/utils/APIRoutes';
import axios from 'axios';
import { useSnackbar } from 'src/components/snackbar';
import { def_id } from 'src/config-global';
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { SetCampaignState } from 'src/app/lib/slices/campaign-slice';
import { SetThreadState, GetRedditDataCount, DownloadThreads, SummarizeThreads, ResetThreadNotify } from 'src/app/lib/slices/thread-slice';
import { UpdateProject, GetProject, SetProjectState } from 'src/app/lib/slices/project-slice';
import { REDDIT_ENDPOINTS, PLATFORMS, CAMPAIGN_MODE } from 'src/utils/constants';
import { ParseDurationToMinutes, SplitText, FormatRedditContent, GetColumnForThreadsMobileView } from 'src/utils/helpers';
import { AuthContext } from 'src/auth/context/jwt/auth-context';
import { GetUserSubscriptionPlanDetail } from 'src/app/lib/slices/subscription-slice';

import ProductTableRow from '../product-table-row';
import ProductTableToolbar from '../product-table-toolbar';
import ProductTableFiltersResult from '../product-table-filters-result';

import ProductCaptionsAndCommentsView from './product-captions-and-comments-view';

import SaveThreads from './save-threads';
import SummaryModal from '../summarize-finding';

import '../index.css';


// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Title' },
  { id: 'url', label: 'Url', width: 100 },
  { id: 'images', label: 'Images', width: 100 },
  { id: 'upvotes', label: 'Upvotes', width: 60 },
  { id: 'comments', label: 'Comments', width: 60 },
  { id: 'Category', label: 'Category', width: 110 },
  { id: 'Action', label: 'Action', width: 110 },
  // { id: '', width: 2 },
];

const TABLE_HEAD_YOUTUBE = [
  { id: 'name', label: 'Title' },
  { id: 'url', label: 'Url', width: 100 },
  // { id: 'images', label: 'Images', width: 100 },
  { id: 'likeCount', label: 'Likes', width: 60 },
  // { id: 'favoriteCount', label: 'Favorite', width: 60 },
  { id: 'viewCount', label: 'Views', width: 60 },
  { id: 'comments', label: 'Comments', width: 120 },
  { id: 'Category', label: 'Category', width: 100 },
  { id: 'duration', label: 'Duration', width: 100 },
  { id: 'Action', label: 'Action', width: 110 },
];

const defaultFilters = {
  name: '',
  // publish: [],
  // stock: [],
  subReddit: [],
  keywords: []
};

// ----------------------------------------------------------------------
export default function ProductListView({ id }) {

  const { enqueueSnackbar } = useSnackbar();
  const { handleStepClick } = useHandleStepClick();

  const router = useRouter();

  const table = useTable();

  const { user } = useContext(AuthContext);

  const settings = useSettingsContext(AuthContext);

  const {
    createdCampaignId,
    createCampaignPlatformDetails,
    resetCreatedCampaign,
    threadsSynced
  } = useAppSelector((state) => state.campaign);

  const {
    updatingProjectDetails,
    getProjectLoading,
    projectUpdated,
    currentProject,
    notify: projectNotify,
    notifyMessage: projectNotifyMessage,
    notifyType: projectNotifyType
  } = useAppSelector((state) => state.project);

  const {
    selectedYoutubeThreadsList,
    selectedRedditThreadsList,
    contentCreationFails,
    getRedditDataCountLoading,
    redditDataCount,
    exportThreadsLoading,
    getSummarizeFindingLoading,
    summaryFindingDetails,
    notify: threadNotify,
    notifyMessage: threadNotifyMessage,
    notifyType: threadNotifyType,
    summaryFailed,
  } = useAppSelector((state) => state.thread);

  const dispatch = useAppDispatch();

  const [tableData, setTableData] = useState([]);
  const [selectedRowsData, setSelectedRowsData] = useState({});
  const [needToReset, setNeedToReset] = useState(false);
  const [keywordNeedToReset, setKeywordNeedToReset] = useState(false);
  const [relatedSubReddit, setRelatedSubReddit] = useState();
  const [relatedSubRedditFilter, setRelatedSubRedditFilter] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [totalCount, setTotalCount] = useState(null);
  const limit = 10;

  const [filters, setFilters] = useState(defaultFilters);
  const [mode, setMode] = useState(CAMPAIGN_MODE.SUB_REDDIT);
  const [platform, setPlatform] = useState(PLATFORMS.REDDIT);

  const [selectedYoutubeThreads, setSelectedYoutubeThreads] = useState([]);
  const [selectedRedditThreads, setSelectedRedditThreads] = useState([]);
  const [rowsDeleted, setRowsDeleted] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [summarizeFindModal, setSummarizeFindModal] = useState(false);
  const [isAllThreads, setIsAllThreads] = useState('all threads');

  const [makeSelection, setMakeSelection] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [selectedOption, setSelectedOption] = useState('allThreads'); // Initial state

  const handleChange = (event, newOption) => {
    if (newOption !== null) {
      // setSelectedOption(newOption);
      setSaveThreads(!saveThreads);
    }
  };

  const confirm = useBoolean();
  const scrollRef = useRef();

  const [twitterCount, setTwitterCount] = useState(0);

  const [saveThreads, setSaveThreads] = useState(false);
  const [saveThreadsSelection, setSaveThreadsSelection] = useState(false);

  const fetchThreadsTableData = async ({ skipValue = 0, limitValue, loadMore }) => {
    if (id === def_id) {
      return;
    }

    try {
      const {
        name,
        subReddit,
        keywords,
      } = filters;

      const filteredSubReddit = subReddit.filter((value) => value !== 'showAll');
      const filteredKeyword = keywords.filter((value) => value !== 'showAll');
      if (!loadMore) setSkip(0);

      const queryParams = {
        projectid: id,
        name,
        mode,
        skip: skipValue,
        limit: limitValue,
        platform,
        orderBy: table.orderBy,
        order: table.order,
        saveThreads
      };

      if (mode === CAMPAIGN_MODE.SUB_REDDIT) {
        extend(queryParams, { subReddit: filteredSubReddit.join(',') });
      } else if (mode === CAMPAIGN_MODE.KEYWORD) {
        extend(queryParams, {
          keywords: filteredKeyword.join(','),
          keywordSubreddits: relatedSubRedditFilter?.join(',')
        });
      }

      const response = await axios.get(`${host}/api/thread/pull`, {
        params: queryParams,
      });

      const data = response.data;

      const { totalCount: totalCountValue } = data;

      setTotalCount(totalCountValue);

      if (response.data.keywordThreads) {
        data.threads = response.data.keywordThreads
        setRelatedSubReddit(response?.data?.subRedditThreads || relatedSubReddit);
      }

      if (loadMore) {
        if (data.threads && data.threads.length > 0) {
          setTableData((prevData) => [...prevData, ...data.threads]);
          setSkip((prevSkip) => prevSkip + limit);
        }
      } else if (!loadMore && !data.threads || data.threads.length === 0) {
        setTableData([]);
      } else {
        setTableData(data.threads);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const prevDepsRef = useRef();  

  useEffect(() => {
    const currentDeps = { id, platform, filters, order: table.order, orderBy: table.orderBy, mode };
    // console.log('currentDeps: ', currentDeps);
    // console.log('prevDepsRef.current: ', prevDepsRef.current);
    if (prevDepsRef.current && isEqual(prevDepsRef.current, currentDeps)) {
      // Dependencies didn't change → skip API call
      console.log('here the same filters as prev')
      return;
    }

    // Update stored dependencies
    prevDepsRef.current = currentDeps;

    // Trigger API call
    setIsLoading(true);
    fetchThreadsTableData({ skipValue: 0, limitValue: limit, loadMore: false });
  }, [id, platform, filters, table.order, table.orderBy], mode);

  const loadMoreData = async () => {
    setIsLoading(true);
    fetchThreadsTableData({ skipValue: skip + limit, limitValue: limit, loadMore: true });
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;

    if (scrollTop + clientHeight >= scrollHeight - 10 && !isLoading) {
      loadMoreData();
    }
  };

  const denseHeight = table.dense ? 60 : 80;

  const [canReset, setCanRest] = useState(false);

  const canResetFilters = () => {
    const { subReddit, keywords } = filters;

    let filtersApplied = false;

    if (mode === CAMPAIGN_MODE.KEYWORD) {
      // Check if keywords array has one element and it's not 'showAll'
      if (keywords.length === 1) {
        filtersApplied = keywords[0] !== 'showAll';
      } else if (keywords.length > 1) {
        filtersApplied = true;
      }
    }
    if (mode === CAMPAIGN_MODE.SUB_REDDIT) {
      // Check if subReddit array has one element and it's not 'showAll'
      if (subReddit.length === 1) {
        filtersApplied = subReddit[0] !== 'showAll';
      } else if (subReddit.length > 1) {
        filtersApplied = true;
      }
    }

    setCanRest(filtersApplied);
  };

  useEffect(() => {
    canResetFilters();
  }, [mode, filters, relatedSubRedditFilter, platform]);

  const handleFilters = useCallback(
    (name, value) => {
      // console.log('handleFilters', filters, 'name', name, 'values', value)
      // prevDepsRef.current = null;
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    async (idf) => {
      try {
        await axios.delete(`${host}/api/thread/${idf}`);
        if (platform === PLATFORMS.YOUTUBE) {
          setSelectedYoutubeThreads((prevSelected) => {
            const newSelected = prevSelected.filter(
              (thread) => String(thread.threadId) !== String(idf)
            );
            return newSelected;
          });

          setRowsDeleted(true);
        }

        if (platform === PLATFORMS.REDDIT) {
          setSelectedRedditThreads((prevSelected) => {
            const newSelected = prevSelected.filter(
              (thread) => String(thread.threadId) !== String(idf)
            );
            return newSelected;
          });
          setRowsDeleted(true);
        }
      } catch (error) {
        console.error('Error deleting row:', error);
      }
    },
    [platform]
  );

  useEffect(() => {
    if (rowsDeleted) {
      setRowsDeleted(false);
      fetchThreadsTableData({ skipValue: 0, limitValue: limit, loadMore: false });
    }
  }, [rowsDeleted]);

  const handleDeleteRows = useCallback(async () => {
    try {
      const rowsToDelete = [
        ...selectedYoutubeThreads.map(thread => thread.threadId),
        ...selectedRedditThreads.map(thread => thread.threadId),
      ];

      await rowsToDelete.reduce(async (prevPromise, threadId) => {
        await prevPromise;
        return axios.delete(`${host}/api/thread/${threadId}`);
      }, Promise.resolve());

      if (selectedYoutubeThreads.length) {
        setSelectedYoutubeThreads((prevSelected) =>
          prevSelected.filter(
            (thread) => !rowsToDelete.includes(thread.threadId)
          )
        );
        setRowsDeleted(true);
      }

      if (selectedRedditThreads.length) {
        setSelectedRedditThreads((prevSelected) =>
          prevSelected.filter(
            (thread) => !rowsToDelete.includes(thread.threadId)
          )
        );
        setRowsDeleted(true);
      }
    } catch (error) {
      console.error('Error deleting rows:', error);
    }
  }, [selectedYoutubeThreads, selectedRedditThreads]);

  // ---------------------------------- AccessToken ---------------------------

  const getAccessToken = useCallback(async () => {
    const response = await axios.post(
      REDDIT_ENDPOINTS.AUTH,
      {
        grant_type: 'client_credentials',
      },
      {
        auth: {
          username: process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID,
          password: process.env.NEXT_PUBLIC_REDDIT_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'trendingContent_test',
        },
      }
    );

    const accessToken = response.data.access_token;
    return accessToken;
  }, []);

  const preprompt = async (url) => {
    const accessToken = await getAccessToken();
    const urld = `${url}.json`;
    try {
      const response = await fetch(urld, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'trendingContent_test:v0.0.1 (by /u/Last-Mycologist-5096)',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const postTitle = data[0]?.data?.children[0]?.data?.title || '';
      const postBody = data[0]?.data?.children[0]?.data?.selftext || '';
      const comments = data[1]?.data?.children || [];
      const commentsBody = comments.map(comment => comment?.data?.body || '');

      const formattedText = FormatRedditContent(postTitle, postBody, commentsBody)

      localStorage.setItem("refresh", true);
      return { postTitle, formattedText };
    } catch (error) {
      console.error('Error:', error);
      return { postTitle: '', formattedText: '' }; // Return empty values or handle error differently
    }
  };

  useEffect(() => {
    const { errorMessage, platform: platformVal } = contentCreationFails;

    if (!isEmpty(platformVal) && !isEmpty(errorMessage)) {
      if (platformVal === PLATFORMS.YOUTUBE) {
        setPlatform(PLATFORMS.YOUTUBE);
        setMode(CAMPAIGN_MODE.KEYWORD);
      }
      if (platformVal === PLATFORMS.REDDIT) {
        setPlatform(PLATFORMS.REDDIT)
        setMode(CAMPAIGN_MODE.SUB_REDDIT);
      }
      if (platformVal === PLATFORMS.MULTIPLE_PLATFORMS) {
        setPlatform(PLATFORMS.REDDIT)
        setMode(CAMPAIGN_MODE.SUB_REDDIT);
      }

      dispatch(SetThreadState({
        field: 'contentCreationFails',
        value: { platform: null, errorMessage: null }
      }));
    }
  }, [contentCreationFails]);

  const handleSelectRow = (row) => {
    if (platform === PLATFORMS.YOUTUBE) {
      setSelectedYoutubeThreads((prevSelected) => {
        const isAlreadySelected = prevSelected.some(item => item.threadId === row._id);

        if (isAlreadySelected) {
          return prevSelected.filter(item => item.threadId !== row._id);
        }

        return [
          ...prevSelected,
          {
            threadId: row._id,
            captions: 'all',
            comments: 'top',
          },
        ];
      });
    } else if (platform === PLATFORMS.REDDIT) {
      setSelectedRedditThreads((prevSelected) => {
        const isAlreadySelected = prevSelected.some(item => item.threadId === row._id);

        if (isAlreadySelected) {
          return prevSelected.filter(item => item.threadId !== row._id);
        }
        return [
          ...prevSelected,
          {
            threadId: row._id,
            mode: row.mode,
          },
        ];
      });
    }
  };

  const handleSelectAllRows = (checked) => {
    if (platform === PLATFORMS.YOUTUBE) {
      setSelectedYoutubeThreads((prevSelected) => {
        const newSelected = [];

        if (checked) {
          const filteredData = tableData.filter(row => {
            const totalMinutes = ParseDurationToMinutes(row.duration);
            return totalMinutes <= 20; // Keep only rows <= 20 minutes
          });

          filteredData.forEach((row) => {
            newSelected.push({
              threadId: row._id,
              captions: 'all',
              comments: 'top',
            });
          });
        }

        return newSelected;
      });
    } else if (platform === PLATFORMS.REDDIT) {
      setSelectedRedditThreads((prevSelected) => {
        const newSelected = [];

        if (checked) {
          tableData.forEach((row) => {
            newSelected.push({
              threadId: row._id,
              mode: row.mode,
            });
          });
        }

        return newSelected;
      });
    }
  };

  const handleResetFilters = useCallback(() => {
    // console.log('handleResetFilters');
    setFilters(defaultFilters);

    dispatch(SetThreadState({ field: 'platformForContent', value: PLATFORMS.REDDIT }));

    dispatch(SetCampaignState({
      field: 'createdCampaignId',
      value: null
    }));

    dispatch(SetCampaignState({
      field: 'createCampaignPlatformDetails',
      value: {}
    }));

    if (mode === CAMPAIGN_MODE.SUB_REDDIT) {
      setNeedToReset(true);
    } else if (mode === CAMPAIGN_MODE.KEYWORD) {
      setKeywordNeedToReset(true);
    }
  }, [table]);

  useEffect(() => {
    if (createdCampaignId && createCampaignPlatformDetails.platforms) {
      const { title, mode: modeValue, platforms } = createCampaignPlatformDetails;
      const { reddit, youtube, twitter } = platforms;

      if (reddit) {
        setPlatform(PLATFORMS.REDDIT);
        setMode(modeValue);
      } else if (youtube) {
        setPlatform(PLATFORMS.YOUTUBE);
        setMode(CAMPAIGN_MODE.KEYWORD);
      } else if (twitter) {
        setPlatform(PLATFORMS.TWITTER);
        setMode(CAMPAIGN_MODE.KEYWORD);
      }
    }
  }, [createCampaignPlatformDetails, createdCampaignId]);

  // ---------------------------------------- Current Project Name ----------------

  const projects = JSON.parse(localStorage.getItem('projects'));

  const currentTour = projects?.find((tour) => tour._id === id);
  
  useEffect(() => () => {
    console.log('Component un-mount!');
    console.log('resetCreatedCampaign: ', resetCreatedCampaign);
    if (resetCreatedCampaign) {
      dispatch(SetCampaignState({ field: 'createdCampaignId', value: null }));
      dispatch(SetCampaignState({ field: 'createCampaignPlatformDetails', value: {} }));
      dispatch(SetCampaignState({ field: 'resetCreatedCampaign', value: false }));
      dispatch(SetCampaignState({ field: "threadsSynced", value: false }));
    }
    dispatch(SetCampaignState({ field: 'resetCreatedCampaign', value: true }));
  }, []);

  const getHeight = () => tableHeight;

  const GetSelectedRowViaPlatform = (idValue) => {
    if (platform === PLATFORMS.YOUTUBE) {
      return selectedYoutubeThreads.some((thread) => thread.threadId === idValue);
    }
    if (platform === PLATFORMS.REDDIT) {
      return selectedRedditThreads.some((thread) => thread.threadId === idValue);
    }

    return false;
  };

  const handleSaveOptions = ({
    redditThreadsIds,
    youtubeThreadsIds
  }) => {
    dispatch(UpdateProject({
      projectId: id,
      action: saveThreads ? "saveThreads" : "addThreads",
      updateParams: {
        selectedThreadsList: {
          redditThreadsIds,
          youtubeThreadsIds
        }
      }
    }));
  };

  const handleSaveTheSelectedOption = () => {
    dispatch(UpdateProject({
      projectId: id,
      action: "addThreads",
      updateParams: {
        selectedThreadsList: {
          redditThreadsIds: selectedRedditThreads,
          youtubeThreadsIds: selectedYoutubeThreads
        }
      }
    }));
    dispatch(SetCampaignState({ field: 'threadsSynced', value: false }));
  };

  // Calculating the row count
  const getSelectedCount = () => {
    if (platform === PLATFORMS.YOUTUBE) {
      return selectedYoutubeThreads.length; // Directly return the count
    }

    if (platform === PLATFORMS.REDDIT) {
      // Extract IDs matching the mode for Reddit
      const redditValueCurrentMode = tableData
        .filter(row => row.mode === mode) // Filter rows matching the mode
        .map(row => row._id); // Extract IDs

      // Count IDs that are present in both lists
      const count = selectedRedditThreads.filter(thread =>
        redditValueCurrentMode.includes(thread.threadId)
      ).length;

      return count;
    }

    return 0;
  };

  useEffect(() => {
    if (platform === PLATFORMS.REDDIT) {
      const rowCountValue = tableData.length;
      setRowCount(rowCountValue || 0);
    }
    if (platform === PLATFORMS.YOUTUBE) {
      const rowCountVal = tableData.filter(row => {
        const totalMinutes = ParseDurationToMinutes(row.duration);
        return totalMinutes <= 20;
      });
      setRowCount(rowCountVal.length || 0);
    }
  }, [tableData]);

  // to toggle the reddit toggle button
  useEffect(() => {
    if (platform === PLATFORMS.REDDIT) {
      if (redditDataCount.subReddit !== 0) {
        setMode(CAMPAIGN_MODE.SUB_REDDIT);
      } else if (redditDataCount.keywords !== 0) {
        setMode(CAMPAIGN_MODE.KEYWORD);
      }
    }
  }, [redditDataCount, platform]);

  useEffect(() => {
    dispatch(SetThreadState({ field: "threadsCount",  value: 1}));
    // fetch reddit data count /// to switch the initial toggle if no data
    if (!isEmpty(id) && id !== def_id) dispatch(GetRedditDataCount({ projectId: id }));
    if (id === def_id) enqueueSnackbar('Please select the Project!', { variant: 'warning' });
  }, []);

  useEffect(() => {
    console.log('threadsSynced: ', threadsSynced, 'currentProject', currentProject)
    if (!isEmpty(currentProject) && !threadsSynced) {
      const { selectedThreadsList } = currentProject;
      const { redditThreadsIds = [], youtubeThreadsIds = [] } = selectedThreadsList;

      console.log('selectedThreadsList: ', {
        redditThreadsIds, youtubeThreadsIds
      });

      if (redditThreadsIds.length || youtubeThreadsIds.length) {
        setSaveThreads(true);

        const redditSaved = redditThreadsIds.filter(row => row.mode === CAMPAIGN_MODE.SUB_REDDIT);

        if (redditThreadsIds.length) {
          if (redditSaved.length) setMode(CAMPAIGN_MODE.SUB_REDDIT);
          else setMode(CAMPAIGN_MODE.KEYWORD);
          setPlatform(PLATFORMS.REDDIT)
        } else if (youtubeThreadsIds.length) {
          setMode(CAMPAIGN_MODE.KEYWORD);
          setPlatform(PLATFORMS.YOUTUBE)
        }
      }
    } 
    // else {
    //   console.log('here coming');
    //   dispatch(SetCampaignState({ field: "threadsSynced", value: false }));
    // }
  }, [currentProject, threadsSynced]);

  useEffect(() => {
    if (projectNotify && projectNotifyMessage) {
      enqueueSnackbar(SplitText(projectNotifyMessage), { variant: projectNotifyType });
    }
  }, [projectNotifyMessage, projectNotify, projectNotifyType]);

  useEffect(() => {
    console.log('threadNotify && threadNotifyMessage: ', threadNotify , threadNotifyMessage);
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
      })
      dispatch(SetThreadState({ field: "summaryFailed", value: false}))
    }
  }, [summaryFailed]);

  useEffect(() => {
    if (projectUpdated) {
      dispatch(SetProjectState({ field: 'projectUpdated', value: false }));

      setSelectedRedditThreads([]);
      setSelectedYoutubeThreads([]);
    }
  }, [projectUpdated]);

  useEffect(() => {
    if (id !== def_id) {
      dispatch(GetProject({
        projectId: id
      }));
    }
  }, [projectUpdated]);

  useEffect(() => {
    dispatch(SetThreadState({ field: "selectedRedditThreadsList", value: [] }));
    dispatch(SetThreadState({ field: "selectedYoutubeThreadsList", value: [] }));
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (container && container.scrollHeight <= container.clientHeight && !isLoading && tableData.length > 0) {
      loadMoreData();
    }
  }, [tableData]);

  const mobile = useMediaQuery("(max-width:599px)");
  const tableHeight = mobile ? 'calc(100vh - 170px)' : 'calc(100vh - 520px)';

  const handleDownload = () => {
    const selectedRows = [...selectedRedditThreads, ...selectedYoutubeThreads].map(row => row.threadId);
    if (selectedRows.length) {
      dispatch(DownloadThreads({ threadsList: selectedRows }));
    }
  };

  const handleSummarized = () => {
    const selectedRows = [...selectedRedditThreads, ...selectedYoutubeThreads].map(row => row.threadId);
    if (selectedRows.length) {
      console.log('here the selected threads', { selectedRows });

      setSummarizeFindModal(true);

      dispatch(SummarizeThreads({
        threadsList: selectedRows
      }))
    }
  };

  const getSortIcon = (tableObj, columnConfig) => {
    if (tableObj.orderBy === columnConfig.id) {
      return tableObj.order === 'asc'
        ? <ArrowUpwardIcon sx={{ fontSize: 20, marginTop: 0.4 }} />
        : <ArrowDownwardIcon sx={{ fontSize: 20, marginTop: 0.4 }} />;
    }
    return <SwapVertIcon sx={{ fontSize: 20, marginTop: 0.4 }} />;
  };

  const columns = GetColumnForThreadsMobileView(platform);
  const columnKeys = platform === PLATFORMS.YOUTUBE
    ? ['likes', 'views', 'comments']
    : ['likes', 'comments'];


  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : ''}>
        {id === def_id ? null : <Stepper activeStepNumber={2} handleStepClick={handleStepClick} />}
        <CustomBreadcrumbs
          heading="Threads List"
          links={[
            { name: currentTour?.title, href: paths.dashboard.root },
            {
              name: 'Threads',
              href: paths.dashboard.tour.threads(id),
            },
            { name: 'List' },
          ]}
          action={
            <Button
              onClick={() => {
                router.push(paths.dashboard.tour.job.root(id));
                localStorage.setItem('projectID', id);
              }}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Campaigns
            </Button>
          }
          sx={{ mb: { xs: 1, md: 2 } }}
        />

        <Card>
          {!saveThreads ?
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
                  borderBottomRightRadius: 0
                }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
                    <CustomSwitch setShowAllThreads={setSaveThreads} showAllThreads={saveThreads} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography color="primary" fontWeight="bold" >
                        {(selectedRedditThreads?.length || 0) + (selectedYoutubeThreads?.length || 0)} selected
                      </Typography>
                    </Box>
                    {selectedRedditThreads.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: '6px' }}>
                        <RedditIcon sx={{ color: '#FF4500', fontSize: 24 }} />
                        <Typography color="primary" variant="caption">({selectedRedditThreads.length})</Typography>
                      </Box>
                    )}

                    {selectedYoutubeThreads.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: '6px' }}>
                        <YoutubeIcon color="error" sx={{ color: '#FF0000', fontSize: 24, marginTop: "3px" }} />
                        <Typography color="primary" variant="caption">({selectedYoutubeThreads.length})</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                      cursor: 'pointer',
                      // width: { xs: '80vw', sm: 'auto' },
                      gap: '8px',
                    }}
                    disabled={exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length)}
                  >
                    <Image src={exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length) ? "/assets/file-grey.svg" : "/assets/file.svg"} width={20} height={20} />
                    <Typography variant="body2" sx={{ color: exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length) ? 'grey' : 'black' }}>
                      Summarize Finding
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      localStorage.setItem('projectID', id);
                      setMakeSelection(true);
                    }}
                    sx={{
                      order: { xs: 3, sm: 2 },
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      gap: '8px',
                      marginRight: mobile ? 0 : '16px',
                    }}
                    disabled={(!selectedRedditThreads.length && !selectedYoutubeThreads.length)}
                  >
                    <Image src={(!selectedRedditThreads.length && !selectedYoutubeThreads.length) ? "/assets/Plus-grey-icon.svg" : "/assets/Plus-icon.svg"} width={20} height={20} />
                    <Typography variant="body2" sx={{ color: (!selectedRedditThreads.length && !selectedYoutubeThreads.length) ? 'grey' : 'black' }}>
                      Generate Content
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      localStorage.setItem('projectID', id);
                      handleSaveTheSelectedOption();
                    }}
                    sx={{
                      order: { xs: 1, sm: 1 },
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      gap: '8px',
                      marginRight: mobile ? 0 : '16px',
                      width: mobile ? 40 : 'fit-content',
                      minWidth: mobile ? 40 : 'fit-content'
                    }}
                    disabled={!selectedRedditThreads.length && !selectedYoutubeThreads.length}
                  >
                    <Image src={!selectedRedditThreads.length && !selectedYoutubeThreads.length ? "/assets/save-grey-icon.svg" : "/assets/save-icon.svg"} width={20} height={20} />
                    <Typography variant="body2" sx={{ color: !selectedRedditThreads.length && !selectedYoutubeThreads.length ? 'grey' : 'black' }}>
                      Save Threads
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
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      // width: { xs: '80vw', sm: 'auto' },
                      gap: '8px',
                    }}
                    disabled={exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length)}
                  >
                    <Image src={(!selectedRedditThreads.length && !selectedYoutubeThreads.length) ? "/assets/export-grey-icon.svg" : "/assets/export-icon.svg"} width={20} height={20} />
                    <Typography variant="body2" sx={{ color: (!selectedRedditThreads.length && !selectedYoutubeThreads.length) ? 'grey' : 'black' }}>
                      {exportThreadsLoading ? "Exporting..." : "Export"}
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      confirm.onTrue();
                    }}
                    disabled={!selectedRedditThreads.length && !selectedYoutubeThreads.length}
                    sx={{
                      order: { xs: 2, sm: 3 },
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: 'red',
                      },
                      gap: '8px',
                      width: mobile ? 40 : 'fit-content',
                      minWidth: mobile ? 40 : 'fit-content'
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                    <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'inline-block' }, color: !selectedRedditThreads.length && !selectedYoutubeThreads.length ? 'grey' : 'black' }}>
                      Delete
                    </Typography>
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  backgroundColor: '#c8fad6',
                  display: {
                    xs: 'flex',
                    sm: 'none'
                  },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gridRowGap: '8px',
                  padding: 2,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0
                }}>
                <Box width='100%' sx={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                  <Box width='100%' display="flex" flexWrap="wrap" alignItems="center" gap='0px'>
                    <CustomSwitch setShowAllThreads={setSaveThreads} showAllThreads={saveThreads} />
                    <Box width='100%' sx={{
                      display: {
                        xs: 'flex',
                        sm: 'none'
                      }
                    }} maxWidth='100%' borderRadius='5px' p='4px' bgcolor='#63AA58' display='grid' gridTemplateColumns='1fr 1fr'>
                      <Typography textAlign='center' width='100%' padding='5px 13px' fontSize='12px' fontWeight='600' color={isAllThreads === 'all threads' ? "#63AA58" : '#C1DDBC'} bgcolor={isAllThreads === 'all threads' ? '#fff' : null} borderRadius='5px'>All Threads</Typography>
                      <Typography onClick={() => {
                        setSaveThreads(!saveThreads)
                      }} width='100%' textAlign='center' padding='5px 13px' fontSize='12px' fontWeight='600' color={isAllThreads === 'save threads' ? "#63AA58" : '#C1DDBC'} bgcolor={isAllThreads === 'save threads' ? '#fff' : null} borderRadius='5px'>Save Threads</Typography>
                    </Box>
                    {/* <Divider sx={{ borderColor: '#939AA766', marginBlock: '6px' }} /> */}
                    <Box orientation='vertical' sx={{
                      backgroundColor: '#939AA766', display: {
                        xs: 'flex',
                        sm: 'none'
                      }, width: "100%", height: '1px', marginBlock: '6px'
                    }} />
                    <Box sx={{
                      display: 'flex'
                    }} width='100%' gap="16px" alignItems='center' justifyContent="space-between">
                      <Stack direction='row' spacing={2}>
                        <Typography fontSize={10} fontWeight={500} noWrap color='#63AA58'>Total Selected:</Typography>
                        <Typography fontSize={10} fontWeight={500} color='#898989'> {(selectedRedditThreads?.length || 0) + (selectedYoutubeThreads?.length || 0)}</Typography>
                      </Stack>
                      <Box orientation='vertical' sx={{ backgroundColor: '#939AA766', width: "1px", height: '12px', marginBlock: '6px' }} />
                      <Stack direction='row' spacing={2}>
                        <Typography fontSize={10} fontWeight={500} color='#FF0000'>YouTube:</Typography>
                        <Typography fontSize={10} fontWeight={500} color='#898989'>{selectedYoutubeThreads.length}</Typography>
                      </Stack>
                      <Box orientation='vertical' sx={{ backgroundColor: '#939AA766', width: "1px", height: '12px', marginBlock: '6px' }} />
                      <Stack direction='row' spacing={2}>
                        <Typography fontSize={10} fontWeight={500} color='#FF5722'>Reddit:</Typography>
                        <Typography fontSize={10} fontWeight={500} color='#898989'>{selectedRedditThreads.length}</Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      localStorage.setItem('projectID', id);
                      setMakeSelection(true);
                    }}
                    sx={{
                      backgroundColor: 'transparent',
                      borderColor: '#63AA58',
                      flexDirection: 'column',
                      gap: '2px',
                      height: '42px',
                      paddingInline: '4px',
                      '&:hover': { backgroundColor: 'transparent' },
                      gridGap: '3px',
                    }}
                    disabled={(!selectedRedditThreads.length && !selectedYoutubeThreads.length)}
                  >
                    <Image src={(!selectedRedditThreads.length && !selectedYoutubeThreads.length) && !saveThreadsSelection ? "/assets/Plus-grey-icon.svg" : "/assets/Plus-icon.svg"} width={12} height={12} />
                    <Typography variant="body2" sx={{
                      color: (!selectedRedditThreads.length && !selectedYoutubeThreads.length) && !saveThreadsSelection ? 'grey' : '#63AA58', fontWeight: '500', fontSize: {
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
                    disabled={exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length)}
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
                      minWidth: '44px',
                      maxWidth: '64px'
                    }}
                  >
                    <Image src={exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length) ? "/assets/export-grey-icon.svg" : "/assets/export-icon.svg"} width={12} height={12} />
                    <Typography variant="body2" sx={{
                      color: exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length) ? 'grey' : '#63AA58', fontWeight: '500', fontSize: {
                        xs: 10,
                        sm: 14
                      }
                    }}>
                      Export
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      localStorage.setItem('projectID', id);
                      handleSaveTheSelectedOption();
                    }}
                    sx={{
                      backgroundColsor: 'transparent',
                      borderColor: exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length) ? '#919eab3d !important' : '#63AA58 !important',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      flexDirection: 'column',
                      width: { sm: 'auto' },
                      gap: '2px',
                      height: '42px',
                      minWidth: '44px',
                      maxWidth: '64px'
                    }}
                    disabled={!selectedRedditThreads.length && !selectedYoutubeThreads.length}
                  >
                    <Image src={!selectedRedditThreads.length && !selectedYoutubeThreads.length ? "/assets/save-grey-icon.svg" : "/assets/save-icon.svg"} width={12} height={12} />
                    <Typography variant="body2" sx={{
                      color: !selectedRedditThreads.length && !selectedYoutubeThreads.length ? 'grey' : '#63AA58', fontWeight: '500', fontSize: {
                        xs: 10,
                        sm: 14
                      }
                    }}>
                      Save
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
                    disabled={exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length)}
                  >
                    <Image src={exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length) ? "/assets/file-grey.svg" : "/assets/file.svg"} width={12} height={12} />
                    <Typography variant="body2" sx={{
                      color: exportThreadsLoading || !(selectedRedditThreads.length || selectedYoutubeThreads.length) ? 'grey' : '#63AA58', fontWeight: '500', fontSize: {
                        xs: 10,
                        sm: 14
                      }
                    }}>
                      Summarize
                    </Typography>
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      confirm.onTrue();
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
                      paddingInline: '4px',
                    }}
                    disabled={!selectedRedditThreads.length && !selectedYoutubeThreads.length}
                  >
                     <Iconify sx={{ width: '16px !important' }} icon="solar:trash-bin-trash-bold" />
                    <Typography variant="body2" sx={{
                      color: !selectedRedditThreads.length && !selectedYoutubeThreads.length ? 'grey' : '#63AA58', fontWeight: '500', fontSize: {
                        xs: 10,
                        sm: 14
                      }
                    }}>
                      Delete
                    </Typography>
                  </Button>
{/* 
                  <Image sx={{ PointerEvent: !selectedRedditThreads.length && !selectedYoutubeThreads.length ? 'none' : 'all' }}
                    onClick={() => {
                      confirm.onTrue();
                    }}
                    src={!selectedRedditThreads.length && !selectedYoutubeThreads.length ? "/assets/remove-grey-icon.svg" : "/assets/remove-icon.svg"}
                    width={28} height={28}
                  /> */}
                </Box>
              </Box>
            </>
            : null}
          {
            saveThreads ? <SaveThreads handleSaveOptions={handleSaveOptions} setSaveThreads={setSaveThreads} projectId={id} setSaveThreadsSelection={setSaveThreadsSelection} /> :
              <>
                <Box display="flex">
                  <ProductTableToolbar
                    filters={filters}
                    onFilters={handleFilters}
                    stockOptions={PRODUCT_STOCK_OPTIONS}
                    projectId={id}
                    mode={mode}
                    needToReset={needToReset}
                    setMode={setMode}
                    setNeedToReset={setNeedToReset}
                    keywordNeedToReset={keywordNeedToReset}
                    setKeywordNeedToReset={setKeywordNeedToReset}
                    relatedSubReddit={relatedSubReddit}
                    setRelatedSubReddit={setRelatedSubReddit}
                    relatedSubRedditFilter={relatedSubRedditFilter}
                    setRelatedSubRedditFilter={setRelatedSubRedditFilter}
                    platform={platform}
                    clearTableData={() => { setTableData([]) }}
                    setPlatform={setPlatform}
                    saveThreads={saveThreads}
                  />
                </Box>

                <ProductTableFiltersResult
                  canReset={canReset}
                  results={totalCount}
                  totalCountLoading={isLoading}
                  filters={filters}
                  onFilters={handleFilters}
                  onResetFilters={handleResetFilters}
                  sx={{ p: 2.5, pt: 0, pb: 0 }}
                />
               {!mobile ? <TableContainer
                  ref={scrollRef}
                  sx={{
                    position: 'relative',
                    overflow: 'auto',
                    height: getHeight(),
                    display: {
                      xs: 'none',
                      sm: 'block'
                    }
                  }}
                  onScroll={handleScroll}
                >
                  <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                    <TableHeadCustom
                      order={table.order}
                      orderBy={table.orderBy}
                      headLabel={platform === PLATFORMS.REDDIT ? TABLE_HEAD : TABLE_HEAD_YOUTUBE}
                      rowCount={rowCount}
                      numSelected={getSelectedCount()}
                      onSort={(field) => {
                        const isAsc = table.orderBy === field && table.order === 'asc';
                        const isDesc = table.orderBy === field && table.order === 'desc';

                        if (isDesc) {
                          table.onSort(null, null);
                        } else {
                          table.onSort(field, isAsc ? 'desc' : 'asc');
                        }
                      }}

                      onSelectAllRows={(checked) => {
                        if (platform === PLATFORMS.YOUTUBE) {
                          const filteredData = tableData.filter(row => {
                            const totalMinutes = ParseDurationToMinutes(row.duration);
                            return totalMinutes <= 20;
                          });

                          const newSelected = checked
                            ? filteredData.map((row) => row._id)
                            : [];

                          if (checked) {
                            handleSelectAllRows(checked, newSelected);
                          }
                          if (!checked) {
                            handleSelectAllRows(checked, []);
                          }
                        }
                        if (platform === PLATFORMS.REDDIT) {
                          const newSelected = checked
                            ? tableData.map((row) => row._id)
                            : [];

                          handleSelectAllRows(checked, newSelected);
                        }
                      }
                      }
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        backgroundColor: (theme) => theme.palette.background.paper,
                      }}
                      platform={platform}
                    />

                    {getProjectLoading || updatingProjectDetails ? <LoadingScreen /> : null}

                    <TableBody>
                      <>
                        {
                          tableData.length > 0 ? (
                            tableData.map((row) => (
                              <ProductTableRow
                                key={row._id}
                                row={row}
                                platform={platform}
                                selected={GetSelectedRowViaPlatform(row._id)}
                                onSelectRow={() => handleSelectRow(row)}
                                onDeleteRow={() => handleDeleteRow(row._id)}
                                projectid={id}
                                onPreprompt={(v) => preprompt(v)}
                              />
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} align="center">
                                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                  {saveThreads ? "No saved data" : "No data found"}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        }
                        <TableEmptyRows
                          value="No data"
                          height={denseHeight}
                          emptyRows={emptyRows(table.page, table.rowsPerPage, tableData?.length)}
                        />
                      </>
                    </TableBody>
                  </Table>
                </TableContainer> :
                <Box sx={{
                  display: {
                    xs: 'block',
                    sm: 'none'
                  }
                }} border='1px solid #EAEDEE' overflow='hidden' borderTopLeftRadius="4px" borderTopRightRadius="4px">
                  <Box display='grid' p='14px 12px' bgcolor='#F4F6F8' gridTemplateColumns='1fr 1fr 1fr 1fr'>
                    <Stack direction='row' spacing={2}>
                      <Checkbox
                        checked={!!rowCount && getSelectedCount() === rowCount}
                        onClick={(e) => {
                          const checked = e.target.checked;

                          console.log('here the row checked ', checked);
                          if (platform === PLATFORMS.YOUTUBE) {
                            const filteredData = tableData.filter(row => {
                              const totalMinutes = ParseDurationToMinutes(row.duration);
                              return totalMinutes <= 20;
                            });

                            const newSelected = checked
                              ? filteredData.map((row) => row._id)
                              : [];

                            if (checked) {
                              handleSelectAllRows(checked, newSelected);
                            }
                            if (!checked) {
                              handleSelectAllRows(checked, []);
                            }
                          }
                          if (platform === PLATFORMS.REDDIT) {
                            const newSelected = checked
                              ? tableData.map((row) => row._id)
                              : [];

                            handleSelectAllRows(checked, newSelected);
                          }
                        }}
                      />
                    </Stack>
                    {columnKeys.map((column) => {
                      const columnConfig = columns[column];
                      return (
                        <div key={column} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Image src={columnConfig.icon} width={20} height={20} alt={column} />
                          <button
                            type="button"
                            onClick={() => {
                              const isAsc = table.orderBy === columnConfig.id && table.order === 'asc';
                              const isDesc = table.orderBy === columnConfig.id && table.order === 'desc';

                              if (isDesc) {
                                table.onSort(null, null);
                              } else {
                                table.onSort(columnConfig.id, isAsc ? 'desc' : 'asc');
                              }
                            }}
                            style={{
                              cursor: 'pointer',
                              marginLeft: '4px',
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            aria-label={`Sort by ${columnConfig.label}`}
                          >
                            {getSortIcon(table, columnConfig)}
                          </button>
                        </div>
                      );
                    })}
                  </Box>
                  <Box onScroll={handleScroll} ref={scrollRef} sx={{
                    height: '400px',
                    overflow: 'auto',
                  }}>
                    {
                      platform === PLATFORMS.YOUTUBE && (
                        tableData.length ? tableData.map(row => (
                          <VideoCard
                            _id={row._id}
                            selected={GetSelectedRowViaPlatform(row._id)}
                            platform={row.platform}
                            onCheckChange={() => handleSelectRow(row)}
                            thumbnailUrl={row.imageurl}
                            title={row.title}
                            sourceURL={row.url}
                            likes={row?.youtubeVideoDetails?.likeCount}
                            views={row?.youtubeVideoDetails?.viewCount}
                            youtubeIcon="/assets/youtube-min-icon.svg"
                            comments={row?.youtubeVideoDetails?.comments}
                            keyword={row.category}
                            duration={row.duration}
                            onCommentClick={() => alert('Comment clicked')}
                            onDeleteClick={() => handleDeleteRow(row._id)}
                            projectId={row.projectid}
                          />
                        )
                        )
                          : <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                              No data found
                            </div>
                      )
                    }
                    {
                      platform === PLATFORMS.REDDIT && (
                        tableData.length ?
                          tableData.map(row => (
                            <VideoCard
                              isChecked={GetSelectedRowViaPlatform(row._id)}
                              onCheckChange={() => handleSelectRow(row)}
                              title={row.title}
                              platform={row.platform}
                              sourceURL={`https://reddit.com${row.url}`}
                              imageURL={row.imageurl}
                              likes={row.upvotes}
                              comments={row.comments}
                              keyword={row.category}
                              onCommentClick={() => alert('Comment clicked')}
                              onDeleteClick={() => handleDeleteRow(row._id)}
                            />
                          )
                          )
                          : <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                              No data found
                            </div>
                      )
                    }
                  </Box>
                </Box>}
              </>
          }
        </Card>
      </Container>

      {makeSelection
        ?
        <ProductCaptionsAndCommentsView
          projectId={id}
          setSelectedRedditThreads={setSelectedRedditThreads}
          setSelectedYoutubeThreads={setSelectedYoutubeThreads}
          selectedRedditThreads={selectedRedditThreads}
          selectedYoutubeThreads={selectedYoutubeThreads}
          handleSaveOptions={handleSaveOptions}
          open={makeSelection}
          onClose={() => setMakeSelection(false)}
          saveThreads={saveThreads}
        />
        : null
      }

      {
        summarizeFindModal ?
          <SummaryModal
            open={summarizeFindModal}
            onClose={() => {
              setSummarizeFindModal(false);
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {(selectedRedditThreads?.length || 0) + (selectedYoutubeThreads?.length || 0)} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

ProductListView.propTypes = {
  id: PropTypes.string,
};
