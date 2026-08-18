import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { threadRoute } from 'src/utils/APIRoutes';

import { AxiosBaseUrl } from '../config/axios-configuration';

import { HandleCatchBlock } from '../helpers';

import { ENDPOINTS } from '../../../utils/constants';

const axios = AxiosBaseUrl();

const initialState = {
  success: false,
  notify: false,
  notifyMessage: '',
  notifyType: 'error',
  getThreadCommentsLoading: false,
  createYoutubeContentLoading: false,
  threadComments: [],
  platformForContent: null,
  getCaptionsLoading: false,
  captionDetails: {},
  selectedYoutubeThreadsList: [],
  contentCreationFails: {
    errorMessage: null,
    platform: null
  },
  selectedRedditThreadsList: [],
  getYoutubeDataForPreviewLoading: false,
  youtubeDataForPreview: [],
  getRedditDataForPreviewLoading: false,
  redditDataForPreview: [],
  redditPrePromptDetails: {
    chatTitle: "",
    chatPrePrompt: ""
  },
  redditDataCount: {
    subReddit: 0,
    keywords: 0
  },
  getRedditDataCountLoading: false,
  saveThreads: [],
  getSummarizeFindingLoading: false,
  summaryFindingDetails: {
    summary: "",
    subReddit: [],
    faqs: [],
    threads: []
  },
  exportThreadsLoading: false,
  summaryFailed: false,
};

export const GetThreadComments = createAsyncThunk(
  'GET_THREAD_COMMENTS',
  async (data, { rejectWithValue }) => {
    try {
      const { threadId } = data;

      const response = await axios.get(`${threadRoute}${ENDPOINTS.THREAD.THREAD_COMMENTS(threadId)}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetCaption = createAsyncThunk(
  'GET_CAPTION',
  async (data, { rejectWithValue }) => {
    try {
      const { threadId } = data;

      const response = await axios.get(`${threadRoute}${ENDPOINTS.THREAD.CAPTIONS(threadId)}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const FetchAndSaveYoutubeThreadCaptions = createAsyncThunk(
  'FETCH_AND_SAVE_YOUTUBE_THREAD_CAPTIONS',
  async (data, { rejectWithValue }) => {
    try {
      const { youtubeThreadsId } = data;

      const response = await axios.post(`${threadRoute}${ENDPOINTS.THREAD.FETCH_AND_SAVE_YOUTUBE_THREAD_CAPTIONS}`, {
        youtubeThreadsId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const FetchRedditThreadDetails = createAsyncThunk(
  'FETCH_REDDIT_THREAD_DETAILS',
  async (data, { rejectWithValue }) => {
    try {
      const { redditThreadsId } = data;

      const response = await axios.post(`${threadRoute}${ENDPOINTS.THREAD.FETCH_REDDIT_THREAD_DETAILS}`, {
        redditThreadsId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);


export const GetRedditDataCount = createAsyncThunk(
  'GET_REDDIT_DATA_COUNT',
  async (data, { rejectWithValue }) => {
    try {
      const { projectId } = data;

      const response = await axios.get(`${threadRoute}${ENDPOINTS.THREAD.GET_REDDIT_DATA_COUNT(projectId)}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetSaveThreads = createAsyncThunk(
  'GET_SAVE_THREADS',
  async (data, { rejectWithValue }) => {
    try {
      const { projectId } = data;

      const response = await axios.get(`${threadRoute}${ENDPOINTS.THREAD.GET_SAVE_THREADS(projectId)}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SummarizeThreads = createAsyncThunk(
  'SUMMARIZE_THREADS',
  async (data, { rejectWithValue }) => {
    try {
      const { threadsList } = data;

      const response = await axios.post(`${threadRoute}${ENDPOINTS.THREAD.SUMMARIZE_THREADS}`, {
        threadsList
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DownloadThreads = createAsyncThunk(
  'DownloadThreads',
  async (data, { rejectWithValue }) => {
    try {
      const { threadsList } = data;

      const response = await axios.get(
        `${threadRoute}${ENDPOINTS.THREAD.DOWNLOAD_THREADS}?threadsList=${encodeURIComponent(JSON.stringify(threadsList))}`,
        {
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `threads_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      return { success: true };
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const threadSlice = createSlice({
  name: 'thread',
  initialState,
  reducers: {
    SetThreadState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    ResetThreadNotify(state) {
      state.notify = false;
      state.notifyMessage = '';
      state.notifyType = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetThreadComments.pending, (state) => ({
        ...state,
        getThreadCommentsLoading: true,
        success: false
      }))
      .addCase(GetThreadComments.fulfilled, (state, action) => ({
        ...state,
        success: true,
        threadComments: action.payload.data.threadComments,
        getThreadCommentsLoading: false,
      }))
      .addCase(GetThreadComments.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        getThreadCommentsLoading: false
      }))
       .addCase(GetCaption.pending, (state) => ({
        ...state,
        getCaptionsLoading: true,
        success: false
      }))
      .addCase(GetCaption.fulfilled, (state, action) => ({
        ...state,
        success: true,
        captionDetails: action.payload.data.captions,
        getCaptionsLoading: false,
      }))
      .addCase(GetCaption.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        getCaptionsLoading: false
      }))
      .addCase(FetchAndSaveYoutubeThreadCaptions.pending, (state) => ({
        ...state,
        getYoutubeDataForPreviewLoading: true,
        success: false
      }))
      .addCase(FetchAndSaveYoutubeThreadCaptions.fulfilled, (state, action) => ({
        ...state,
        success: true,
        youtubeDataForPreview: action.payload.data.youtubeThreadsData,
        getYoutubeDataForPreviewLoading: false,
      }))
      .addCase(FetchAndSaveYoutubeThreadCaptions.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        getYoutubeDataForPreviewLoading: false
      }))
      .addCase(FetchRedditThreadDetails.pending, (state) => ({
        ...state,
        getRedditDataForPreviewLoading: true,
        success: false
      }))
      .addCase(FetchRedditThreadDetails.fulfilled, (state, action) => ({
        ...state,
        success: true,
        redditDataForPreview: action.payload.data.redditThreadsData,
        getRedditDataForPreviewLoading: false,
      }))
      .addCase(FetchRedditThreadDetails.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        getRedditDataForPreviewLoading: false
      }))
      .addCase(GetRedditDataCount.pending, (state) => ({
        ...state,
        getRedditDataCountLoading: true,
        success: false
      }))
      .addCase(GetRedditDataCount.fulfilled, (state, action) => ({
        ...state,
        success: true,
        redditDataCount: action.payload.data.redditDataCount,
        getRedditDataCountLoading: false,
      }))
      .addCase(GetRedditDataCount.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        getRedditDataCountLoading: false
      }))
      .addCase(GetSaveThreads.pending, (state) => ({
        ...state,
        getSaveThreadsLoading: true,
        success: false
      }))
      .addCase(GetSaveThreads.fulfilled, (state, action) => ({
        ...state,
        success: true,
        saveThreads: action.payload.data.saveThreads,
        getSaveThreadsLoading: false,
      }))
      .addCase(GetSaveThreads.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        getSaveThreadsLoading: false
      }))
      .addCase(SummarizeThreads.pending, (state) => ({
        ...state,
        getSummarizeFindingLoading: true,
        success: false
      }))
      .addCase(SummarizeThreads.fulfilled, (state, action) => ({
        ...state,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        success: true,
        notify: true,
        summaryFindingDetails: action.payload.data.summaryFindingDetails,
        getSummarizeFindingLoading: false,
      }))
      .addCase(SummarizeThreads.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        summaryFailed: true,
        getSummarizeFindingLoading: false,
      }))
      .addCase(DownloadThreads.pending, (state) => ({
        ...state,
        exportThreadsLoading: true,
        success: false
      }))
      .addCase(DownloadThreads.fulfilled, (state, action) => ({
        ...state,
        success: true,
        exportThreadsLoading: false
      }))
      .addCase(DownloadThreads.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        exportThreadsLoading: false,
      }))
      
  }
});

export const { SetThreadState, ResetThreadNotify } = threadSlice.actions;

export default threadSlice.reducer;
