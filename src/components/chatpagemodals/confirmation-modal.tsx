import React from "react";
import { Dialog, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import styles from "../../styles/confirmation-modal.module.css";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  const handleClose = (reason: string) => {
    if (reason !== "backdropClick") {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        className: styles.dialogContent,
      }}
    >
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className={styles.cancelButton}>
          No
        </Button>
        <Button onClick={onConfirm} variant="contained" className={styles.confirmButton}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
