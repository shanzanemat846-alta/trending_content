import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { chatgptRoute } from 'src/utils/APIRoutes';

import { AxiosBaseUrl } from '../config/axios-configuration';

import { HandleCatchBlock } from '../helpers';

import { ENDPOINTS } from '../../../utils/constants';

const axios = AxiosBaseUrl();

const initialState = {
  success: false,
  notify: false,
  notifyMessage: '',
  notifyType: 'error',
  createContentLoading: false,
  createContentSuccess: false,
  chat: {}
};

export const CreateContent = createAsyncThunk(
  'CREATE_CONTENT',
  async (data, { rejectWithValue }) => {
    try {
      const { contentCreationParams, platform, promptId } = data;

      const response = await axios.post(`${chatgptRoute}${ENDPOINTS.CHATGPT.CREATE_CONTENT}`, {
        promptId,
        platform,
        contentCreationParams
      });
      return response.data;
    } catch (err) {
      console.log('err create content: ', err);
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const chatgptSlice = createSlice({
  name: 'chatgpt',
  initialState,
  reducers: {
    SetChatgptState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    ResetChatgptNotify(state) {
      state.notify = false;
      state.notifyMessage = '';
      state.notifyType = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(CreateContent.pending, (state) => ({
        ...state,
        createContentLoading: true,
        success: false
      }))
      .addCase(CreateContent.fulfilled, (state, action) => ({
        ...state,
        success: true,
        createContentLoading: false,
        notifyMessage: action.payload.message,
        chat: action.payload.data.chat,
        createContentSuccess: true,
        notifyType: 'success',
        notify: true,
      }))
      .addCase(CreateContent.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        createContentLoading: false
      }));;
  }
});

export const { SetChatgptState, ResetChatgptNotify } = chatgptSlice.actions;

export default chatgptSlice.reducer;
