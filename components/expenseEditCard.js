import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { Fragment } from "react-is";
import { TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Stack } from "@mui/system";
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
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive
            onChange={handleChange}
            aria-label="Platform"
          >
            <ToggleButton
              value="add"
              sx={{ fontWeight: "bold" }}
              label="Added"
              color="success"
            >
              Added
            </ToggleButton>
            <ToggleButton
              value="remove"
              sx={{ fontWeight: "bold" }}
              label="Removed"
              color="error"
            >
              Removed
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Stack direction="column">
          <TextField
            id="standard-basic"
            label="Title"
            value={title}
            onChange={changeTitle}
            variant="standard"
          />
          <TextField
            id="outlined-number"
            label="Expense BDT"
            type="number"
            variant="standard"
            value={expense}
            onChange={changeExpense}
          />
          <TextField
            id="filled-multiline-static"
            label="Details"
            value={details}
            onChange={changeDetails}
            multiline
            rows={2}
            variant="standard"
          />
        </Stack>
        <Stack
          sx={{ margin: "10px" }}
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Button
            onClick={expenseInsert}
            variant="contained"
            sx={{ fontWeight: "bold" }}
          >
            + ADD
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
  return (
    <>
      <Box sx={{ minWidth: 275, marginBottom: "10px" }}>{card}</Box>
    </>
  );
}
