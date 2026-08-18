'use client';

import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths'
//
import PostNewEditForm from '../post-new-edit-form';

// ----------------------------------------------------------------------

export default function PostEditView({ id }) {
  const settings = useSettingsContext();

  // const { post: currentPost } = useGetPost(`${title}`);
  const prompts = JSON.parse(localStorage.getItem('prompts'));

  const currentPost = prompts.find((job) => job._id === id );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Prompt"
        links={[
          {
            name: 'Prompts',
            href: paths.dashboard.post.root,
          },
          {
            name: currentPost?.title,
          },
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
