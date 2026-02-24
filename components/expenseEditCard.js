import {
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Box,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";

export default function ExpenseEditCard(props) {
  const [alignment, setAlignment] = useState("remove");
  const [title, setTitle] = useState("");
  const [expense, setExpense] = useState("");
  const [details, setDetails] = useState("");

  const expenseInsertCall = (data) => {
    axios
      .post("/api/insertexpense", data)
      .then(async (response) => {
        setExpense("");
        setTitle("");
        setDetails("");
        await props.getExpenselist(false);
      })
      .catch((e) => {});
  };

  const expenseInsert = () => {
    let ex = expense;
    alignment == "remove" ? (ex = ex * -1) : null;
    let data = {
      title: title,
      expense: ex,
      details: details,
      type: alignment,
    };
    if (data.title && data.expense && data.details) {
      expenseInsertCall(data);
    }
  };

  const handleChange = (data) => {
    setAlignment(data.target.value);
  };

  const changeExpense = (data) => {
    setExpense(data.target.value);
  };

  const changeTitle = (data) => {
    setTitle(data.target.value);
  };

  const changeDetails = (data) => {
    setDetails(data.target.value);
  };

  const card = (
    <Card
      sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid #e2e8f0" }}
    >
      <Box sx={{ bgcolor: "background.paper", p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            New Activity
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive
            onChange={handleChange}
            size="small"
            sx={{
              bgcolor: "#f1f5f9",
              p: 0.5,
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: 1.5,
                fontWeight: 700,
                px: 2,
                "&.Mui-selected": {
                  bgcolor: "white",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  color: alignment === "add" ? "success.main" : "error.main",
                  "&:hover": { bgcolor: "white" },
                },
              },
            }}
          >
            <ToggleButton value="add">Income</ToggleButton>
            <ToggleButton value="remove">Expense</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="What is this for?"
            placeholder="e.g. Salary, Grocery, Rent"
            value={title}
            onChange={changeTitle}
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            label="Amount (BDT)"
            type="number"
            value={expense}
            onChange={changeExpense}
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            label="Additional Details"
            placeholder="N/A"
            value={details}
            onChange={changeDetails}
            multiline
            rows={2}
            variant="outlined"
            size="small"
          />
        </Stack>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={expenseInsert}
            variant="contained"
            disableElevation
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Save Transaction
          </Button>
        </Box>
      </Box>
    </Card>
  );
  return (
    <>
      <Box sx={{ minWidth: 275, marginBottom: "10px" }}>{card}</Box>
    </>
  );
}
