import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from "react";
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
//
import axios from "axios";
import { host } from 'src/utils/APIRoutes';
import { enqueueSnackbar } from 'src/components/snackbar';
import PostItemHorizontal from './post-item-horizontal';
// ----------------------------------------------------------------------

export default function PostListHorizontal({ posts, ShowSplash }) {
  const [postList, setPostList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postListPerPage = 8;

  const indexOfLastPostList = currentPage * postListPerPage;
  const indexOfFirstPostList = indexOfLastPostList - postListPerPage;
  const currentPostList = postList.slice(indexOfFirstPostList, indexOfLastPostList); 
  
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
      setPostList(posts);
    }, [posts]);

const handleDelete = useCallback(async (id) => {
  try {
    await axios.delete(`${host}/api/prompt/${id}`);
    console.info('DELETE', id);
    const updatedPostList = postList.filter((job) => job._id !== id);
    setPostList(updatedPostList);
    enqueueSnackbar('Prompt deleted successfully!', { variant: 'success' });
  } catch (error) {
    enqueueSnackbar('Error in deleting the prompt!', { variant: 'error' });
  }
    // console.log('jobspanel_delete', jobList);
  }, [postList]);

  const renderList = (
    <>
      {currentPostList.map((post) => {
        const { _id } = post;

        return (
           <PostItemHorizontal idValue={String(_id)} post={post} ShowSplash = { ShowSplash} onDelete={() => handleDelete(post._id)} />
        )
      })}
    </>
  );

  return (
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
        }}
        alignItems="start"
      >
        { renderList}
      </Box>

      {postList.length > postListPerPage && (
        <Pagination
          count={Math.ceil(postList.length / postListPerPage)}
          size="small"
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            mt: 8,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center',
            },
          }}
        />
      )}
    </>
  );
}

PostListHorizontal.propTypes = {
  posts: PropTypes.array,
  ShowSplash: PropTypes.string,
};
