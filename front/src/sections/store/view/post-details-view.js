'use client';

import PropTypes from 'prop-types';
import { useEffect,  useState } from 'react';
// @mui

import Stack from '@mui/material/Stack';

import Divider from '@mui/material/Divider';

import Container from '@mui/material/Container';



// routes
import { paths } from 'src/routes/paths';
// components
import Markdown from 'src/components/markdown';
//
import { host } from 'src/utils/APIRoutes'
import axios from 'axios';
import PostDetailsHero from '../post-details-hero';
import PostDetailsToolbar from '../post-details-toolbar';
import PostDetailsToolbarEdit from '../post-details-toolbar-edit';

// ----------------------------------------------------------------------

export default function PostDetailsView({ id }) {

  const [post, setPost] = useState('');

  // const { post, postLoading, postError } = useGetPost(title);
  const projectid = localStorage.getItem("projectID");
 useEffect(() => {
    const getStores = async () => {
      try {
      const response = await axios.get(`${host}/api/store/pull?projectid=${projectid}`);
      const stores = response.data;
      const stored = stores.find(store => store._id === id);
      setPost(stored);
    } catch (error) { console.error('Error fetching chatgpt:', error)};
} 
   getStores();
}, [projectid, setPost, id]);

 

  // useEffect(() => {
  //   if (post) {
  //     setPublish(post?.publish);
  //   }
  // }, [post]);
console.log("post", post);



  
 
  const renderPost = post && (
    <>
      <PostDetailsToolbar
        backLink={paths.dashboard.tour.store.root(`${projectid}`)}
        // editLink={paths.dashboard.tour.store.edit(`${id}`)}
      />

      <PostDetailsHero title={post.title} date={post.date} image={post.image} id={post._id} />

      <Stack
        sx={{
          maxWidth: 720,
          mx: 'auto',
          mt: { xs: 3, md: 5 },
        }}
      >
        <PostDetailsToolbarEdit
          editLink={paths.dashboard.tour.store.edit(`${id}`)}
        />
        <Divider sx={{ mb: 2 }} />
        <Markdown children={post.content} />

        {/* <Stack
          spacing={3}
          sx={{
            py: 3,
            borderTop: (theme) => `dashed 1px ${theme.palette.divider}`,
            borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            {post.tags.map((tag) => (
              <Chip key={tag} label={tag} variant="soft" />
            ))}
          </Stack>

          <Stack direction="row" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  size="small"
                  color="error"
                  icon={<Iconify icon="solar:heart-bold" />}
                  checkedIcon={<Iconify icon="solar:heart-bold" />}
                />
              }
              label={fShortenNumber(post.totalFavorites)}
              sx={{ mr: 1 }}
            />

            <AvatarGroup
              sx={{
                [`& .${avatarGroupClasses.avatar}`]: {
                  width: 32,
                  height: 32,
                },
              }}
            >
              {post.favoritePerson.map((person) => (
                <Avatar key={person.name} alt={person.name} src={person.avatarUrl} />
              ))}
            </AvatarGroup>
          </Stack>
        </Stack> */}

        {/* <Stack direction="row" sx={{ mb: 3, mt: 5 }}>
          <Typography variant="h4">Comments</Typography>

          <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
            ({post.comments.length})
          </Typography>
        </Stack> */}

        {/* <PostCommentForm /> */}

        <Divider sx={{ mt: 5, mb: 2 }} />

        {/* <PostCommentList comments={post.comments} /> */}
      </Stack>
    </>
  );

  return (
    <Container maxWidth={false}>
      {/* { renderSkeleton }

      { renderError } */}

      {post && renderPost}
    </Container>
  );
}

PostDetailsView.propTypes = {
  id: PropTypes.string,
};
