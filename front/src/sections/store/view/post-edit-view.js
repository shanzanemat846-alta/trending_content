'use client';

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { host } from 'src/utils/APIRoutes';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import axios from 'axios';
import PostNewEditForm from '../post-new-edit-form';

// ----------------------------------------------------------------------

export default function PostEditView({ id }) {
  const settings = useSettingsContext();
  const [currentPost, setCurrentPost] = useState();
  
  const projectid = localStorage.getItem("projectID");

  useEffect(() => {
    const getStores = async () => {
      try {
      const response = await axios.get(`${host}/api/store/pull?projectid=${projectid}`);
      const stores = response.data;
      const stored = stores.find(store => store._id === id);
      setCurrentPost(stored);
    } catch (error) { console.error('Error fetching chatgpt:', error)};
} 
   getStores();
}, [projectid, setCurrentPost, id]);

console.log("the last chat in store edit page", currentPost)
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Project',
            href: paths.dashboard.tour.root,
          },
          {
            name: 'Contents',
            href: paths.dashboard.tour.store.root(projectid),
            // href: paths.dashboard.tour.demo.store,
          },
          {
            name: 'Edit'
          }
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PostNewEditForm currentPost={currentPost} />
    </Container>
  );
}

PostEditView.propTypes = {
  id: PropTypes.string,
};
