'use client';

import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import { useCallback, useState, useEffect } from 'react';
// @mui

import Stack from '@mui/material/Stack';

import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';


// _mock
import { POST_SORT_OPTIONS } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import EmptyContent from 'src/components/empty-content';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { host } from 'src/utils/APIRoutes';
import axios from 'axios';
import { useSnackbar } from 'src/components/snackbar';
import { def_id } from 'src/config-global';
import PostSort from '../post-sort';
import PostSearch from '../post-search';
import PostListHorizontal from '../post-list-horizontal';
// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  publish: [],
  stock: [],
};

export default function PostListView( { id }) {

  const { enqueueSnackbar } = useSnackbar();

  if(id === def_id ) enqueueSnackbar( 'Please select the Project!', { variant:  'warning' });

  const settings = useSettingsContext();

  const [sortBy, setSortBy] = useState('latest');

  const [search, setSearch] = useState({
    query: '',
    results: [],
  });

  const [stores, setStores] = useState();

  const [storesf, setStoresf] = useState();
    useEffect(() => {
    const getStores = async () => {
      try {
      const response = await axios.get(`${host}/api/store/pull?projectid=${id}`);
      const storesd = response.data;  
      setStores(storesd);
    } catch (error) { console.error('Error fetching chatgpt:', error)};
} 
   getStores();
}, [id, setStores]);

  const dataFiltered = applyFilter({
    inputData: storesf || stores,
    sortBy,
  });

  const notFound = !dataFiltered.length ;

  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);

  // const handleFilters = useCallback((name, value) => {
  //   setFilters((prevState) => ({
  //     ...prevState,
  //     [name]: value,
  //   }));
  // }, []);

 
  const handleSearch = useCallback(
    (inputValue) =>{
      setSearch((prevState) => ({
        ...prevState,
        query: inputValue,
      }));
      
      if (inputValue) {
        const results = stores.filter(
          (job) => job.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
        );

        setSearch((prevState) => ({
          ...prevState,
          results,
        }));
      }
      else {
        setStoresf("");
      }
    },
    [search.query, stores]
  );

  // ------------------------------ Current Project Name ---------------------------

  const projects = JSON.parse(localStorage.getItem('projects'));

  const currentTour = projects?.find((tour) => tour._id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Contents List"
        links={[
          {
            name: currentTour?.title,
            href: paths.dashboard.root,
          },
          {
            name: 'Contents',
            href: paths.dashboard.tour.store.root(currentTour?._id),
          },
          {
            name: 'List',
          },
        ]}
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
          filteredPrompts={setStoresf}
        />

        <PostSort sort={sortBy} onSort={handleSortBy} sortOptions={POST_SORT_OPTIONS} />
      </Stack>
      {/* 
      <Tabs
        value={filters.publish}
        onChange={handleFilterPublish}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {['all', 'published', 'draft'].map((tab) => (
          <Tab
            key={tab}
            iconPosition="end"
            value={tab}
            label={tab}
            icon={
              <Label
                variant={((tab === 'all' || tab === filters.publish) && 'filled') || 'soft'}
                color={(tab === 'published' && 'info') || 'default'}
              >
                {tab === 'all' && posts.length}

                {tab === 'published' && posts.filter((post) => post.publish === 'published').length}

                {tab === 'draft' && posts.filter((post) => post.publish === 'draft').length}
              </Label>
            }
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs> */}
      {notFound && <EmptyContent filled title="Please make awesome contents" sx={{ py: 10 }} />}
      <PostListHorizontal posts={dataFiltered} />
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, sortBy }) => {
 
  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['date'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['date'], ['asc']);
  }

  return inputData;
};

PostListView.propTypes = { 
    id: PropTypes.string
};