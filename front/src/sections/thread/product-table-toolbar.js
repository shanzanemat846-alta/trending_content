import PropTypes from 'prop-types';
import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { compact } from 'lodash';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Typography, Box, FormLabel } from '@mui/material';
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from 'axios';
// utils
import { PLATFORMS, CAMPAIGN_MODE } from 'src/utils/constants';
import { host } from 'src/utils/APIRoutes';
import { def_id } from 'src/config-global';
// components
import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import { useAppSelector } from 'src/app/lib/hooks';

import { SplitText } from 'src/utils/helpers';

// ----------------------------------------------------------------------

export default function ProductTableToolbar({
  filters,
  onFilters,
  stockOptions,
  projectId,
  setMode,
  mode,
  needToReset,
  setNeedToReset,
  keywordNeedToReset,
  setKeywordNeedToReset,
  relatedSubReddit,
  setRelatedSubReddit,
  relatedSubRedditFilter,
  setRelatedSubRedditFilter,
  platform,
  setPlatform,
  clearTableData,
  saveThreads
}) {
  const popover = usePopover();

  const {
    createdCampaignId,
    createCampaignPlatformDetails
  } = useAppSelector((state) => state.campaign);

  const publishOptions = [
    { value: 'tarot', label: 'tarot' },
    { value: 'nextjs', label: 'nextjs' },
  ];

  const { enqueueSnackbar } = useSnackbar();

  const [subRedditDropdown, setSubRedditDropdown] = useState([]);
  const [keywordsDropdown, setKeywordsDropdown] = useState([]);

  const [subRedditLoading, setSubRedditLoading] = useState(false);
  const [keywordsLoading, setKeywordsLoading] = useState(false);

  const [isKeywordFilterVisible, setIsKeywordFilterVisible] = useState(false);
  const [selectedSubRedditList, setSelectedSubRedditList] = useState([]);
  const [selectedSearchMode, setSelectedSearchMode] = useState('');

  const handleChange = (event) => {
    setSelectedSearchMode(event.target.value);
  };

  const [currentMode, setCurrentMode] = useState('Sub-reddit');

  const isFirstRender = useRef(true);
  const subRedditRender = useRef(true);

  const showAllOption = { value: 'showAll', label: 'Show All' };

  // fetch campaigns
  const getCampaignList = useCallback(async ({ projectId: projId, mode: campaignMode, platform: campaignPlatform, saveThreads: saveThreadsMode }) => {
    try {
      const filtersValue = {
         mode: campaignMode,
         platform: campaignPlatform,
         saveThreads: saveThreadsMode
      };
      const response = await axios.get(
        `${host}/api/campaign/campaigns/${String(projId)}?filters=${JSON.stringify(filtersValue)}`
      );
      const { data } = response.data;
      return data;
    } catch (error) {
      const { error: errorMessage = 'Error Occur!' } = error?.response?.data || {};
      enqueueSnackbar(SplitText(errorMessage), { variant: 'error' });
      throw error;
    }
  }, [enqueueSnackbar]);


  // call fetch data base on mode and platform
  const fetchDropDownData = async () => {
    const { campaignsList } = await getCampaignList({
      projectId,
      platform,
      mode,
      saveThreads
    });

    const campaignsListData = campaignsList?.map(row => ({
      value: row._id,
      label: row.title,
    }));

    const allOptions = campaignsList?.length > 1 ? [showAllOption, ...campaignsListData] : campaignsListData;

    if (mode === CAMPAIGN_MODE.SUB_REDDIT) {
      setSubRedditDropdown(allOptions || []);

      setSelectedSubRedditList([]);

      const redditValues = allOptions.map(row => row.value);

      if (createdCampaignId &&  createCampaignPlatformDetails.mode === mode) {
        // console.log('onFilters 1')
        onFilters('subReddit', [createdCampaignId]);
      }
      else {
        // console.log('onFilters 2')
        onFilters('subReddit', redditValues);
      }
    }
    if (mode === CAMPAIGN_MODE.KEYWORD) {
      const keyWordsValues = allOptions.map(row => row.value);

      setKeywordsDropdown(allOptions || []);

      if (createdCampaignId && createCampaignPlatformDetails.mode === mode) {
        const { platforms: { reddit, youtube, twitter } } = createCampaignPlatformDetails;

        if (platform === PLATFORMS.REDDIT && reddit) {
        //  console.log('onFilters 3')
         onFilters('keywords', [createdCampaignId]);
        } else if (platform === PLATFORMS.REDDIT && !reddit) {
          // console.log('onFilters 4')
          onFilters('keywords',  keyWordsValues);
        }

        if (platform === PLATFORMS.YOUTUBE && youtube) {
          // console.log('onFilters 5')
          onFilters('keywords', [createdCampaignId]);
        } else if (platform === PLATFORMS.YOUTUBE && !youtube) {
          // console.log('onFilters 6')
          onFilters('keywords',  keyWordsValues);
        }
      }
      else {
        // console.log('onFilters 7')
        onFilters('keywords',  keyWordsValues);
      }
    }
  };

  useEffect(() => {
    if (projectId && projectId !== def_id) {
      fetchDropDownData();
    }
  }, [projectId, getCampaignList, platform, mode, createdCampaignId, saveThreads]);


  const handleClearFilters = () => {
    setRelatedSubRedditFilter([]);
    setSelectedSubRedditList([]);
  };

  const handleSearch = useCallback(
    (event) => {
      // console.log('onFilters 8')
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

 const handleSelectSubRedditFilter = useCallback(
  (event) => {

    const selectedValues = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

    const filteredSelectedValues = selectedValues.filter(value => value !== showAllOption.value);

    if (selectedValues.includes(showAllOption.value) && !filters.subReddit.includes(showAllOption.value)) {
      const allValues = subRedditDropdown.map(option => option.value).filter(value => value !== showAllOption.value);
        //  console.log('onFilters 9')
      onFilters('subReddit', [showAllOption.value, ...allValues]);
    }
    else if (!selectedValues.includes(showAllOption.value) && filters.subReddit.includes(showAllOption.value)) {
      // console.log('onFilters 10')
      onFilters('subReddit', []);
    }
    else if (filteredSelectedValues.length === subRedditDropdown.length - 1) {
      // console.log('onFilters 11')
      onFilters('subReddit', [showAllOption.value, ...filteredSelectedValues]);
    }
    else {
      // console.log('onFilters 12')
      onFilters('subReddit', filteredSelectedValues);
    }

  },
  [onFilters, subRedditDropdown, filters.subReddit]
);

const handleSelectKeywordFilter = useCallback(
  (event) => {
    const selectedValues = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

    const filteredSelectedValues = selectedValues.filter(value => value !== showAllOption.value);

    if (selectedValues.includes(showAllOption.value) && !filters.keywords.includes(showAllOption.value)) {
      const allValues = keywordsDropdown.map(option => option.value).filter(value => value !== showAllOption.value);
      // console.log('onFilters 13')
      onFilters('keywords', [showAllOption.value, ...allValues]);
    }
    else if (!selectedValues.includes(showAllOption.value) && filters.keywords.includes(showAllOption.value)) {
      // console.log('onFilters 14')
      onFilters('keywords', []);
      setRelatedSubReddit([]);
    }
    else if (filteredSelectedValues.length === keywordsDropdown.length - 1) {
      // console.log('onFilters 15')
      onFilters('keywords', [showAllOption.value, ...filteredSelectedValues]);
    }
    else {
      // console.log('onFilters 15.5', 'filteredSelectedValues', filteredSelectedValues)
      onFilters('keywords', filteredSelectedValues);
    }

    const deselectedKeywords = filters.keywords.filter(keyword => !selectedValues.includes(keyword));
    if (deselectedKeywords.length > 0) {
      setRelatedSubReddit([]);
      setSelectedSubRedditList([]);
      setRelatedSubRedditFilter([]);
    }
  },
  [onFilters, keywordsDropdown, filters.keywords]
);

const SetFiltersWithKeywordsList = () => {
  const allKeywordValues = keywordsDropdown.length > 0  ? keywordsDropdown.map(option => option.value) : []
  // .concat(showAllOption.value) : [];
  // console.log('onFilters 16', allKeywordValues)
  onFilters('keywords', allKeywordValues);
};

const SetFiltersWithRedditList = () => {
  const allSubRedditValues = subRedditDropdown.length > 0 ? subRedditDropdown.map(option => option.value).concat(showAllOption.value) : [];
  // console.log('onFilters 17')
  onFilters('subReddit', allSubRedditValues);
};

const toggleKeywordFilter = async (event) => {
  handleClearFilters();

  if (event.target.checked) {
    setMode(CAMPAIGN_MODE.KEYWORD);
    SetFiltersWithKeywordsList();

  } else if (!event.target.checked) {
    setMode(CAMPAIGN_MODE.SUB_REDDIT);
    // onFilters('keywords', []);
    SetFiltersWithRedditList()
  }

  setIsKeywordFilterVisible(event.target.checked);
};

useEffect(() => {
  if (keywordNeedToReset && !relatedSubRedditFilter?.length) {
    const modeValue = mode === CAMPAIGN_MODE.KEYWORD ? 'keywords' : 'subreddit';
    console.log('onFilters 19')

    onFilters(modeValue, []);
    setKeywordNeedToReset(false);
  }
}, [keywordNeedToReset, relatedSubRedditFilter]);

useEffect(() => {
  if (keywordNeedToReset) {
    handleClearFilters();
  }
}, [keywordNeedToReset]);

const handleRelatedSubRedditChange = (event) => {
  const selectedValues = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

  setSelectedSubRedditList(selectedValues);
  setRelatedSubRedditFilter(selectedValues);
  //  console.log('onFilters 20')
  onFilters('subReddit', selectedValues);
};

const handleChangePlateForm = (event, newValue) => {
  if(newValue === 'youtube'){
    setIsKeywordFilterVisible(true)

    // const allKeywordValues = keywordsDropdown.length > 0
    //   ? keywordsDropdown.map(option => option.value).concat(showAllOption.value) : [];

    //  console.log('onFilters 21')
    onFilters('keywords', []);
    setMode('Keyword');
    setPlatform(newValue);
    // onFilters('subReddit', []);
  } else {
    setPlatform(newValue);
    const allSubredditValues = subRedditDropdown.length > 0
      ? subRedditDropdown.map(option => option.value).concat(showAllOption.value) : [];

    fetchDropDownData();
    // console.log('onFilters 22')
    onFilters('subReddit', allSubredditValues);
    setMode('Sub-reddit');
    // console.log('onFilters 23')
    onFilters('keywords', []);
    setSubRedditDropdown(subRedditDropdown);
    setRelatedSubRedditFilter([]);
    setIsKeywordFilterVisible(false);
  }
  clearTableData();
};

useEffect(() => {
  if (mode === CAMPAIGN_MODE.KEYWORD) setIsKeywordFilterVisible(true);
}, [mode, isKeywordFilterVisible]);

  const lg = useMediaQuery("(max-width:1501px)");
  const md = useMediaQuery("(max-width:1282px)");
  const sm = useMediaQuery("(max-width:767px)");
  const xs = useMediaQuery("(max-width:507px)");
  const CustomXs = useMediaQuery("(max-width:599px)");

  const gridTemplateColumns = useMemo(() => {
    if (xs) return "repeat(auto-fill, minmax(200px, 1fr))";
    if (sm) return "repeat(auto-fill, minmax(250px, 1fr))";
    if (md) return "repeat(auto-fill, minmax(220px, 1fr))";
    return "1fr 1fr 1fr";
  }, [xs, sm, md]);

  const widthTextfield = useMemo(() => {
    if (xs) return "100%";
    if (sm) return "100%";
    if (md) return "200px";
    if (lg) return "200px";
    return "300px";
  }, [xs, sm, md, lg]);

  const textFieldStyles = {
    width: '100%',
    '& .MuiInputBase-root': {
      height: CustomXs ? '36px' : 'auto',
      borderRadius: '4px',
    },
    '& .MuiInputBase-input': {
      padding: CustomXs ? '8px 12px 8px 0px' : '16.5px 14px 16.5px 0px',
      fontSize: '14px',
      borderRadius: '4px',
    },
  };
  const selectStyles = {
    borderRadius: '4px',
    width: '100%',
    '& .MuiSelect-select': {
      width: '100%',
      padding: CustomXs ? '8px 32px 8px 16px' : '16px 32px 16px 16px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block'
    },
    '& .MuiOutlinedInput-root': {
      height: CustomXs ? '36px' : 'auto',
    },
    '& .MuiSelect-multiple': {
      padding: CustomXs ? '8px 32px 8px 16px' : '16px 32px 16px 16px',
      flexWrap: 'wrap',
      gap: '4px',
      display: 'block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  };

  return (
    <Box width='100%'>
        <Stack ml={3}>
          <Tabs value={platform} onChange={handleChangePlateForm} aria-label="basic tabs example">
            <Tab label="Reddit" value="reddit" />
            <Tab label="Youtube" value="youtube" />
          </Tabs>
        </Stack>
      <Box width='100%' paddingInline='10px' gap={2} display="flex" flexWrap={md ? "wrap" : ""} flexDirection="row" alignItems={lg ? "end" : "end"}>
        {
          platform === PLATFORMS.REDDIT ?
            <Stack maxWidth={366} direction={lg ? "column" : "row"} marginTop={1} alignItems={lg ? "flex-start" : "center"} spacing={1} flexWrap="nowrap" flexGrow={1} sx={{
              display: {
                sm: 'flex',
                xs: 'none',
              }, width: 1, marginLeft: { xs: 0, md: 0 }
            }}>
              <Typography noWrap component='strong'><strong>Search Mode:</strong></Typography>
              <Stack display="flex" border="1px solid #00A76F" flexDirection="row" alignItems="center" sx={{ padding: "2px 8px", borderRadius: '8px', height: '54px' }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: '500', fontSize: '14px' }}>
                  By Sub-reddit
                </Typography>
                <Switch
                  checked={isKeywordFilterVisible}
                  onChange={toggleKeywordFilter}
                  inputProps={{ 'aria-label': 'Toggle keyword filter visibility' }}
                />
                <Typography noWrap variant="body2" sx={{ fontWeight: '500', fontSize: '14px' }}>
                  By Keyword
                </Typography>
              </Stack>
            </Stack>
            : null
        }
        <Box sx={{ mt: CustomXs ? '16px' : '', display: {
          sx: 'block',
          sm:'none'
        }, width: '100%' }}>
          <FormControl sx={selectStyles}>
            <FormLabel sx={{ marginBottom: '4px' }}>Search Mode</FormLabel>
            <Select
              value={selectedSearchMode}
              onChange={handleChange}
              displayEmpty
              className={CustomXs ? 'CustomXs-custom-select' : ''}
            >
              <MenuItem value=""><em>Select</em></MenuItem>
              <MenuItem value="keywords">Keywords</MenuItem>
              <MenuItem value="sub_reddit">Sub-reddit</MenuItem>
            </Select>
          </FormControl>
        </Box>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'flex-end' }}
        flexDirection="row"
        display="grid"
        gridTemplateColumns={gridTemplateColumns}
        width={xs ? "100%" : "auto"}
        >
          {!isKeywordFilterVisible && platform === PLATFORMS.REDDIT && (
            // <FormControl sx={{ flexShrink: 0, width: widthTextfield }}>
            <FormControl sx={selectStyles}>
              <FormLabel sx={{ marginBottom: '4px' }}>Sub-reddit</FormLabel>
              <Select
                multiple
                value={filters.subReddit}
                displayEmpty={filters.subReddit.length === 0}
                onChange={handleSelectSubRedditFilter}
                inputProps={{ 'aria-label': 'Without label' }}
                className={CustomXs ? 'CustomXs-custom-select' : ''}
                renderValue={(selected) => {
                  let selectedLabels = selected?.map((value) => {
                    const option = subRedditDropdown?.find((item) => item.value === value);
                    return option ? option.label : '';
                  });
                  selectedLabels = compact(selectedLabels)
                  if (selectedLabels.length === 0) {
                    return <Typography fontSize={14} color="grey">Select Sub-reddits</Typography>;
                  }
                return selectedLabels.join(', ');
              }}
              sx={{ textTransform: 'capitalize', height: '36px', '& .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.css-rv517n-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input':{
              paddingBlock: '8px !important'
              }}}
              >
                {subRedditLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={24} />
                    &nbsp; Loading...
                  </MenuItem>
                ) : (
                  subRedditDropdown?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Checkbox
                        disableRipple
                        size="small"
                        checked={filters.subReddit?.includes(option.value)}
                      />
                      {option.label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}

          {isKeywordFilterVisible && platform === PLATFORMS.REDDIT && (
            <>
              {/* <FormControl sx={{ flexShrink: 0, width: widthTextfield  }}> */}
              <FormControl sx={selectStyles}>
                <FormLabel sx={{ marginBottom: '4px' }}>Keyword</FormLabel>
                <Select
                  multiple
                  value={filters.keywords}
                  displayEmpty={filters.keywords.length === 0}
                  onChange={handleSelectKeywordFilter}
                  inputProps={{ 'aria-label': 'Without label' }}
                  className={CustomXs ? 'CustomXs-custom-select' : ''}
                  renderValue={(selected) => {
                    let selectedLabels = selected?.map((value) => {
                      const option = keywordsDropdown.find((item) => item.value === value);
                      return option ? option.label : '';
                    });

                    selectedLabels = compact(selectedLabels);
                    if (selectedLabels.length === 0) {
                      return <Typography fontSize={14} color="grey">Select Keywords</Typography>;
                    }
                    return selectedLabels.join(', ');
                  }}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {keywordsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={24} />
                      &nbsp; Loading...
                    </MenuItem>
                  ) : (
                    keywordsDropdown.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Checkbox
                          disableRipple
                          size="small"
                          checked={filters.keywords.includes(option.value)} />
                        {option.label}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {/* <FormControl sx={{ flexShrink: 0, width:widthTextfield }}> */}
              <FormControl sx={selectStyles}>
                <FormLabel sx={{ marginBottom: '4px' }}>Sub-reddit</FormLabel>

                <Select
                  multiple
                  value={selectedSubRedditList}
                  displayEmpty={selectedSubRedditList.length === 0}
                  onChange={handleRelatedSubRedditChange}
                  className={CustomXs ? 'CustomXs-custom-select' : ''}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <Typography fontSize={14} color="grey">Select Sub-reddits</Typography>;
                    }
                    return selected.join(', ');
                  }}
                >
                  {subRedditLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={24} />
                      &nbsp; Loading...
                    </MenuItem>
                  ) : (
                    relatedSubReddit?.map((option, index) => (
                      <MenuItem key={index} value={option}>
                        <Checkbox
                          disableRipple
                          size="small"
                          checked={selectedSubRedditList?.includes(option)} />
                        {option}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </>
          )}
          {
            platform === PLATFORMS.YOUTUBE ?
              //  <FormControl sx={{ flexShrink: 0, width: widthTextfield }}>
              <FormControl sx={selectStyles}>
                <FormLabel sx={{ marginBottom: '4px' }}>Keyword</FormLabel>
                <Select
                  multiple
                  value={filters.keywords}
                  displayEmpty={filters.keywords.length === 0}
                  onChange={handleSelectKeywordFilter}
                  defaultValue="Name"
                  className={CustomXs ? 'CustomXs-custom-select' : ''}
                  inputProps={{ 'aria-label': 'Without label' }}
                  renderValue={(selected) => {
                    const selectedLabels = selected?.map((value) => {
                      const option = keywordsDropdown.find((item) => item.value === value);
                      return option ? option.label : '';
                    });
                    if (selected.length === 0) {
                      return <Typography fontSize={14} color="grey">Select Keyword</Typography>;
                    }
                    return selectedLabels.join(', ');
                  }}
                  aria-placeholder='Doenlaod'
                  placeholder='Doenlaod'
                  sx={{ textTransform: 'capitalize' }}
                >
                  {keywordsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={24} />
                      &nbsp; Loading...
                    </MenuItem>
                  ) : (
                    keywordsDropdown.map((option) => {
                      if (!option.label) return <MenuItem>NAme</MenuItem>;
                      return (
                        <MenuItem key={option.value} value={option.value}>
                          <Checkbox
                            disableRipple
                            size="small"
                            checked={filters.keywords.includes(option.value)} />
                          {option.label}
                        </MenuItem>
                      )
                    })
                  )}
                </Select>
              </FormControl>
              : null
          }
          <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
            <TextField
              // fullWidth
              sx={textFieldStyles}
              value={filters.name}
              onChange={handleSearch}
              placeholder="Search by title"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

ProductTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  projectId: PropTypes.string,
  stockOptions: PropTypes.object,
  mode: PropTypes.string,
  setMode: PropTypes.func,
  needToReset: PropTypes.bool,
  setNeedToReset: PropTypes.func,
  keywordNeedToReset: PropTypes.bool,
  setKeywordNeedToReset: PropTypes.func,
  relatedSubReddit: PropTypes.array,
  setRelatedSubReddit: PropTypes.func,
  relatedSubRedditFilter: PropTypes.array,
  setRelatedSubRedditFilter: PropTypes.func
};
