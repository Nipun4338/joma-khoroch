import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Fragment } from "react-is";
import { Button, Chip, CircularProgress } from "@mui/material";
import { Stack } from "@mui/system";
import axios from "axios";
import { useState, useEffect } from "react";

export default function ExpenseCard(props) {
  const [prop, setProp] = useState(props);
  const [loading, setLoading] = useState(true);

  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let dateLocal = new Date(props.created);
  const createdDate = dateLocal.toLocaleDateString("en-US", options);
  const createdTime = dateLocal.toLocaleTimeString("en-US");

  useEffect(() => {
    setProp(props);
    setLoading(false);
  }, [setProp]);

  const expenseDelete = () => {
    let data = {
      id: prop.id,
    };
    axios
      .post("/api/deleteexpense", data)
      .then(async (response) => {
        await props.getExpenselist(false);
        //push("/");
        //window.location.reload(true);
      })
      .catch((e) => {});
  };

  return (
    <>
      <Box sx={{ minWidth: 275, marginBottom: "10px" }}>
        <Card variant="outlined">
          <Fragment>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
              >
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Chip
                    sx={{ fontWeight: "bold" }}
                    label={prop.type == "add" ? "Added" : "Removed"}
                    color={prop.type == "add" ? "success" : "error"}
                  />
                )}
              </Stack>
              <Typography
                sx={{ fontSize: 18 }}
                color="text.secondary"
                gutterBottom
              >
                {prop.title}
              </Typography>
              <Typography variant="h5" component="div">
                ৳. {prop.attention}
              </Typography>
              <Typography sx={{ mb: 1.2, fontSize: 13 }} color="text.secondary">
                {createdDate} at {createdTime}
              </Typography>
              <Typography variant="body2">{prop.details}</Typography>
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
              >
                <Button
                  onClick={expenseDelete}
                  variant="contained"
                  sx={{ fontWeight: "bold", backgroundColor: "red" }}
                >
                  DELETE
                </Button>
              </Stack>
            </CardContent>
          </Fragment>
        </Card>
      </Box>
    </>
  );
}
