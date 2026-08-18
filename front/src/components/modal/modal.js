"use client"

import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material"

const Modal = ({ open, onClose, title, children, actions }) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        width: "100%",
        maxWidth: "500px",
        borderRadius: "16px",
      },
    }}
  >
    <DialogTitle sx={{ borderBottom: "1px solid #E5E5E5" }}>{title}</DialogTitle>
    <DialogContent sx={{ py: 3 }}>{children}</DialogContent>
    <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E5E5E5" }}>{actions}</DialogActions>
  </Dialog>
)

export default Modal;
