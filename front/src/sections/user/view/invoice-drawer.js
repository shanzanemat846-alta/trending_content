"use client"

import { useEffect } from "react"

import { Box, Drawer, IconButton, Typography, Divider } from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"

import { useAppSelector } from "src/app/lib/hooks";

import Invoices from 'src/sections/subscriptionFlow/subscription-invoice';

export function InvoiceDrawer({ open, onClose, userId }) {

  const { getInvoiceLoading } = useAppSelector((state) => state.invoice);
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 600 }, padding: 3 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">User Invoices</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* <Box sx={{ height: "calc(100% - 80px)", overflow: "auto" }}> */}
       <Invoices user_id={userId} admin />
      {/* </Box> */}
    </Drawer>
  )
}

