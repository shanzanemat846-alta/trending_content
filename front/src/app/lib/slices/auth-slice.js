import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { authRoute } from 'src/utils/APIRoutes';

import { AxiosBaseUrl } from '../config/axios-configuration';

import { HandleCatchBlock } from '../helpers';

import { ENDPOINTS } from '../../../utils/constants';

const axios = AxiosBaseUrl();

const initialState = {
  error: '',
  message: '',
  forgetPasswordLoading: false,
  resendPasswordLoading: false,
  success: false,
  notifyMessage: '',
  notify: false,
  notifyType: '',
  passwordReset: false
};

export const ForgotPassword = createAsyncThunk(
  'AUTH_FORGOT_PASSWORD',
  async (data, { rejectWithValue }) => {
    try {
      const { email } = data;
      const response = await axios.post(`${authRoute}${ENDPOINTS.AUTH.FORGOT_PASSWORD}`, { email: email.trim() });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const ResetPassword = createAsyncThunk(
  'AUTH_RESET_PASSWORD',
  async (data, { rejectWithValue }) => {
    try {
      const { password, token } = data;
      const response = await axios.patch(`${authRoute}${ENDPOINTS.AUTH.RESET_PASSWORD}`, { password, token });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    SetAuthState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    ResetAuthNotify(state) {
      state.notify = false;
      state.notifyMessage = '';
      state.notifyType = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(ForgotPassword.pending, (state) => ({
      ...state,
      success: false,
      forgetPasswordLoading: true,
    }))
    .addCase(ForgotPassword.fulfilled, (state, action) => ({
      ...state,
      forgetPasswordLoading: false,
      success: true,
      message: action.payload.message,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
    }))
    .addCase(ForgotPassword.rejected, (state, action) => ({
      ...state,
      forgetPasswordLoading: false,
      success: false,
      error: action.payload.error,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
    }))
    .addCase(ResetPassword.pending, (state) => ({
      ...state,
      success: false,
      resendPasswordLoading: true,
    }))
    .addCase(ResetPassword.fulfilled, (state, action) => ({
      ...state,
      resendPasswordLoading: false,
      success: true,
      passwordReset: true,
      message: action.payload.message,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
    }))
    .addCase(ResetPassword.rejected, (state, action) => ({
      ...state,
      resendPasswordLoading: false,
      success: false,
      passwordReset: false,
      error: action.payload.error,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
    }));
  }
});

const { reducer, actions } = auth;

export const { SetAuthState, ResetAuthNotify } = actions;

export default reducer;
