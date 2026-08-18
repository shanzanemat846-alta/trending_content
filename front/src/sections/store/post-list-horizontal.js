import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from "react";
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
//
import axios from "axios";
import { host } from 'src/utils/APIRoutes';

import PostItemHorizontal from './post-item-horizontal';

// ----------------------------------------------------------------------

export default function PostListHorizontal({ posts }) {
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
    await axios.delete(`${host}/api/store/${id}`);
    console.info('DELETE', id);
    const updatedPostList = postList.filter((job) => job._id !== id);
      setPostList(updatedPostList);
    // console.log('jobspanel_delete', jobList);
  }, [postList]);

  const renderList = (
    <>
      {currentPostList.map((post) => (
        <PostItemHorizontal key={post._id} post={post} onDelete={() => handleDelete(post._id)} />
      ))}
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
      >
        { renderList}
      </Box>

      {posts.length > postListPerPage && (
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
};
