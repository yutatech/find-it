import React from "react";
import { Modal as MuiModal, Box } from "@mui/material";

const Modal = ({ open, onClose, children }) => (
  <MuiModal open={open} onClose={onClose}>
    <Box>
      {children}
    </Box>
  </MuiModal>
);

export default Modal;
