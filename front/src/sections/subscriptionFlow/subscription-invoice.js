"use client"

import { useState, useCallback, useEffect } from 'react';
import { isEmpty, startCase } from 'lodash';
import moment from 'moment';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download";
import { Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import IconButton from '@mui/material/IconButton';

import { useAuthContext } from 'src/auth/hooks';
import { useAppDispatch, useAppSelector } from "src/app/lib/hooks";

import { useSnackbar } from 'src/components/snackbar';

import {
  DownloadInvoice,
  GetInvoices,
  ResetInvoiceNotify
} from 'src/app/lib/slices/invoice-slice';

import { LoadingScreen } from "src/components/loading-screen";

export default function Invoices({ user_id, admin}) {
  const { enqueueSnackbar } = useSnackbar();
  const { user: { _id: userId } } = useAuthContext();
  const dispatch = useAppDispatch();

  const {
    getInvoiceLoading,
    notify: invoiceNotify,
    notifyMessage: invoiceNotifyMessage,
    notifyType: invoiceNotifyType,
    invoiceData
  } = useAppSelector((state) => state.invoice);

  const [invoiceTableData, setInvoiceTableData] = useState([]);

  const fetchInvoices = () => {
    if (user_id) {
      dispatch(GetInvoices({ userId: user_id }))
    } else {
      dispatch(GetInvoices({ userId }));
    }
  }

  useEffect(() => {
    if (invoiceData.length) {
      setInvoiceTableData(invoiceData);
    } else {
      setInvoiceTableData([]);
    }
  }, [invoiceData]);

  useEffect(() => {
    if (invoiceNotify && !isEmpty(invoiceNotifyMessage)) {
      enqueueSnackbar(invoiceNotifyMessage, { variant: invoiceNotifyType });
      dispatch(ResetInvoiceNotify());
    }
  }, [invoiceNotify, invoiceNotifyMessage, invoiceNotifyType]);

  useEffect(() => {
    if (userId) fetchInvoices();
  }, [userId, user_id]);

  const renderDateRange = (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
      <DatePicker label="Start date" />
      <DatePicker label="End date" />
    </Stack>
  );


  return (
    // <Paper sx={{
    //   // p: 3,
    //   // mb: 2,
    //   // borderRadius: 4,
    //   // bgcolor: "#f6faf9",
    // }}>
    <Box sx={{width:'100%'}}>
      <Box display="flex" justifyContent="space-between" mb={2}>
      {!admin && (
          <Typography variant="h6" gutterBottom>
            Invoices
          </Typography>
      )}
        {/* {renderDateRange} */}
        <Button
          variant="outlined"
          color="primary"
          sx={{
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent',
            },
            gap: '8px',
            marginRight: '16px',
            marginLeft: admin ? 'auto' : '0'
          }}
          onClick={() => dispatch(DownloadInvoice({ userId: user_id || userId }))}
          disabled={invoiceData.length === 0}
        >
          <DownloadIcon />
          <Typography variant="body2" sx={{ color: 'black' }}>
            Download
          </Typography>
        </Button>
      </Box>
      
      <Paper sx={{ position: "relative" }}>
        {admin && getInvoiceLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 9999,
            }}
          >
            <LoadingScreen />
          </Box>
        )}
      
      <TableContainer sx={{ overflow: "auto", width: '100%', backgroundColor: "white", display: "flex", flexDirection: "column" }}>  
        <Table sx={{width:'100%'}} stickyHeader overflow="auto">
          <TableHead>
          <TableRow sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
              <TableCell>Date</TableCell>
              <TableCell sx={{whiteSpace: 'nowrap'}}>Payment Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceTableData.length > 0 ? (
              invoiceTableData.map((invoice) => (
                <TableRow key={invoice._id}>
                  <TableCell>{invoice.createdAt ? moment(invoice.createdAt).format('MM-DD-YYYY'): '--'}</TableCell>
                  <TableCell> {invoice.paymentType === 'subscription' ? `${startCase(invoice.subscriptionPlan)} / ${startCase(invoice.subscriptionType)}` : 'Token Purchase'}</TableCell>
                  <TableCell>{invoice.amount ? invoice.amount.toFixed(2) : '--'}</TableCell>
                  <TableCell>{invoice.currency || '--'}</TableCell>
                  <TableCell>{invoice.status || '--'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No Invoices Found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
    </Box>
  )
}

