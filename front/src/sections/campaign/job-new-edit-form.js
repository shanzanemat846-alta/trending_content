"use client";

import PropTypes from "prop-types";
import * as Yup from "yup";
import * as React from "react";
import { useCallback, useMemo, useEffect, useState, useContext } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { extend, debounce, isEmpty, upperCase, lowerCase, camelCase } from "lodash";
import axios from "axios";
import dayjs from "dayjs";
// @mui
import { IconButton } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Unstable_Grid2";
import Button from "@mui/material/Button";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CircleIcon from "@mui/icons-material/Circle";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Icon } from "@iconify/react";
// hooks
import { useResponsive } from "src/hooks/use-responsive";
// routes
import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";
import { AuthContext } from 'src/auth/context/jwt/auth-context';
import { useSettingsContext } from 'src/components/settings';
// _mock
// assets
// components
import { useSnackbar } from "src/components/snackbar";
import { LoadingScreen } from "src/components/loading-screen";
import FormProvider from "src/components/hook-form";
import { CustomTooltip } from 'src/components/custom-tooltip';
import { useAppDispatch, useAppSelector } from "src/app/lib/hooks";
import CustomDateRangePicker from "src/components/date-range/date-range-picker";

import {
  SaveCampaignAndSyncThreads,
  SetCampaignState,
  ResetCampaignNotify,
  GetSubRedditSearch
} from "src/app/lib/slices/campaign-slice";
import { GetUserSubscriptionPlanDetail } from 'src/app/lib/slices/subscription-slice';

import {
  CAMPAIGN_MODE,
  MAX_LENGTH,
  MAX_THREADS,
  PLATFORMS,
  REDDIT_ENDPOINTS,
} from "src/utils/constants";

import { checkCreditAvailable } from "src/utils/helpers";

import { host } from "../../utils/APIRoutes";

import "./index.css";
import { StepperStyleWrapper } from "./style";
import { MetricsView } from "./metrics";

const steps = [
  { id: 0, label: "Choose the mode" },
  { id: 1, label: "New campaign" },
  { id: 2, label: "Campaign Search Criteria" },
  { id: 3, label: "Date Range" },
];

const cardsData = [
  {
    logo: "/assets/redit.svg",
    title: "Reddit",
    alt: "Reddit",
    platform: PLATFORMS.REDDIT,
  },
  {
    logo: "/assets/youtube.svg",
    title: "YouTube",
    alt: "YouTube",
    platform: PLATFORMS.YOUTUBE,
  },
  {
    logo: "/assets/twitter-disable.svg",
    title: "Twitter",
    alt: "Twitter",
    platform: PLATFORMS.TWITTER,
  },
];

const buttonsOptions = [
  { label: "Custom", value: "custom" },
  { label: "< 100", value: "0-100" },
  { label: "> 100", value: "100+" },
  { label: "> 1K", value: "1000+" },
  { label: "> 10K", value: "10000+" },
];

const viewOptions = [
  { label: "Custom", value: "custom" },
  { label: "< 1K", value: "0-1000" },
  { label: "> 1K", value: "1000+" },
  { label: "> 10K", value: "10000+" },
  { label: "> 100K", value: "100000+" },
];

const threadOptions = [
  { label: "Custom", value: "custom" },
  { label: "100", value: "100" },
  { label: "200", value: "200" },
  { label: "300", value: "300" },
  { label: "400", value: "400" },
];

const QuestionMarkIcon = () => (
  <Box
    component="div"
    sx={{
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      border: "1px solid #6B7280",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      color: "#6B7280",
      cursor: "pointer",
      ml: 0.5,
      "&:hover": {
        backgroundColor: "rgba(107, 114, 128, 0.04)",
      },
    }}
  >
    ?
  </Box>
);

export default function JobNewEditForm({ currentJob }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { user: { _id: userId } } = useContext(AuthContext);


  const setting = useSettingsContext();

  const mdUp = useResponsive("up", "md");

  const {
    notifyType: campaignSliceNotifyType,
    notifyMessage: campaignSliceNotifyMessage,
    threadsSynced,
    saveThreadsForMultiPlatformsLoading,
  } = useAppSelector((state) => state.campaign);
  const {
    userSubscriptionPlanDetails,
    getUserSubscriptionPlanLoading,
  } = useAppSelector((state) => state.subscription);

  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, "days"),
    dayjs(),
  ]);
  const [allDateRange, setAllDateRange] = useState(null);
  const [subreddits, setSubreddits] = useState([]);
  const [matchType, setMatchType] = useState("broad");
  const [placeholder, setPlaceholder] = useState("Sub-reddit");
  const [title, setTitle] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isCurrentTab, setIsCurrentTab] = useState(0);
  const [isHovered, setIsHovered] = useState(0);
  const [currentSubRedditRow, setCurrentSubRedditRow] = useState(null);
  const [youtubeFilters, setYoutubeFilters] = useState({
    views: { min: 100, max: 500, mode: "morethan" },
    likes: { min: 10, max: 50, mode: "morethan" },
    comments: { min: 5, max: 10, mode: "morethan" }
  });
  const [redditFilters, setRedditFilters] = useState({
    threads: { min: 100, max: 200, mode: "morethan" },
    comments: { min: 2, max: 5, mode: "morethan" },
    upVotes: { min: 2, max: 5, mode: "morethan" }
  });
  const [customErrorMessage, setCustomErrorMessage] = useState({
    redditThreads: "",
    redditUpVotes: "",
    redditComments: "",
    youtubeViews: "",
    youtubeLikes: "",
    youtubeComments: "",
  });
  const [disableCreateCampaign, setDisableCreateCampaign] = useState({
    subReddit: false,
    keyWords: false,
  });
  const [platforms, setPlatforms] = useState({
    reddit: true,
    youtube: false,
    twitter: false,
  });
  const [subredditRows, setSubredditRows] = useState([{
    id: Date.now(),
    selectedValue: null,
    showContent: false,
    loading: false,
    description: null,
    subscribers: 0,
    activeUser: 0,
    options: [],
  }]);
  const [switchPlatform, setSwitchPlatform] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [keywordTitle, setKeywordTitle] = useState("");
  const [dateError, setDateError] = useState(false)

  const handlePlatformSelection = ({ name, checked }) => {
    setPlatforms((prevPlatforms) => ({
      ...prevPlatforms,
      [name]: checked,
    }));

    setCurrentSubRedditRow(null);
    setSwitchPlatform(true);
    setSubreddits([]);
  };

  const handleSubRedditChange = (index, value) => {
    let isDuplicate = false;
    if (!isEmpty(value)) {
      isDuplicate = subredditRows.some(
        (row, idx) => row.selectedValue === value && idx !== index,
      );
    }

    if (isDuplicate) {
      enqueueSnackbar("Subreddit already selected.", { variant: "warning" });
      return;
    }

    setCurrentSubRedditRow(null);
    setSubredditRows((prevRows) =>
      prevRows.map((row, idx) =>
        idx === index
          ? {
            ...row,
            selectedValue: value,
            showContent: !!value,
            loading: false,
            open: false,
          }
          : row,
      ),
    );
  };

  const handleAddRow = () => {
    setSubredditRows((prevRows) => [
      ...prevRows,
      {
        id: Date.now(),
        selectedValue: null,
        showContent: false,
        loading: false,
        open: false,
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    setSubredditRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleAutocompleteChange = useCallback(
    debounce(async (index, event, value) => {
      setSubredditRows((prevRows) =>
        prevRows.map((row, idx) =>
          idx === index ? { ...row, loading: true, open: true } : row,
        ),
      );
      setCurrentSubRedditRow(index);

      if (!value) {
        setSubreddits([]);
        setSubredditRows((prevRows) =>
          prevRows.map((row, idx) =>
            idx === index ? { ...row, loading: false, open: false } : row,
          ),
        );
        return;
      }

      const resultAction = await dispatch(GetSubRedditSearch({ query: value }));
      const sreddits = resultAction.payload.data.redditSearchResults; // Get results from the action
      const community = resultAction.payload.data.community; // Get results from the action
      setSubredditRows((prevRows) =>
        prevRows.map((row, idx) =>
          idx === index
            ? {
              ...row,
              loading: false,
              open: true,
              ...(community && {
                description: community.publicDescription,
                subscribers: community.subscribers,
                activeUser: community.activeUserCount,
              }),
            }
            : row,
        ),
      );

      if (sreddits.length) {
        setSubreddits(sreddits);
      }
    }, 500),
    [],
  );

  const NewJobSchema = Yup.object().shape({
    title: Yup.string(),
    mode: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentJob?.title || "",
      mode: currentJob?.mode || "Sub-reddit",
    }),
    [currentJob],
  );

  const methods = useForm({
    resolver: yupResolver(NewJobSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentJob) {
      reset(defaultValues);
    }
  }, [currentJob, defaultValues, reset]);

  const projectID = localStorage.getItem("projectID");

  // ------------------------------------------------ Save ------------------------------------------

  const onSubmit = handleSubmit(async (data) => {
    try {
      let queryTitle =
        placeholder === CAMPAIGN_MODE.SUB_REDDIT ? subredditRows
          .filter((row) => !isEmpty(row.selectedValue))
          .map((row) => row.selectedValue)
          .filter(Boolean)
          .join(",") : keywordTitle;

      if (queryTitle === null) queryTitle = data.title;

      const platformsList = {};

      if (!currentJob) {
        if (platforms.reddit) {
          extend(platformsList, {
            reddit: redditFilters,
          });
        }
        if (platforms.youtube) {
          extend(platformsList, {
            youtube: youtubeFilters,
          });
        }
        if (platforms.twitter) {
          extend(platformsList, {
            twitter: {
              reTweets: 100,
              comments: 1,
              likes: 1,
            },
          });
        }
      } else {
        const { platforms: prevPlatforms } = currentJob;

        if (prevPlatforms.reddit) {
          extend(platformsList, {
            reddit: redditFilters,
          });
        }
        if (prevPlatforms.youtube) {
          extend(platformsList, {
            youtube: youtubeFilters,
          });
        }
        if (prevPlatforms.twitter) {
          extend(platformsList, {
            twitter: {
              reTweets: 100,
              comments: 1,
              likes: 1,
            },
          });
        }
      }

      const campaign = {
        title: queryTitle,
        projectid: projectID,
        dateRange,
        mode: placeholder,
        platforms: platformsList,
        allDateRange
      };

      setTitle(campaign.title);

      console.log('\n\n campaign: ', campaign);
      if (currentJob) {
        const updateCampaign = {
          projectid: currentJob.projectid,
          title: currentJob.title,
          mode: currentJob.mode,
          dateRange: allDateRange || dateRange,
          platforms: platformsList,
          allDateRange
        };

        await axios.patch(
          `${host}/api/campaign/${currentJob._id}`,
          updateCampaign,
        );
        enqueueSnackbar("Campaign Update success!");
        router.push(paths.dashboard.tour.job.root(projectID));
      } else {
        if (
          platforms.youtube ||
          platforms.twitter ||
          (platforms.reddit && placeholder === CAMPAIGN_MODE.KEYWORD)
        ) {
          campaign.matchType = matchType;
        }

        dispatch(
          SaveCampaignAndSyncThreads({
            campaignDetails: campaign,
            reSyncThreads: false,
          }),
        );
      }
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    console.log('customErrorMessage: ', customErrorMessage);
  }, [customErrorMessage]);

  const handleMetricChange = ({
    min, max, key, mode, platform
  }) => {
    console.log('here the values: ', [`${platform + key}`], {
        min, max, key, mode, platform
    });

    if (min === "" || max === "") {
      setCustomErrorMessage({
        ...customErrorMessage,
        [`${platform + key}`]: "Value is required!"
      }); 
    } else if (mode === 'range' && max <= min) {
      console.log('here the error: ')
      setCustomErrorMessage({
        ...customErrorMessage,
        [`${platform + key}`]: "Max value should be greater than min value!"
      });
    } else if (max > min) {
       setCustomErrorMessage({
        ...customErrorMessage,
        [`${platform + key}`]: ""
      });
    }
    if (platform === PLATFORMS.REDDIT) {
      setRedditFilters({
         ...redditFilters,
        [camelCase(key)]: { min, max, mode }
      })
    }
    if (platform === PLATFORMS.YOUTUBE) {
        setYoutubeFilters({
         ...youtubeFilters,
        [camelCase(key)]: { min, max, mode }
      })
    }
  };

  const fetchSubreddits = useCallback(async (query) => {

    // dispatch(GetSubredditSearch({query  }));
    try {
      const url = `${REDDIT_ENDPOINTS.REDDIT_SEARCH}?query=${query}`;

      const response = await fetch(url);
      const data = await response.json();
      const names = data.names.map((child) => child);

      console.log('names ======> ', names);
      return names;
    } catch (error) {
      console.error("Error fetching subReddit:", error);
      return [];
    }
  }, []);

  // useEffect(() => {
  //   fetchSubreddits('cricket');
  // }, []);

  useEffect(() => {
    if (!platforms.reddit && !platforms.youtube && !platforms.twitter) {
      setPlaceholder("");
      setDisableCreateCampaign({
        subReddit: true,
        keyWords: true,
      });
    }
    if (platforms.youtube || platforms.twitter) {
      setDisableCreateCampaign({
        keyWords: false,
        subReddit: true,
      });
      setIsCurrentTab(0);
      setPlaceholder("Keyword");
    }
    if (platforms.reddit && !platforms.youtube && !platforms.twitter) {
      setDisableCreateCampaign({
        keyWords: false,
        subReddit: false,
      });
      setPlaceholder("Keyword");
      setIsCurrentTab(0);
    }
  }, [platforms]);

  
  useEffect(() => {
    if (campaignSliceNotifyType && campaignSliceNotifyMessage) {
      const messages = campaignSliceNotifyMessage
        .split('&')
        .map(msg => msg.trim())
        .filter(Boolean);

      messages.forEach(msg => {
        enqueueSnackbar(msg, {
          variant: campaignSliceNotifyType,
        });
      });

      dispatch(ResetCampaignNotify());
    }
  }, [
    enqueueSnackbar,
    dispatch,
    campaignSliceNotifyType,
    campaignSliceNotifyMessage,
  ]);

  useEffect(() => {
    if (!saveThreadsForMultiPlatformsLoading && threadsSynced) {
      reset();
      dispatch(SetCampaignState({ field: 'resetCreatedCampaign', value: false }));

      const createCampaignPlatformDetails = {
        platforms,
        title,
        mode: placeholder,
      };

      dispatch(GetUserSubscriptionPlanDetail({ userId }));

      dispatch(
        SetCampaignState({
          field: "createCampaignPlatformDetails",
          value: createCampaignPlatformDetails,
        }),
      );
      router.push(paths.dashboard.tour.threads(projectID));
    }
  }, [enqueueSnackbar, threadsSynced, saveThreadsForMultiPlatformsLoading]);

  useEffect(() => {
    if (currentJob) {
      const {
        platforms: { reddit, youtube },
        dateRange: prevDateRange,
      } = currentJob;

      const currentJobPlatforms = {};

      setCurrentStep(2);
      if (reddit) {
        setRedditFilters({ ...reddit });
        extend(currentJobPlatforms, { reddit: true });
      } else extend(currentJobPlatforms, { reddit: false });
      if (youtube) {
        setYoutubeFilters({ ...youtube });
        extend(currentJobPlatforms, { youtube: true });
      } else extend(currentJobPlatforms, { youtube: false });

      if (prevDateRange.length === 1 && prevDateRange[0] === 'allDateRange') {
        setAllDateRange('allDateRange')
      } else if (prevDateRange.length) {
        setDateRange([dayjs(prevDateRange[0]), dayjs(prevDateRange[1])]);
      }

      setPlatforms({
        ...platforms,
        ...currentJobPlatforms
      });
    }
  }, [currentJob]);

  const proceedNext = () => {
     if (placeholder === CAMPAIGN_MODE.SUB_REDDIT) {
      const value = !subredditRows.some((row) => row.selectedValue);
      return value;
    }
    if (placeholder === CAMPAIGN_MODE.KEYWORD) {
      return isEmpty(keywordTitle);
    }

    return false;
  }

  useEffect(() => {
    if (userId) {
      dispatch(GetUserSubscriptionPlanDetail({ userId }));
    }
  }, [userId]);

  const getTabClass = () => {
    if (disableCreateCampaign.subReddit) return "tabs-one disabled-card";
    if (isCurrentTab === 1) return "tabs-one active";
    return "tabs-one";
  };

  const getClassName = (item) => {
    if (platforms[item.platform]) return "cards-item-wrapper active";
    if (item.platform === PLATFORMS.TWITTER) return "cards-item-wrapper disabled-btn";
    return "cards-item-wrapper";
  };

  const hasEmptyCustomFields = (filters) => {
  // Check YouTube filters
    const youtubeCustomFields = ['views', 'likes', 'comments'];
    const hasEmptyYoutubeFields = youtubeCustomFields.some(field =>
      filters.youtubeFilters[field] === 'custom' &&
      !filters.youtubeFilters[`custom${field.charAt(0).toUpperCase() + field.slice(1)}`].trim()
    );

    // Check Reddit filters
    const redditCustomFields = ['threads', 'upVotes', 'comments'];
    const hasEmptyRedditFields = redditCustomFields.some(field =>
      filters.redditFilters[field] === 'custom' &&
      !filters.redditFilters[`custom${field.charAt(0).toUpperCase() + field.slice(1)}`].trim()
    );

    return hasEmptyYoutubeFields || hasEmptyRedditFields;
  };

  const { isCreditUnavailable, errorMessage: creditsErrorMessage } = useMemo(() => checkCreditAvailable({
    platforms,
    credits: userSubscriptionPlanDetails?.credits
  }), [
    platforms,
    userSubscriptionPlanDetails?.credits
  ]);
    const isMobile = useMediaQuery("(max-width:850px)");


  const FirstStep = <StepperStyleWrapper isMobile={isMobile}>
    <div className="first-step--content-box">
      <header>
        {currentStep > 0 ?
          <Box className="circle-box" sx={{ backgroundColor: "#02a77087" }}>
            <Icon
              icon="material-symbols:check-rounded"
              color="blue"
              style={{
                width: 16,
                height: 16,
                color: currentStep > 0 ? "#02A770" : null,
              }}
            />
          </Box>
          : <img src="/assets/spring-icon.svg" alt="spring Icon" />
        }
        <div className="title-wrapper">
          <Box display="flex" alignItems="center" gap={1}>
            <p>Select platforms
            </p>
            <CustomTooltip
              description="Select at least one platform to proceed. You can choose multiple platforms if needed."
            />
          </Box>
          <p>
            Choose the platforms where you&apos;d like to run your campaign: Reddit, YouTube, or Twitter.
          </p>
        </div>
      </header>
      {currentStep > 0 ? null : <>
        <div className="bag-wrapper">
          {cardsData.map((item, index) => (
            <button
              type="button"
              key={index}
              className={getClassName(item)}
              onClick={() => {
                if (item.platform !== PLATFORMS.TWITTER) {
                  handlePlatformSelection({
                    name: item.platform,
                    checked: !platforms[item.platform],
                  })
                }
              }}
            >
              <div className="title">
                <img src={item.logo} alt={item.alt} />
                <p>{item.title}</p>
              </div>
              <img
                src={
                  platforms[item.platform] && item.platform !== PLATFORMS.TWITTER
                    ? "/assets/checked-icon.svg"
                    : "/assets/empty-checkbox.svg"
                }
                alt="checkbox"
              />
            </button>
          ))}
        </div>
        <footer>
          {currentStep <= 0 ? null :
            <Button
              sx={{
                background: "#02A770",
                "&:hover": {
                  backgroundColor: "#02A770",
                },
              }}
              disabled={currentStep <= 0}
              onClick={() => setCurrentStep(currentStep - 1)}
              variant="contained"
            >
              Back
            </Button>
          }
          <Button
            sx={{
              background: "#02A770",
              "&:hover": {
                backgroundColor: "#02A770",
              },
            }}
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={Object.values(platforms).every((value) => !value)}
            variant="contained"
          >
            Save & Next
          </Button>
        </footer>
      </>
      }
    </div>
  </StepperStyleWrapper>

  const SecondStep = <StepperStyleWrapper>
    <div className="first-step--content-box next-step">
      <header>
        {currentStep > 1 ?
          <Box className="circle-box" sx={{ backgroundColor: "#02a77087" }}>
            <Icon
              icon="material-symbols:check-rounded"
              color="blue"
              style={{
                width: 16,
                height: 16,
                color: currentStep > 0 ? "#02A770" : null,
              }}
            />
          </Box>
          : <img src="/assets/chose-mode.svg" alt="spring Icon" />
        }
        <div className="title-wrapper">
          <Box display="flex" alignItems="center" gap={1}>
            <p>Please choose the mode</p>
            <CustomTooltip
              description="Select how you want to target your campaign: by Subreddit or Keyword."
              internalText="If choosing multiple options, you must select Keyword, as Subreddit will be disabled."
            />
          </Box>
          <p>
            Select how you want to target your campaign: by Subreddit or
            Keyword.
          </p>
        </div>
      </header>
      {currentStep > 1 ? null :
        <div className="tabs-wrapper">
          <button
            type="button"
            onClick={() => {
              if (!disableCreateCampaign.keyWords) {
                setIsCurrentTab(0);
                setPlaceholder(CAMPAIGN_MODE.KEYWORD);
              }
            }}
            className={`tabs-one
            ${disableCreateCampaign.keyWords && "disabled-card"}
            ${isCurrentTab === 0 && !disableCreateCampaign.keyWords && "active"}`}
          >
            <img src="/assets/search-black.svg" alt="search Icon" />
            <p>Keyword</p>
          </button>
          <Tooltip title={disableCreateCampaign.subReddit ? 'Available only when you choose Reddit Platform ONLY!' : ''}>
            <button
              type="button"
              onClick={() => {
                if (!disableCreateCampaign.subReddit) {
                  setIsCurrentTab(1);
                  setPlaceholder(CAMPAIGN_MODE.SUB_REDDIT);
                }
              }}
              className={getTabClass()}
            >
              <img src={disableCreateCampaign.subReddit ? "/assets/chat-icon-disabled.svg" : "/assets/chat-icon.svg"} alt="chat Icon" />
              <p>Sub-reddit</p>
            </button>
          </Tooltip>
        </div>
      }
      {currentStep > 1 ? null :
        <>
          <div className="tab-content">
            {isCurrentTab === 1 ? (
              <div className="sub-reddit-buttons-wrapper">
                <h3>Sub-reddit Data</h3>
                {subredditRows.map((row, index) => (
                  <div className="sub-reddit-buttons-items">
                    <div className="sub-reddit-wrapper">
                      <Stack direction="column" spacing={1.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" color="#000000">
                            Sub-reddit name
                          </Typography>
                          <CustomTooltip
                            description="Click on the search input to start searching on Reddit. A dropdown will appear with results."
                            internalText="You can add up to 5 different searches."
                          />
                        </Box>
                        <Autocomplete
                          fullWidth
                          options={
                            currentSubRedditRow === index ? subreddits : []
                          }
                          getOptionLabel={(option) => option}
                          value={row.selectedValue}
                          onChange={(event, value) => {
                            handleSubRedditChange(index, value);
                          }}
                          open={currentSubRedditRow === index && row.open}
                          onOpen={() => {
                            setSubredditRows((prevRows) =>
                              prevRows.map((r, idx) => ({
                                ...r,
                                open: idx === index,
                              })),
                            );
                          }}
                          onClose={() => {
                            setSubredditRows((prevRows) =>
                              prevRows.map((r) => ({ ...r, open: false })),
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={placeholder}
                              margin="none"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {row.loading && (
                                      <CircularProgress
                                        color="inherit"
                                        size={20}
                                      />
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                              onClick={() => {
                                setSwitchPlatform(false);
                              }}
                              sx={{
                                '& .MuiInputBase-input': {
                                  outline: 'none',
                                  color: '#000000',
                                },
                              }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <li {...props} key={option}>
                              {option}
                            </li>
                          )}
                          onInputChange={(event, value) => {
                            if (!switchPlatform) {
                              handleAutocompleteChange(index, event, value);
                            }
                          }}
                          sx={{
                            width: {
                              sm: 300,   // width for small screens and up
                              xs: 200  // width for extra-small screens and up
                            }
                          }}
                        />
                      </Stack>
                      <IconButton
                        className="remove-icon"
                        onClick={() => handleRemoveRow(row.id)}
                      >
                        <RemoveCircleOutlineIcon sx={{ color: "red" }} />
                      </IconButton>
                    </div>

                    {row.showContent && (
                      <Box
                        sx={{
                          maxWidth: isMobile ? "100%" : 400,
                          width: "100%",
                          height: "100%",
                          padding: 2,
                          border: "1px solid #ccc",
                          borderRadius: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          backgroundColor: "#f9f9f9",
                          marginTop: 0,
                          marginLeft: "auto",
                        }}
                      >
                        <Tooltip title="description" arrow>
                          <Typography
                            variant="body2"
                            sx={{
                              marginBottom: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2,
                            }}
                          >
                            {row?.description}
                          </Typography>
                        </Tooltip>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 0.1,
                          }}
                        >
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold" }}
                            >
                              {row?.subscribers || 0}
                            </Typography>
                            <Typography variant="body2">Members</Typography>
                          </Box>

                          <Box
                            sx={{
                              textAlign: "center",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold", marginRight: 0.5 }}
                            >
                              {row?.activeUser}
                            </Typography>
                            <Box sx={{ display: "flex" }}>
                              <CircleIcon
                                sx={{
                                  color: "#00db00",
                                  fontSize: 8,
                                  marginRight: 0.5,
                                  marginTop: 1,
                                }}
                              />
                              <Typography variant="body2">
                                Online
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </div>
                ))}
                <Tooltip
                  title={
                    subredditRows.length >= 5
                      ? "You can only add up to 5 subreddits"
                      : ""
                  }
                >
                  <Button
                    sx={{ color: "#02A770" }}
                    startIcon={<AddCircleIcon style={{ color: "#02A770" }} />}
                    onClick={handleAddRow}
                    disabled={subredditRows.length >= 5}
                    variant="text"
                  >
                    Add New Sub-reddit
                  </Button>
                </Tooltip>
              </div>
            ) : (
              <div className="key-words-search-based">
                <h3>Select Match Type</h3>
                <div className="checkbox-wrapper">
                  <button
                    type="button"
                    onClick={() => setMatchType("broad")}
                    className="checkbox-items"
                    style={{
                      all: 'unset',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <img
                      src={
                        matchType === "broad"
                          ? "/assets/checked-icon.svg"
                          : "/assets/empty-checkbox.svg"
                      }
                      alt="checkbox"
                    />
                    <p>Broad - Reach similar search terms</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchType("phrase")}
                    className="checkbox-items"
                    style={{
                      all: 'unset',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <img
                      src={
                        matchType === "phrase"
                          ? "/assets/checked-icon.svg"
                          : "/assets/empty-checkbox.svg"
                      }
                      alt="checkbox"
                    />
                    <p>Phrase - Match Phrase with variations</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchType("exact")}
                    className="checkbox-items"
                    style={{
                      all: 'unset',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <img
                      src={
                        matchType === "exact"
                          ? "/assets/checked-icon.svg"
                          : "/assets/empty-checkbox.svg"
                      }
                      alt="checkbox"
                    />
                    <p>Exact - Target precise terms</p>
                  </button>
                </div>
                <Stack direction="column" marginTop="24px" spacing={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      fontSize={18}
                      fontWeight={600}
                      color="#000000"
                    >
                      Keyword name
                    </Typography>
                    <CustomTooltip
                      description="You must search by keywords to proceed. Search results will appear based on the entered keyword"
                    />
                  </Box>
                  <TextField
                    hiddenLabel
                    placeholder="Please write the keyword"
                    onChange={(e) => setKeywordTitle(e.target.value)}
                    value={keywordTitle}
                    autoFocus
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#02A770!important",
                      },
                      '& .MuiInputBase-input': {
                        outline: 'none',
                        color: '#000000',
                      },
                      width: '80%'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                  />
                </Stack>
              </div>
            )}
          </div>
          <footer>
            <Button
              sx={{
                background: "#02A770",
                "&:hover": {
                  backgroundColor: "#02A770",
                },
              }}
              disabled={currentStep <= 0}
              onClick={() => setCurrentStep(currentStep - 1)}
              variant="contained"
            >
              Back
            </Button>
            <Button
              sx={{
                background: "#02A770",
                "&:hover": {
                  backgroundColor: "#02A770",
                },
              }}
              disabled={
                !currentJob
                  ? proceedNext()
                  : false
              }
              onClick={() => setCurrentStep(currentStep + 1)}
              variant="contained"
            >
              Save & Next
            </Button>
          </footer>
        </>
      }
    </div>
  </StepperStyleWrapper>

  const getTheClassName = (item) => {
    if (platforms.reddit && platforms.youtube) {
      return 'both-card';
    }
    return 'single-card';
  }

  const ThirdStep = <StepperStyleWrapper>
    <div className="first-step--content-box next-step">
      <header>
        {currentStep > 2 ?
          <Box className="circle-box" sx={{ backgroundColor: "#02a77087" }}>
            <Icon
              icon="material-symbols:check-rounded"
              color="blue"
              style={{
                min: 16,
                height: 16,
                color: currentStep > 0 ? "#02A770" : null,
              }}
            />
          </Box>
          :
          <Box
            className="circle-box"
            sx={{
              backgroundColor: "#03a9f454",
            }}
          >
            <Icon
              icon="material-symbols:circle"
              color="blue"
              style={{ min: 7.5, height: 7.5, color: "#03A9F4" }}
            />
          </Box>
        }
        <div className="title-wrapper">
          <p>Campaign Search Criteria</p>
          <p>
            Set specific filters to refine your campaign&apos;s target audience
            based on threads, likes, and comments.
          </p>
        </div>
      </header>
      {currentStep > 2 ? null :
        <>
         <MetricsView  platforms={platforms} handleMetricChange={handleMetricChange} redditFilters={redditFilters} youtubeFilters={youtubeFilters}/>
          <footer>
            {!currentJob && (
              <Button
                sx={{
                  background: "#02A770",
                  "&:hover": {
                    backgroundColor: "#02A770",
                  },
                }}
                disabled={currentStep <= 0}
                onClick={() => setCurrentStep(currentStep - 1)}
                variant="contained"
              >
                Back
              </Button>
            )}
            <Button
              sx={{
                background: "#02A770",
                "&:hover": {
                  backgroundColor: "#02A770",
                },
              }}
              onClick={() => setCurrentStep(currentStep + 1)}
              variant="contained"
              disabled={
                // currentJob
                //   ?
                  Object.values(customErrorMessage).some(
                    (message) => message.trim() !== "",
                  ) ||
                   hasEmptyCustomFields({ youtubeFilters, redditFilters })
                  // : false
              }
            >
              Save & Next
            </Button>
          </footer>
        </>
      }
    </div>
  </StepperStyleWrapper>

  const FourthStep = <StepperStyleWrapper>
    <div className="first-step--content-box next-step">
      <header>
        {currentStep > 3 ?
          <Box className="circle-box" sx={{ backgroundColor: "#02a77087" }}>
            <Icon
              icon="material-symbols:check-rounded"
              color="blue"
              style={{
                width: 16,
                height: 16,
                color: currentStep > 0 ? "#02A770" : null,
              }}
            />
          </Box>
          : <Box
            className="circle-box"
            sx={{
              backgroundColor: "#03a9f454",
            }}
          >
            <Icon
              icon="material-symbols:circle"
              color="blue"
              style={{ width: 7.5, height: 7.5, color: "#03A9F4" }}
            />
          </Box>
        }
        <div className="title-wrapper">
          <Box display="flex" alignItems="center" gap={1}>
            <p>Date Range</p>
            <CustomTooltip
              description="Selecting a date range will fetch only the search results that fall within the selected dates."
            />
          </Box>
          <p>Select your date range</p>
        </div>
      </header>
      <Stack
        marginBlock={2}
        maxWidth="400px"
        width="100%"
      >
        {/* <CustomDateRangePicker dateRange={dateRange} setDateRange={setDateRange} setDateError={setDateError} /> */}
        <CustomDateRangePicker
          dateRange={dateRange}
          setDateRange={setDateRange}
          setDateError={setDateError}
          createCampaignPage
          setAllDateRange={setAllDateRange}
          allDateRange={allDateRange}
        />
      </Stack>
      <footer>
        <Button
          sx={{
            background: "#02A770",
            "&:hover": {
              backgroundColor: "#02A770",
            },
          }}
          disabled={currentStep <= 0}
          onClick={() => setCurrentStep(currentStep - 1)}
          variant="contained"
        >
          Back
        </Button>
        <Tooltip title={!isEmpty(creditsErrorMessage) ? creditsErrorMessage : ""}>
          <span style={{ display: "inline-block" }}>
            <LoadingButton
              sx={{
                background: "#02A770",
                "&:hover": {
                  backgroundColor: "#02A770",
                },
              }}
              type="submit"
              loading={isSubmitting}
              disabled={
                dateError ||
                (!currentJob
                  ?
                  // Object.values(customErrorMessage).some(
                  //   (message) => message.trim() !== "",
                  // ) || 
                  isCreditUnavailable
                  : false
                )
              }
              variant="contained"
            >
              {!currentJob ? "Create Campaign" : "Save Changes"}
            </LoadingButton>
          </span>
        </Tooltip>
      </footer>
    </div>
  </StepperStyleWrapper>

  const renderDetails = (
    <>
      <StepperStyleWrapper currentStep={currentStep} isHovered={isHovered}>
        <div className="content-body-wrapper">
          {currentStep >= 0 && !currentJob && FirstStep}
          {currentStep >= 1 && !currentJob && SecondStep}
          {currentStep >= 2 && ThirdStep}
          {currentStep >= 3 && FourthStep}
        </div>
        <Box
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="stepper-box-wrapper"
        >
          {steps.map((step) =>
            <Stack
              key={step.id}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2.5 }}
            >
              <Box
                className="circle-box"
                sx={{
                  backgroundColor:
                    (currentStep === step.id && "#03a9f454") ||
                    (currentStep > step.id && "#02a77087") ||
                    "rgba(221, 221, 221, 0.37)",
                }}
              >
                <Icon
                  icon={
                    (currentStep === step.id && "material-symbols:circle") || "material-symbols:check-rounded"
                  }
                  color="blue"
                  style={{
                    width: currentStep === step.id ? 7.5 : 16,
                    height: currentStep === step.id ? 7.5 : 16,
                    color: (currentStep === step.id && "#03A9F4") || (currentStep > step.id && "#02A770") || "#BDBDBD"
                  }}
                />
              </Box>
              {isHovered ? <span className="label-text">{step.label}</span>
                : null}
            </Stack>
          )}
        </Box>
      </StepperStyleWrapper>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {saveThreadsForMultiPlatformsLoading || isSubmitting ? (
          <LoadingScreen
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 9999,
            }}
          />
        ) : null}
        {renderDetails}
      </Grid>
    </FormProvider>
  );
}

JobNewEditForm.propTypes = {
  currentJob: PropTypes.object,
};
