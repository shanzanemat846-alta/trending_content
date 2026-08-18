import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { extend } from 'lodash';

import { userRoute } from 'src/utils/APIRoutes';
import { ENDPOINTS } from 'src/utils/constants';

import { AxiosBaseUrl } from '../config/axios-configuration';

import { HandleCatchBlock } from '../helpers';

const axios = AxiosBaseUrl();

const initialState = {
  userDetails: {},
  getUserLoading: false,
  success: false,
  notify: false,
  notifyMessage: '',
  notifyType: 'error',
  updateUserLoading: false,
  userUpdated: false,
  profileImage: null,
  profileImageLoading: false,
  userProfileImageDetails: {
    base64Image: null,
    mimeType: null
  },
  userCoverImageDetails: {
    base64Image: null,
    mimeType: null
  },
  profileImageUpdated: false,
  updatePlanFromSaveContent: false
};

export const GetUserDetail = createAsyncThunk(
  'GET_USER_DETAIL',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;

      const response = await axios.get(`${userRoute}${ENDPOINTS.USER.GET_USER(userId)}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateUserDetail = createAsyncThunk(
  'UPDATE_USER_DETAIL',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, updateParams } = data;

      const response = await axios.patch(`${userRoute}${ENDPOINTS.USER.UPDATE_USER(userId)}`, {
        updateParams
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateMedia = createAsyncThunk(
  'UPDATE_MEDIA',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, formData } = data;

      const response = await axios.post(`${userRoute}${ENDPOINTS.USER.UPDATE_MEDIA(userId)}`, formData);

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetMedia = createAsyncThunk(
  'GET_MEDIA',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, type } = data;

      const response = await axios.get(`${userRoute}${ENDPOINTS.USER.GET_MEDIA(userId)}`, {
        params: { type },
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeleteMedia = createAsyncThunk(
  'DELETE_MEDIA',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, type } = data;

      const response = await axios.delete(`${userRoute}${ENDPOINTS.USER.DELETE_MEDIA(userId)}`, {
        params: { type }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    SetUserState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    ResetNotify(state) {
      state.notify = false;
      state.notifyMessage = '';
      state.notifyType = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetUserDetail.pending, (state) => ({
        ...state,
        getUserLoading: true,
        success: false
      }))
      .addCase(GetUserDetail.fulfilled, (state, action) => ({
        ...state,
        success: true,
        getUserLoading: false,
        userDetails: action.payload.data.userDetails,
      }))
      .addCase(GetUserDetail.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        getUserLoading: false,
        notify: true
      }))
      .addCase(UpdateUserDetail.pending, (state) => ({
        ...state,
        updateUserLoading: true,
        success: false
      }))
      .addCase(UpdateUserDetail.fulfilled, (state, action) => ({
        ...state,
        success: true,
        notify: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        updateUserLoading: false,
        userDetails: action.payload.data.userDetails,
        userUpdated: true,
      }))
      .addCase(UpdateUserDetail.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        updateUserLoading: false,
        notify: true,
        userUpdated: false
      }))
      .addCase(UpdateMedia.pending, (state) => ({
        ...state,
        profileImageLoading: true,
        success: false
      }))
      .addCase(UpdateMedia.fulfilled, (state, action) => {
        const { base64Image, mimeType, type } = action.payload.data;

        const updatedState = {
          ...state,
          success: true,
          notify: true,
          notifyMessage: action.payload.message,
          profileImageUpdated: true,
          notifyType: 'success',
          profileImageLoading: false,
        }

        if (type === 'coverImage') {
          extend(updatedState, {
            userCoverImageDetails: {
              base64Image,
              mimeType,
            }
          });
        } else if (type === 'profileImage') {
          extend(updatedState, {
            userProfileImageDetails: {
              base64Image,
              mimeType,
            }
          });
        }

        return updatedState;
      })
      .addCase(UpdateMedia.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        profileImageLoading: false,
        notify: true
      }))
      .addCase(GetMedia.pending, (state) => ({
        ...state,
        success: false
      }))
      .addCase(GetMedia.fulfilled, (state, action) => {
        const { base64Image, mimeType, type } = action.payload.data;

        const updatedState = {
          ...state,
          success: true,
          notify: true,
          notifyMessage: action.payload.message,
          notifyType: 'success'
        }

        if (type === 'coverImage') {
          extend(updatedState, {
            userCoverImageDetails: {
              base64Image,
              mimeType,
            }
          });
        } else if (type === 'profileImage') {
          extend(updatedState, {
            userProfileImageDetails: {
              base64Image,
              mimeType,
            }
          });
        }

        return updatedState;
      })
      .addCase(GetMedia.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true,
        userProfileImageDetails: {
          base64Image: null,
          mimeType: null
        }
      }))
      .addCase(DeleteMedia.pending, (state) => ({
        ...state,
        profileImageLoading: true,
        success: false
      }))
      .addCase(DeleteMedia.fulfilled, (state, action) => {
        const { type } = action.payload.data;

        const updatedState = {
          ...state,
          success: true,
          notify: true,
          notifyMessage: action.payload.message,
          notifyType: 'success'
        }

        if (type === 'coverImage') {
          extend(updatedState, {
            userCoverImageDetails: {
              base64Image: null,
              mimeType: null,
            }
          });
        } else if (type === 'profileImage') {
          extend(updatedState, {
            userProfileImageDetails: {
              base64Image: null,
              mimeType: null,
            }
          });
        }

        return updatedState
      })
      .addCase(DeleteMedia.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        profileImageLoading: false,
        notify: true
      }));
  }
});

export const { SetUserState, ResetNotify } = userSlice.actions;

export default userSlice.reducer;
