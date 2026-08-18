import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { projectRoute } from 'src/utils/APIRoutes';

import { AxiosBaseUrl } from '../config/axios-configuration';

import { HandleCatchBlock } from '../helpers';

import { ENDPOINTS } from '../../../utils/constants';

const axios = AxiosBaseUrl();

const initialState = {
  success: false,
  notify: false,
  notifyMessage: '',
  notifyType: 'error',
  projectUpdated: false,
  currentProject: {},
  getProjectLoading: false,
  updatingProjectDetails: false
};

export const UpdateProject = createAsyncThunk(
  'UPDATE_PROJECT',
  async (data, { rejectWithValue }) => {
    try {
      const { projectId, updateParams, action } = data;

      const response = await axios.post(`${projectRoute}${ENDPOINTS.PROJECT.UPDATE_PROJECT(projectId)}`, {
        updateParams,
        action
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetProject = createAsyncThunk(
  'GET_PROJECT',
  async (data, { rejectWithValue }) => {
    try {
      const { projectId } = data;

      const response = await axios.get(`${projectRoute}${ENDPOINTS.PROJECT.GET_PROJECT(projectId)}`);

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    SetProjectState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    ResetProjectNotify(state) {
      state.notify = false;
      state.notifyMessage = '';
      state.notifyType = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(UpdateProject.pending, (state) => ({
        ...state,
        projectUpdated: false,
        updatingProjectDetails: true,
        success: false,
      }))
      .addCase(UpdateProject.fulfilled, (state, action) => ({
        ...state,
        success: true,
        notify: true,
        projectUpdated: true,
        updatingProjectDetails: false,
        notifyMessage: action.payload.message,
        notifyType: 'success'
      }))
      .addCase(UpdateProject.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        updatingProjectDetails: false,
        notifyType: 'error',
        success: false,
        projectUpdated: false,
        notify: true
      }))
      .addCase(GetProject.pending, (state) => ({
        ...state,
        getProjectLoading: true,
        success: false,
      }))
      .addCase(GetProject.fulfilled, (state, action) => ({
        ...state,
        getProjectLoading: false,
        success: true,
        notify: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        currentProject: action.payload.data.project
      }))
      .addCase(GetProject.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        getProjectLoading: false,
        notify: true,
        currentProject: {}
      }));
  }
});

export const { SetProjectState, ResetProjectNotify } = projectSlice.actions;

export default projectSlice.reducer;
