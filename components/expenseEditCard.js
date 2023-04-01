import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Fragment } from "react-is";
import { Chip, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";

export default function ExpenseEditCard(props) {
    const [alignment, setAlignment] = useState('remove');

  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let dateLocal = new Date(props.created);
  const createdDate = dateLocal.toLocaleDateString("en-US", options);
  const createdTime = dateLocal.toLocaleTimeString("en-US");

  const handleChange = (data) => {
    setAlignment(data.target.value);
    console.log(data.target.value);
  };

  const card = (
    <Fragment>
      <CardContent>
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive
            onChange={handleChange}
            aria-label="Platform"
            >
            <ToggleButton value="add" sx={{ fontWeight: "bold" }} label="Added" color="success">Added</ToggleButton>
            <ToggleButton value="remove" sx={{ fontWeight: "bold" }} label="Removed" color="error">Removed</ToggleButton>
            </ToggleButtonGroup>
        </Stack>
        <Stack direction="column">
        <TextField id="standard-basic" label="Title" variant="standard" />
        <TextField
          id="outlined-number"
          label="Expense BDT"
          type="number"
          variant="standard"
        />
        <TextField
          id="filled-multiline-static"
          label="Details"
          multiline
          rows={4}
          variant="standard"
        />
        </Stack>
        <Stack sx={{margin: "10px"}} direction="row" justifyContent="flex-end" alignItems="center">
        <Button variant="contained" sx={{fontWeight: "bold"}}>+ ADD</Button>
        </Stack>
      </CardContent>
    </Fragment>
  );
  return (
    <>
      <Box sx={{ minWidth: 275, marginBottom: "10px" }}>
        <Card variant="outlined">{card}</Card>
      </Box>
    </>
  );
}
