import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { campaignRoute } from 'src/utils/APIRoutes';

import { AxiosBaseUrl } from '../config/axios-configuration';

import { HandleCatchBlock } from '../helpers';

import { ENDPOINTS } from '../../../utils/constants';

const axios = AxiosBaseUrl();

const initialState = {
  success: false,
  notify: false,
  notifyMessage: '',
  notifyType: 'error',
  saveThreadsForMultiPlatformsLoading: false,
  threadsSynced: false,
  createdCampaignId: null,
  createCampaignPlatformDetails: {},
  resetCreatedCampaign: false
};

export const SaveCampaignAndSyncThreads = createAsyncThunk(
  'SAVE_CAMPAIGN_AND_SYNC_THREADS',
  async (data, { rejectWithValue }) => {
    try {
      const { campaignDetails, reSyncThreads } = data;

      const response = await axios.post(`${campaignRoute}${ENDPOINTS.CAMPAIGN.SAVE_CAMPAIGN_AND_SYNC_THREADS}`, {
        campaignDetails,
        reSyncThreads
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetSubRedditSearch = createAsyncThunk(
  'SUB_REDDIT_SEARCH',
  async (data, { rejectWithValue }) => {
    try {
      const { query } = data;

      const response = await axios.get(`${campaignRoute}${ENDPOINTS.CAMPAIGN.SUB_REDDIT_SEARCH}`, {
        params: { query },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    SetCampaignState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    ResetCampaignNotify(state) {
      state.notify = false;
      state.notifyMessage = '';
      state.notifyType = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(SaveCampaignAndSyncThreads.pending, (state) => ({
        ...state,
        saveThreadsForMultiPlatformsLoading: true,
        success: false,
        threadsSynced: false
      }))
      .addCase(SaveCampaignAndSyncThreads.fulfilled, (state, action) => {
        console.log('Reddit Threads Logs Details : ', action.payload.data.redditThreadsLogsDetails);
        return {
          ...state,
          success: true,
          notify: true,
          notifyMessage: action.payload.message,
          createdCampaignId: action.payload.data.campaignId,
          notifyType: 'success',
          saveThreadsForMultiPlatformsLoading: false,
          threadsSynced: true
        }
      })
      .addCase(SaveCampaignAndSyncThreads.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        saveThreadsForMultiPlatformsLoading: false,
        notify: true
      }))
      .addCase(GetSubRedditSearch.pending, (state) => ({
        ...state,
        subRedditSearchLoading: true,
        success: false,
        threadsSynced: false
      }))
      .addCase(GetSubRedditSearch.fulfilled, (state, action) => ({
        ...state,
        success: true,
        subRedditSearchLoading: false,
        redditSearchResults: action.payload.data.redditSearchResults,
      }))
      .addCase(GetSubRedditSearch.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        subRedditSearchLoading: false,
        redditSearchResults: []
      }));
  }
});

export const { SetCampaignState, ResetCampaignNotify } = campaignSlice.actions;

export default campaignSlice.reducer;
