import PropTypes from 'prop-types';
import { useCallback, useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useAuthContext } from 'src/auth/hooks';
import { SaveCampaignAndSyncThreads, SetCampaignState, ResetCampaignNotify } from 'src/app/lib/slices/campaign-slice';
import { GetUserSubscriptionPlanDetail } from 'src/app/lib/slices/subscription-slice';
//
import axios from 'axios';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';

import { SplitText } from 'src/utils/helpers';

import { host } from '../../utils/APIRoutes';

import JobItem from './job-item';

export default function JobList({ jobs, setShowSplash }) {
  const router = useRouter();
  const { user: { _id: userId } } = useAuthContext();

  const dispatch = useAppDispatch();
  const {
    notifyType: campaignSliceNotifyType,
    notifyMessage: campaignSliceNotifyMessage,
    notify: campaignNotify,
    threadsSynced,
    saveThreadsForMultiPlatformsLoading
  } = useAppSelector((state) => state.campaign);
  const { userSubscriptionPlanDetails } = useAppSelector((state) => state.subscription);

  const [jobList, setJobList] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [currentPage, setCurrentPage] = useState(1);
  const jobListPerPage = 9;
  const [disabled, setDisabled] = useState(true);
  // const [showSplash, setShowSplash] = useState(false);
  const indexOfLastJobList = currentPage * jobListPerPage;
  const indexOfFirstJobList = indexOfLastJobList - jobListPerPage;

  const currentJobList = jobList.slice(indexOfFirstJobList, indexOfLastJobList).filter(Boolean);;

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const projectID = localStorage.getItem('projectID');
  useEffect(() => {
    setJobList(jobs);
    if (projectID) setDisabled(false);
  }, [jobs, projectID]);

  const handleView = useCallback(
    (id) => {
      const currentJob = jobs.find((job) => job._id === id);

      if (!projectID) enqueueSnackbar('Please create or choose project!', { variant: 'error' });

      let allDateRange = null;

      if (currentJob.dateRange[0] === 'allDateRange') allDateRange = 'allDateRange'
      dispatch(SaveCampaignAndSyncThreads({
        campaignDetails: { ...currentJob, allDateRange },
        reSyncThreads: true,
      }));
    },
    [jobs, projectID, dispatch]
  );

  useEffect(() => {
    if (campaignSliceNotifyMessage && campaignNotify) {
       const messages = campaignSliceNotifyMessage
          .split('&')
          .map(msg => msg.trim())
          .filter(Boolean);
  
        messages.forEach(msg => {
          enqueueSnackbar(msg, {
            variant: campaignSliceNotifyType,
          });
        });
  
      dispatch(ResetCampaignNotify());
    }
    if (!saveThreadsForMultiPlatformsLoading && threadsSynced) {
      dispatch(GetUserSubscriptionPlanDetail({ userId }));
      dispatch(SetCampaignState({ field: 'threadsSynced', value: false }));
    }
  }, [enqueueSnackbar, threadsSynced, campaignNotify, saveThreadsForMultiPlatformsLoading, campaignSliceNotifyMessage, campaignSliceNotifyType]);

  const handleEdit = useCallback(
    (id) => {
      router.push(paths.dashboard.tour.job.edit(id));
      // console.log("edit",id);
    },
    [router]
  );

  useEffect(() => {
    dispatch(GetUserSubscriptionPlanDetail({ userId }));
  }, [userId]);

  const handleDelete = useCallback(
    async (id) => {
      await axios.delete(`${host}/api/campaign/${id}`);
      console.info('DELETE', id);
      const updatedJobList = jobList.filter((job) => job._id !== id);
      setJobList(updatedJobList);
      // console.log('jobspanel_delete', jobList);
    },
    [jobList]
  );

  // localStorage.setItem("refresh", false);

  return (
    // <>
    //   {showSplash ? (
    //     <SplashScreen />
    //   ) : (
    <>

      {
        saveThreadsForMultiPlatformsLoading ? <LoadingScreen sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999
        }} /> : null
      }
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        {currentJobList?.map((job) => (
          <JobItem
            key={job._id}
            job={job}
            credits={userSubscriptionPlanDetails?.credits}
            userPlan={userSubscriptionPlanDetails?.subscriptionPlan}
            onView={() => handleView(job._id)}
            onEdit={() => handleEdit(job._id)}
            onDelete={() => handleDelete(job._id)}
            disabled={disabled}
          />
        ))}
      </Box>

      {jobList.length > jobListPerPage && (
        <Pagination
          count={Math.ceil(jobList.length / jobListPerPage)}
          size="small"
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            mt: 8,
            '& .MuiPagination-ul': {
              justifyContent: 'center',
            },
          }}
        />
      )}
    </>
  );
}

JobList.propTypes = {
  jobs: PropTypes.array,
  setShowSplash: PropTypes.func,
};
