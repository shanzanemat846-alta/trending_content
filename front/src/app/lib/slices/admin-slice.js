import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { adminRoute } from 'src/utils/APIRoutes';

import { AxiosBaseUrl } from '../config/axios-configuration';

import { HandleCatchBlock } from '../helpers';

import { ENDPOINTS } from '../../../utils/constants';

const axios = AxiosBaseUrl();

const initialState = {
  success: false,
  notify: false,
  notifyMessage: '',
  notifyType: 'error',
  getUsersLoading: false,
  deletingUsersLoading: false,
  updateUserLoading: false,
  totalUsers: 0,
  users: [],
  usersDeleted: false,
  userUpdated: false,
  chartData: {
    labels: [],
    series: []
  },
  getChartDataLoading: false,
  demographicsList: [],
  getTopCreditDemographicsLoading: false,
  defaultModel: null,
  getDefaultAdminModelLoading: false,
  userSubscriptionUpdated: false,
  getCreditsHistoryLoading: false,
  creditsHistory: []
};

export const GetUsers = createAsyncThunk(
  'ADMIN_GET_USERS',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip, limit, filters, sortBy
      } = data;
      const response = await axios.get(`${adminRoute}${ENDPOINTS.ADMIN.USERS}`, {
        params: {
          filters: JSON.stringify(filters),
          skip,
          limit,
          sortBy
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateUser = createAsyncThunk(
  'UPDATE_USER',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, updateParams } = data;

      const response = await axios.patch(`${adminRoute}${ENDPOINTS.ADMIN.USER(userId)}`, {
        updateParams
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateUserSubscriptionDetails = createAsyncThunk(
  'UPDATE_USER_SUBSCRIPTION',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, updateParams } = data;

      const response = await axios.patch(`${adminRoute}${ENDPOINTS.ADMIN.UPDATE_USER_SUBSCRIPTION(userId)}`, {
        updateParams
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeleteUsers = createAsyncThunk(
  'DELETE_USER',
  async (data, { rejectWithValue }) => {
    try {
      const { usersIdList } = data;

      console.log('usersIdList:here the user ', usersIdList);
      const response = await axios.delete(`${adminRoute}${ENDPOINTS.ADMIN.USERS}`, {
        data: { usersIdList }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetUserCreditHistory = createAsyncThunk(
  'GET_USER_CREDIT_HISTORY',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, startDate, endDate } = data;

      const response = await axios.get(
        `${adminRoute}${ENDPOINTS.CREDIT_HISTORY.GET_CREDIT_HISTORY(userId)}?startDate=${startDate}&endDate=${endDate}`
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetTopCreditDemographics = createAsyncThunk(
  'GET_TOP_CREDIT_DEMOGRAPHICS',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${adminRoute}${ENDPOINTS.CREDIT_HISTORY.GET_TOP_DEMOGRAPHICS}`, {
        params: data
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetCreditsHistory = createAsyncThunk(
  'GET_CREDITS_HISTORY',
  async (data, { rejectWithValue }) => {
    try {
      const { filters } = data;
      const response = await axios.get(`${adminRoute}${ENDPOINTS.CREDIT_HISTORY.GET_CREDITS_HISTORY}`, {
        params: { filters: JSON.stringify(filters) }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);


export const GetAdminDefaultKey = createAsyncThunk(
  'GET_ADMIN_DEFAULT_KEY',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${adminRoute}${ENDPOINTS.ADMIN.GET_ADMIN_DEFAULT_KEY}`, {
        params: data
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    SetAdminState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    ResetAdminNotify(state) {
      state.notify = false;
      state.notifyMessage = '';
      state.notifyType = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetUsers.pending, (state) => ({
        ...state,
        success: false,
        getUsersLoading: false
      }))
      .addCase(GetUsers.fulfilled, (state, action) => ({
        ...state,
        success: true,
        getUsersLoading: false,
        totalUsers: action.payload.data.totalUsers,
        users: action.payload.data.users
      }))
      .addCase(GetUsers.rejected, (state, action) => ({
        ...state,
        getUsersLoading: false,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true
      }))
      .addCase(UpdateUser.pending, (state) => ({
        ...state,
        updateUserLoading: true,
        success: false
      }))
      .addCase(UpdateUser.fulfilled, (state, action) => {
        const { updatedUserDetails } = action.payload.data;
        return {
          ...state,
          success: true,
          notify: true,
          userUpdated: true,
          notifyMessage: action.payload.message,
          notifyType: 'success',
          updateUserLoading: false,
          users: state.users.map(user =>
            user._id === updatedUserDetails.userId ? { ...user, ...updatedUserDetails.updateParams } : user
          ),
        }
      })
      .addCase(UpdateUser.rejected, (state, action) => ({
        ...state,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        updateUserLoading: false,
        notify: true,
        userUpdated: false
      }))
      .addCase(DeleteUsers.pending, (state) => ({
        ...state,
        success: false,
        deletingUsersLoading: true
      }))
      .addCase(DeleteUsers.fulfilled, (state, action) => ({
        ...state,
        success: true,
        deletingUsersLoading: false,
        usersDeleted: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
      }))
      .addCase(DeleteUsers.rejected, (state, action) => ({
        ...state,
        deletingUsersLoading: false,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true
      }))
      .addCase(GetUserCreditHistory.pending, (state) => ({
        ...state,
        getChartDataLoading: true,
        success: false
      }))
      .addCase(GetUserCreditHistory.fulfilled, (state, action) => ({
        ...state,
        success: true,
        getChartDataLoading: false,
        chartData: action.payload.data.chartData
      }))
      .addCase(GetUserCreditHistory.rejected, (state, action) => ({
        ...state,
        getChartDataLoading: false,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true
      }))
      .addCase(GetTopCreditDemographics.pending, (state) => ({
        ...state,
        getTopCreditDemographicsLoading: true,
        success: false
      }))
      .addCase(GetTopCreditDemographics.fulfilled, (state, action) => ({
        ...state,
        success: true,
        getTopCreditDemographicsLoading: false,
        demographicsList: action.payload.data.demographicsList
      }))
      .addCase(GetTopCreditDemographics.rejected, (state, action) => ({
        ...state,
        getTopCreditDemographicsLoading: false,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true
      }))
       .addCase(GetAdminDefaultKey.pending, (state) => ({
        ...state,
        getDefaultAdminModelLoading: true,
        success: false
      }))
      .addCase(GetAdminDefaultKey.fulfilled, (state, action) => {
        console.log('action.payload.data.adminDefaultKey: ', action.payload.data.adminDefaultKey);
        return {
          ...state,
          success: true,
          getDefaultAdminModelLoading: false,
          defaultModel: action.payload.data.adminDefaultKey
        }
      })
      .addCase(GetAdminDefaultKey.rejected, (state, action) => ({
        ...state,
        getDefaultAdminModelLoading: false,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true
      }))
      .addCase(UpdateUserSubscriptionDetails.pending, (state) => ({
        ...state,
        success: false,
        updatingUserSubscriptionDetailsLoading: true
      }))
      .addCase(UpdateUserSubscriptionDetails.fulfilled, (state, action) => ({
        ...state,
        success: true,
        updatingUserSubscriptionDetailsLoading: false,
        userSubscriptionUpdated: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
      }))
      .addCase(UpdateUserSubscriptionDetails.rejected, (state, action) => ({
        ...state,
        updatingUserSubscriptionDetailsLoading: false,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true
      }))
      .addCase(GetCreditsHistory.pending, (state) => ({
        ...state,
        getCreditsHistoryLoading: true,
        success: false
      }))
      .addCase(GetCreditsHistory.fulfilled, (state, action) => ({
        ...state,
        success: true,
        getCreditsHistoryLoading: false,
        creditsHistory: action.payload.data.creditsHistory
      }))
      .addCase(GetCreditsHistory.rejected, (state, action) => ({
        ...state,
        getCreditsHistoryLoading: false,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        success: false,
        notify: true
      }));
  }
});

export const { SetAdminState, ResetAdminNotify } = adminSlice.actions;

export default adminSlice.reducer;