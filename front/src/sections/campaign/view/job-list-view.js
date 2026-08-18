'use client';

import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import { useState, useCallback, useEffect } from 'react';
import axios from "axios";
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { LoadingScreen } from 'src/components/loading-screen';
// _mock
import {

  JOB_SORT_OPTIONS,
} from 'src/_mock';
// assets
// components
import { host } from 'src/utils/APIRoutes';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSnackbar } from 'src/components/snackbar';
//
import { def_id } from 'src/config-global';
import JobList from '../job-list';
import JobSort from '../job-sort';
import JobSearch from '../job-search';

// ----------------------------------------------------------------------


const defaultFilters = {
  mode: 'all',
};

// ----------------------------------------------------------------------


export default function JobListView({ id }) {

  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const [sortBy, setSortBy] = useState('latest');

  const [filters, setFilters] = useState(defaultFilters);

  const [showSplash, setShowSplash] = useState(false);

   const [search, setSearch] = useState({
    query: '',
    results: [],
  });

  localStorage.setItem("refresh", false);

  const [campaigns, setCampaigns] = useState();
  const [campaignsf, setCampaignsf] = useState();
  
  useEffect(() => {
    if (id !== def_id) {
      const fetchCampaigns = async () => {
        try {
          const response = await axios.get(`${host}/api/campaign/pull?projectid=${id}`);
          setCampaigns(response.data);
        } catch (error) {
          console.error('Error fetching campaigns:', error);
        }
      };
  
      fetchCampaigns();
    } else {
      enqueueSnackbar('Please select the Project!', { variant: 'warning' });
    }
  }, [id]); 
  
  localStorage.setItem("campaign", JSON.stringify(campaigns));

  const dataFiltered = applyFilter({
    inputData: campaignsf || campaigns,
    filters,
    sortBy,
  });
  
  const notFound = !dataFiltered.length ;

  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);


  const handleSearch = useCallback(
    (inputValue) => {
      setSearch((prevState) => ({
        ...prevState,
        query: inputValue,
      }));
      if (inputValue) {
        const results = campaigns?.filter(
          (job) => job.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
        );
        if (results) {
          setSearch((prevState) => ({
            ...prevState,
            results,
          }));
        }
      }
      else {
        setCampaignsf("");
      }
    },
    [search.query, campaigns]
  );

// const handleFilterMode = useCallback(
//     (event, newValue) => {
//       handleFilters('mode', newValue);
//     },
//     [handleFilters]
//   );

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <JobSearch
        query={search.query}
        results={search.results}
        onSearch={handleSearch}
        filteredCampaigns={setCampaignsf}
      />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <JobSort sort={sortBy} onSort={handleSortBy} sortOptions={JOB_SORT_OPTIONS} />
      </Stack>
    </Stack>
  );

  // ------------------------------------ Current Project Name ---------------------

  const projects = JSON.parse(localStorage.getItem('projects'));

  const currentTour = projects?.find((tour) => tour._id === id);


  return (
    <>
      {showSplash ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
          <CustomBreadcrumbs
            heading="Campaigns List"
            links={[
              { name: currentTour?.title, href: paths.dashboard.root },
              {
                name: 'Campaigns',
                href: paths.dashboard.tour.job.root(id),
              },
              { name: 'List' },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.tour.job.new(id)}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New Campaign
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Stack
            spacing={2.5}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          >
            {renderFilters}
          </Stack>

          {notFound && <EmptyContent filled title="Please create campaigns" sx={{ py: 10 }} />}

          <JobList jobs={dataFiltered} setShowSplash={setShowSplash} />
        </Container>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData,  filters, sortBy }) => {
  const { mode } = filters;
  // SORT BY
  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['date'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['date'], ['asc']);
  }

  if (mode !== 'all') {
    inputData = inputData.filter((post) => post.mode.type === mode);
  }

  return inputData;
};

JobListView.propTypes = {
  id: PropTypes.string
};