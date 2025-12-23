import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";

export default function ExpenseCard(props) {
  const { id, title, type, details, attention, created, getExpenselist } =
    props;

  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let dateLocal = new Date(created);
  const createdDate = dateLocal.toLocaleDateString("en-US", options);
  const createdTime = dateLocal.toLocaleTimeString("en-US");

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const expenseDelete = () => {
    let data = {
      id: id,
    };
    axios
      .post("/api/deleteexpense", data)
      .then(async (response) => {
        handleClose();
        await getExpenselist(false);
      })
      .catch((e) => {
        console.error("Error deleting expense:", e);
      });
  };

  return (
    <>
      <Card
        sx={{
          margin: "15px",
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <Box sx={{ minWidth: 275, p: 1 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {createdDate} • {createdTime}
                </Typography>
              </Box>
              <Chip
                sx={{
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  height: 24,
                  textTransform: "uppercase",
                }}
                label={type == "add" ? "Added" : "Expense"}
                color={type == "add" ? "success" : "error"}
              />
            </Stack>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: type === "add" ? "success.main" : "error.main",
                mb: 1,
              }}
            >
              {type === "add" ? "+" : "-"}৳
              {Math.abs(Number(attention)).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {details}
            </Typography>

            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
            >
              <Button
                onClick={handleClickOpen}
                variant="outlined"
                color="error"
                size="small"
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                Remove
              </Button>
            </Stack>
          </CardContent>
        </Box>
      </Card>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 800 }}>
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this entry? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={handleClose}
            color="inherit"
            sx={{ fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={expenseDelete}
            color="error"
            variant="contained"
            autoFocus
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
