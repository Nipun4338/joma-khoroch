import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Fragment } from "react-is";
import { Chip } from "@mui/material";
import { Stack } from "@mui/system";

export default function ExpenseCard(props) {
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let dateLocal = new Date(props.created);
  const createdDate = dateLocal.toLocaleDateString("en-US", options);
  const createdTime = dateLocal.toLocaleTimeString("en-US");

  const card = (
    <Fragment>
      <CardContent>
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          {props.type == "add" ? (
            <Chip sx={{ fontWeight: "bold" }} label="Added" color="success" />
          ) : (
            <Chip sx={{ fontWeight: "bold" }} label="Removed" color="error" />
          )}
        </Stack>
        <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
          {props.title}
        </Typography>
        <Typography variant="h5" component="div">
          {props.type == "add" ? +props.attention : -props.attention}
        </Typography>
        <Typography sx={{ mb: 1.2, fontSize: 13 }} color="text.secondary">
          {createdDate} at {createdTime}
        </Typography>
        <Typography variant="body2">{props.details}</Typography>
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
