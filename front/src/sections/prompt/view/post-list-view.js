'use client';

import orderBy from 'lodash/orderBy';
import { useCallback, useState, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// _mock
import { POST_SORT_OPTIONS } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Stepper from 'src/components/stepper/stepper';
import { useHandleStepClick } from 'src/components/stepper/handle-step-click';
//
import { useAppSelector } from 'src/app/lib/hooks';

import { promptPullRoute } from 'src/utils/APIRoutes';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { SplashScreen } from 'src/components/loading-screen';
import PostSort from '../post-sort';
import PostSearch from '../post-search';
import PostListHorizontal from '../post-list-horizontal';

// ----------------------------------------------------------------------


export default function PostListView() {
  const settings = useSettingsContext();

  const [sortBy, setSortBy] = useState('latest');

  const [search, setSearch] = useState({
    query: '',
    results: [],
  });

   const [prompts, setPrompts] = useState();

   const [promptsf, setPromptsf] = useState();

   const [showSplash, setShowSplash] = useState(false);

   const { handleStepClick } = useHandleStepClick();

  //  const chatTitle = localStorage.getItem("chatTitle");
   const projectID = localStorage.getItem("projectID");

   const {
    selectedYoutubeThreadsList,
    redditPrePromptDetails
   } = useAppSelector((state) => state.thread);
  // token
  const { accessToken } = useAuthContext();

    useEffect(() => {
    const fetchPrompts = async () => {
      const headers = {
        Authorization: `Bearer ${accessToken}` // Include the token in the Authorization header
      };

      try {
        const response = await axios.get(promptPullRoute, { headers });
        setPrompts(response.data);
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };

    fetchPrompts();
  }, [accessToken]); 

  localStorage.setItem("prompts", JSON.stringify(prompts));

  const dataFiltered = applyFilter({
    inputData: promptsf || prompts,
    sortBy,
  });

  const notFound = !dataFiltered.length ;

  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);

  const handleSearch = useCallback(
    (inputValue) =>{
      setSearch((prevState) => ({
        ...prevState,
        query: inputValue,
      }));
      
      if (inputValue) {
        const results = prompts.filter(
          (job) => job.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
        );

        setSearch((prevState) => ({
          ...prevState,
          results,
        }));
      }
      else {
        setPromptsf("");
      }
    },
    [search.query, prompts]
  );

  return (
    <>   
    { showSplash ? <SplashScreen /> : <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      { (redditPrePromptDetails.chatTitle && projectID) || selectedYoutubeThreadsList.length ? <Stepper activeStepNumber={3} handleStepClick={handleStepClick} /> : null }
      <CustomBreadcrumbs
        heading="Prompts List"
        links={[
          {
            name: 'Prompts',
            // href: paths.dashboard.post.root,
          },
          {
            name: 'List',
          },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.post.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Prompt
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Stack
        spacing={3}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <PostSearch
          query={search.query}
          results={search.results}
          onSearch={handleSearch}
          filteredPrompts={setPromptsf}
        />

        <PostSort sort={sortBy} onSort={handleSortBy} sortOptions={POST_SORT_OPTIONS} />
      </Stack>

      
      {notFound && <EmptyContent filled title="Please create prompts" sx={{ py: 10 }} />}
      <PostListHorizontal posts={dataFiltered} ShowSplash = {setShowSplash} />
    </Container> }
    </>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData,  sortBy }) => {


  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['date'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['date'], ['asc']);
  }

  return inputData;
};
