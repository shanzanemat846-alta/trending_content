import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { subscriptionRoute } from 'src/utils/APIRoutes';
import { ENDPOINTS } from 'src/utils/constants';

import { AxiosBaseUrl } from '../config/axios-configuration';

import { HandleCatchBlock } from '../helpers';

const axios = AxiosBaseUrl();

const initialState = {
  userSubscriptionPlanDetails: {},
  getUserSubscriptionPlanLoading: false,
  removeSubscriptionLoading: false,
  success: false,
  notify: false,
  notifyMessage: '',
  notifyType: 'error',
  removeSubscription: false,
  contentCount: 0,
  updateCreditAccessLoading: false,
  updateSubscriptionPlan: false
};

export const GetUserSubscriptionPlanDetail = createAsyncThunk(
  'GET_USER_SUBSCRIPTION_PLAN_DETAIL',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;

      const response = await axios.get(`${subscriptionRoute}${ENDPOINTS.SUBSCRIPTION.USER_SUBSCRIPTION_PLAN(userId)}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const RemoveSubscription = createAsyncThunk(
  'CANCELED_SUBSCRIPTION',
  async (data, { rejectWithValue }) => {
    try {
      const { subscriptionId } = data;

      const response = await axios.post(`${subscriptionRoute}${ENDPOINTS.SUBSCRIPTION.CANCELED_SUBSCRIPTION(subscriptionId)}`);

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
)

export const getContentCount = createAsyncThunk(
  'GET_CONTENT_COUNT',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;

      const response = await axios.get(`${subscriptionRoute}${ENDPOINTS.SUBSCRIPTION.GET_CONTENT_COUNT(userId)}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const RemoveCard = createAsyncThunk(
  "REMOVE_CARD",
  async (data, { rejectWithValue }) => {
    try {
      const { id } = data;

      const response = await axios.delete(
        `${subscriptionRoute}${ENDPOINTS.SUBSCRIPTION.REMOVE_CARD}`,
        {
          data: { cardId: id }
        }
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateFreeCreditAccess = createAsyncThunk(
  "UPDATE_FREE_CREDIT_ACCESS",
  async (data, { rejectWithValue }) => {
    const { userId, freeCreditAccess } = data;
    try {
      const response = await axios.patch(
        `${subscriptionRoute}${ENDPOINTS.SUBSCRIPTION.UPDATE_FREE_CREDIT_ACCESS(userId)}`,
        { freeCreditAccess }
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdatePaddleSubscription = createAsyncThunk(
  "UPDATE_PADDLE_SUBSCRIPTION",
  async (data, { rejectWithValue }) => {
    const { userSubscriptionPlanId, subscriptionPriceId, plan, isYearly } = data;
    try {
      const response = await axios.patch(
        `${subscriptionRoute}${ENDPOINTS.SUBSCRIPTION.UPDATE_PADDLE_SUBSCRIPTION(userSubscriptionPlanId)}`,
        { subscriptionPriceId, plan, isYearly }
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const userSubscriptionPlanSlice = createSlice({
  name: 'userSubscriptionPlan',
  initialState,
  reducers: {
    SetUserSubscriptionPlanState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    ResetUserSubscriptionPlanNotify(state) {
      state.notify = false;
      state.notifyMessage = '';
      state.notifyType = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetUserSubscriptionPlanDetail.pending, (state) => ({
        ...state,
        getUserSubscriptionPlanLoading: true,
        success: false
      }))
      .addCase(GetUserSubscriptionPlanDetail.fulfilled, (state, action) => ({
        ...state,
        success: true,
        getUserSubscriptionPlanLoading: false,
        userSubscriptionPlanDetails: action.payload.data.userSubscriptionPlanDetails,
      }))
      .addCase(GetUserSubscriptionPlanDetail.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        getUserSubscriptionPlanLoading: false,
        notify: true
      }))
      .addCase(RemoveSubscription.pending, (state) => ({
        ...state,
        removeSubscriptionLoading: true,
        success: false
      }))
      .addCase(RemoveSubscription.fulfilled, (state, action) => ({
        ...state,
        success: true,
        removeSubscriptionLoading: false,
        removeSubscription: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
      }))
      .addCase(RemoveSubscription.rejected, (state, action) => ({
          ...state,
          notifyMessage: action.payload?.error?.detail || "An unknown error occurred",
          notifyType: 'error',
          success: false,
          removeSubscriptionLoading: false,
          notify: true
      }))    
      .addCase(getContentCount.pending, (state) => ({
        ...state,
        success: false
      }))
      .addCase(getContentCount.fulfilled, (state, action) => ({
        ...state,
        success: true,
        contentCount: action.payload.data.contentCount,
      }))
      .addCase(getContentCount.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true
      }))
      .addCase(UpdateFreeCreditAccess.pending, (state) => ({
        ...state,
        success: false,
        updateCreditAccessLoading: true
      }))
      .addCase(UpdateFreeCreditAccess.fulfilled, (state, action) => ({
        ...state,
        success: true,
        notifyType: 'success',
        notify: true,
        notifyMessage: action.payload.message,
        updateCreditAccessLoading: false
      }))
      .addCase(UpdateFreeCreditAccess.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload?.error || "Failed to update free credit access",
        notifyType: 'error',
        success: false,
        notify: true,
        updateCreditAccessLoading: false
      }))   
      .addCase(UpdatePaddleSubscription.pending, (state) => ({
        ...state,
        success: false,
        updateSubscriptionPlan: false
      }))
      .addCase(UpdatePaddleSubscription.fulfilled, (state, action) => ({
        ...state,
        success: true,
        notifyType: 'success',
        notify: true,
        notifyMessage: action.payload.message,
        updateSubscriptionPlan: true
      }))
      .addCase(UpdatePaddleSubscription.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload?.error || "Failed to update subscript plan",
        notifyType: 'error',
        success: false,
        notify: true,
        updateSubscriptionPlan: false
      }))   
  }
});

export const { SetUserSubscriptionPlanState, ResetUserSubscriptionPlanNotify } = userSubscriptionPlanSlice.actions;

export default userSubscriptionPlanSlice.reducer;
