import PropTypes from 'prop-types';
import { useCallback, useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
// routes
import { paths } from 'src/routes/paths';
// components
import { useRouter } from 'src/routes/hooks';
import { host } from 'src/utils/APIRoutes';
import { SetThreadState } from 'src/app/lib/slices/thread-slice';
import { useAppDispatch } from 'src/app/lib/hooks';
import { enqueueSnackbar } from 'src/components/snackbar';
//
import axios from "axios";
import TourItem from './tour-item';

// ----------------------------------------------------------------------

export default function TourList({ tours }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [projectList, setProjectList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const projectListPerPage = 9;

  const indexOfLastProjectList = currentPage * projectListPerPage;
  const indexOfFirstProjectList = indexOfLastProjectList - projectListPerPage;
  const currentProjectList = projectList.slice(indexOfFirstProjectList, indexOfLastProjectList);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setProjectList(tours);
  }, [tours]);

  const handleView = useCallback(
    (id) => {
      router.push(paths.dashboard.tour.threads(id));
      localStorage.setItem("projectID", id);
      localStorage.setItem('campaignMode', 'Sub-reddit');
    },
    [router]
  );

  const handleGo = useCallback(
    (id) => {
      router.push(paths.dashboard.tour.job.new(id));
      localStorage.setItem('projectID', id);
      localStorage.setItem('campaignMode', 'Sub-reddit');
      dispatch(SetThreadState({ field: 'selectedYoutubeThreadsList', value: [] }));
      dispatch(SetThreadState({ field: 'selectedRedditThreadsList', value: [] }));
      dispatch(SetThreadState({
        field: 'contentCreationFails',
        value: {
          errorMessage: null,
          platform: null
        }
      }));
      dispatch(SetThreadState({
        field: 'platformForContent',
        value: null
      }));
    },
    [router]
  );


  const handleEdit = useCallback(
    (id) => {
      router.push(paths.dashboard.tour.edit(id));
    },
    [router]
  );

  const handleDelete = useCallback(async (id) => {
    try {
      await axios.delete(`${host}/api/project/${id}`);
      console.info('DELETE', id);
      localStorage.setItem("projectID", "");
      const updatedProjectList = projectList.filter((job) => job._id !== id);
      setProjectList(updatedProjectList);
      enqueueSnackbar('Project deleted successfully!', { variant: 'success' });
    } catch (error) {
      console.log('\n\n error deleting the project');
      enqueueSnackbar('Error in deleting the project', { variant: 'error' });
    }
  }, [projectList]);

  return (
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        {currentProjectList.map((tour) => (
          <TourItem
            key={tour?._id}
            tour={tour}
            onView={() => handleView(tour?._id)}
            onEdit={() => handleEdit(tour?._id)}
            onDelete={() => handleDelete(tour?._id)}
            onGo={() => handleGo(tour?._id)}
          />
        ))}
      </Box>

      {projectList.length > projectListPerPage && (
        <Pagination
          count={Math.ceil(projectList.length / projectListPerPage)}
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

TourList.propTypes = {
  tours: PropTypes.array,
};
