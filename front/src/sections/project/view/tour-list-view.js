'use client';

import orderBy from 'lodash/orderBy';
import { useState, useCallback , useEffect} from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// _mock
import {  TOUR_SORT_OPTIONS } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import OverViewModal from 'src/app/components/overViewModal';
import { useRouter } from 'src/routes/hooks';
//
import { projectPullRoute } from 'src/utils/APIRoutes';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { SetUserState, UpdateUserDetail } from 'src/app/lib/slices/user-slice'
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import TourList from '../tour-list';
import TourSort from '../tour-sort';
import TourSearch from '../tour-search';

// ----------------------------------------------------------------------

const defaultFilters = {
  destination: [],
  tourGuides: [],
  services: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function TourListView() {
  const settings = useSettingsContext();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    userUpdated,
    userDetails
  } = useAppSelector(state => state.user);

  const [sortBy, setSortBy] = useState('latest');

  const [search, setSearch] = useState({
    query: '',
    results: [],
  });

  const [projects, setProjects] = useState();
  const [ projectsf, setProjectsf] = useState();
  const [ overView, setOverView] = useState(true);

  
  // token
  const { user, accessToken, updateUser } = useAuthContext();

    useEffect(() => {
    const fetchProjects = async () => {
      const headers = {
        Authorization: `Bearer ${accessToken}` // Include the token in the Authorization header
      };

      try {
        const response = await axios.get(projectPullRoute, { headers });
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [accessToken]); 

  localStorage.setItem("projects", JSON.stringify(projects));

  const [filters, setFilters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const dataFiltered = applyFilter({
    inputData: projectsf || projects,
    filters,
    sortBy,
    dateError,
  });

  // const canReset =
  //   !!filters.destination.length ||
  //   !!filters.tourGuides.length ||
  //   !!filters.services.length ||
  //   (!!filters.startDate && !!filters.endDate);

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
        const results = projects.filter(
          (tour) => tour.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
        );

        setSearch((prevState) => ({
          ...prevState,
          results,
        }));
      }
      else {
        setProjectsf("");
      }
    },
    [search.query, projects]
  );

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <TourSearch
        query={search.query}
        results={search.results}
        onSearch={handleSearch}
        filteredProjects={setProjectsf}
      />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <TourSort sort={sortBy} onSort={handleSortBy} sortOptions={TOUR_SORT_OPTIONS} />
      </Stack>
    </Stack>
  );

  const userGuided = () => {
    setOverView(false);
    dispatch(UpdateUserDetail({ userId: user?._id, updateParams: { guideUserAboutAppOverView: false } }));
  };

  useEffect(() => {
    if (userUpdated && userDetails) {
      updateUser(userDetails);
      dispatch(SetUserState({ field: 'userUpdated', value: false }));
      router.push(paths.dashboard.tour.new);
    }
  }, [userUpdated, userDetails]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Projects List"
        links={[
          // { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Projects',
            href: paths.dashboard.tour.root,
          },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.tour.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New project
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

      {notFound && <EmptyContent title="Please create project" filled sx={{ py: 10 }} />}
       {
         user?.guideUserAboutAppOverView && <OverViewModal setOverView={() => userGuided()} open={overView} />
       }
      <TourList tours={dataFiltered} />
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData,  sortBy }) => {


  // SORT BY
  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['date'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['date'], ['asc']);
  }

  return inputData;
};
