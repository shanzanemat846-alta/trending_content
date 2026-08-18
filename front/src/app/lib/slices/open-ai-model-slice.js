import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { openAIModelRoute } from 'src/utils/APIRoutes';

import { AxiosBaseUrl } from '../config/axios-configuration';

import { HandleCatchBlock } from '../helpers';

import { ENDPOINTS } from '../../../utils/constants';

const axios = AxiosBaseUrl();

const initialState = {
  success: false,
  notify: false,
  notifyMessage: '',
  notifyType: 'error',
  openAIModelsList: [],
  getOpenAIModelsLoading: false,
  saveNewModelLoading: false,
  deleteModelLoading: false,
  updateModelLoading: false,
  modelAdded: false,
};

export const GetOpenAIModels = createAsyncThunk(
  'GET_OPEN_AI_MODELS',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${openAIModelRoute}${ENDPOINTS.MODELS.OPEN_AI_MODELS}`
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SaveOpenAIModel = createAsyncThunk(
  'SAVE_OPEN_AI_MODEL',
  async (data, { rejectWithValue }) => {
    try {
      const { modelName, apiKey } = data;

      const response = await axios.post(
        `${openAIModelRoute}${ENDPOINTS.MODELS.SAVE_OPEN_AI_MODEL}`,
        { modelName, apiKey }
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);


export const DeleteOpenAIModel = createAsyncThunk(
  'DELETE_OPEN_AI_MODEL',
  async (data, { rejectWithValue }) => {
    try {
      const { _id } = data;

      const response = await axios.delete(
        `${openAIModelRoute}${ENDPOINTS.MODELS.DELETE_OPEN_AI_MODEL}`,
        {
          data: { _id }, 
        }
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateOpenAIModel = createAsyncThunk(
  'UPDATE_OPEN_AI_MODEL',
  async (data, { rejectWithValue }) => {
    try {
      const { _id, updateParams } = data;

      const response = await axios.put(
        `${openAIModelRoute}${ENDPOINTS.MODELS.UPDATE_OPEN_AI_MODEL}`,
        { _id, updateParams }
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const openAIModelSlice = createSlice({
  name: 'openAIModel',
  initialState,
  reducers: {
    SetOpenAIModelState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    ResetOpenAIModelNotify(state) {
      state.notify = false;
      state.notifyMessage = '';
      state.notifyType = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(SaveOpenAIModel.pending, (state) => ({
        ...state,
        projectUpdated: false,
        saveNewModelLoading: true,
        success: false,
      }))
      .addCase(SaveOpenAIModel.fulfilled, (state, action) => {
        const newModel = action.payload.data.modelDetails.model;
        return {
          ...state,
          success: true,
          notify: true,
          saveNewModelLoading: false,
          notifyMessage: action.payload.message,
          notifyType: 'success',
          openAIModelsList: [...state.openAIModelsList, newModel],
          modelAdded: true
        }})
      .addCase(SaveOpenAIModel.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        saveNewModelLoading: false,
        notifyType: 'error',
        success: false,
        notify: true,
        modelAdded: false
      }))
      .addCase(GetOpenAIModels.pending, (state) => ({
        ...state,
        getOpenAIModelsLoading: true,
        success: false,
      }))
      .addCase(GetOpenAIModels.fulfilled, (state, action) => ({
        ...state,
        getOpenAIModelsLoading: false,
        success: true,
        openAIModelsList: action.payload.data.openAIModelsList || []
      }))
      .addCase(GetOpenAIModels.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        getOpenAIModelsLoading: false,
        notifyType: 'error',
        success: false,
        notify: true,
        openAIModels: action.payload.data.openAIModels
      }))
      .addCase(DeleteOpenAIModel.pending, (state) => ({
        ...state,
        deleteModelLoading: true,
        success: false,
      }))
      .addCase(DeleteOpenAIModel.fulfilled, (state, action) => {
        const deletedId = action.meta.arg._id;
        return {
          ...state,
          deleteModelLoading: false,
          success: true,
          notify: true,
          notifyMessage: action.payload.message,
          notifyType: 'success',
          openAIModelsList: state.openAIModelsList.filter((m) => m._id !== deletedId)
        };
      })
      .addCase(DeleteOpenAIModel.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        deleteModelLoading: false,
        notify: true
      }))
      .addCase(UpdateOpenAIModel.pending, (state) => ({
        ...state,
        updateModelLoading: true,
        success: false,
      }))
      .addCase(UpdateOpenAIModel.fulfilled, (state, action) => {
        const { updatedModel, previousDefaultModel } = action.payload.data.response;

        return {
          ...state,
          updateModelLoading: false,
          success: true,
          notify: true,
          notifyMessage: action.payload.message,
          notifyType: "success",
          openAIModelsList: state.openAIModelsList.map((m) => {
            if (m._id === updatedModel._id) {
              return updatedModel;
            }
            if (previousDefaultModel && m._id === previousDefaultModel._id) {
              return previousDefaultModel;
            }
            return m;
          }),
        }})
      .addCase(UpdateOpenAIModel.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        updateModelLoading: false,
        notify: true
      }));
  }
});

export const { SetOpenAIModelState, ResetOpenAIModelNotify } = openAIModelSlice.actions;

export default openAIModelSlice.reducer;
