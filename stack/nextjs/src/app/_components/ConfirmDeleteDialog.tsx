import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography
} from "@mui/material";
import { Warning } from "@mui/icons-material";

interface ConfirmDeleteDialogProps {
  open: boolean;
  entityName: string;
  entityType: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  entityName,
  entityType,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-delete-dialog-title"
      aria-describedby="confirm-delete-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirm-delete-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          <Warning color="warning" />
          <Typography variant="h6">Confirm Delete</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText id="confirm-delete-dialog-description">
          Are you sure you want to delete the {entityType.toLowerCase()}{" "}
          <strong>"{entityName}"</strong>?
        </DialogContentText>
        <DialogContentText sx={{ mt: 1, color: "error.main" }}>
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={onCancel}
          disabled={isDeleting}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          variant="contained"
          color="error"
          startIcon={
            isDeleting ? (
              <CircularProgress size={18} color="inherit" />
            ) : null
          }
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog; 