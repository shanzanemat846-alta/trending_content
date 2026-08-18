import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { invoiceRoute } from 'src/utils/APIRoutes';

import { AxiosBaseUrl } from '../config/axios-configuration';

import { HandleCatchBlock } from '../helpers';

import { ENDPOINTS } from '../../../utils/constants';

const axios = AxiosBaseUrl();

const initialState = {
  error: '',
  message: '',
  getInvoiceLoading: false,
  success: false,
  notifyMessage: '',
  notify: false,
  notifyType: '',
  invoiceData: []
};

export const GetInvoices = createAsyncThunk(
  'GET_INVOICES',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;
      const response = await axios.get(`${invoiceRoute}${ENDPOINTS.INVOICE.GET_INVOICES(userId)}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DownloadInvoice = createAsyncThunk(
  'DOWNLOAD_INVOICE',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;
      const url = `${invoiceRoute}${ENDPOINTS.INVOICE.DOWNLOAD_INVOICE(userId)}`;

      console.log('\n\n url: ', url);

      window.open(url, '_blank');

      return 0;

    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const invoice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    SetInvoiceState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    ResetInvoiceNotify(state) {
      state.notify = false;
      state.notifyMessage = '';
      state.notifyType = 'error';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetInvoices.pending, (state) => ({
        ...state,
        success: false,
        getInvoiceLoading: true,
      }))
      .addCase(GetInvoices.fulfilled, (state, action) => ({
        ...state,
        getInvoiceLoading: false,
        success: true,
        invoiceData: action.payload.data.invoicesList
      }))
      .addCase(GetInvoices.rejected, (state, action) => ({
        ...state,
        getInvoiceLoading: false,
        success: false,
        error: action.payload.error,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        notify: true,
      }))
      .addCase(DownloadInvoice.pending, (state) => ({
        ...state,
        success: false
      }))
      .addCase(DownloadInvoice.fulfilled, (state, action) => ({
        ...state,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true
      }))
      .addCase(DownloadInvoice.rejected, (state, action) => ({
        ...state,
        success: false,
        error: action.payload.error,
        notifyMessage: action.payload.error,
        notifyType: 'error',
        notify: true
      }));
  }
});

const { reducer, actions } = invoice;

export const { SetInvoiceState, ResetInvoiceNotify } = actions;

export default reducer;
