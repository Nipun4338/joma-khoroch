import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
  } from "@mui/material";
  import dayjs from "dayjs";
  import { useEffect, useState } from "react";
  import { Triangle } from "react-loader-spinner";
  
  export default function TodayExpense(props) {
    const [todayExpense, setTodayExpense] = useState(0);
    const [loading, setLoading] = useState(true);
    const today = dayjs().format("YYYY-MM-DD");
  
    useEffect(() => {
      setLoading(true);
      let temp = 0;
      props.expenseList?.map((expense, i) => {
        dayjs(expense.created_date).format("YYYY-MM-DD") >= today &&
        dayjs(expense.created_date).format("YYYY-MM-DD") <= today &&
        expense.expense_type == "remove"
          ? (temp += expense.expense)
          : null;
      });
      setTodayExpense(temp);
      setLoading(false);
    }, []);
  
    return (
      <>
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            <Triangle
              height="80"
              width="80"
              color="#4fa94d"
              ariaLabel="triangle-loading"
              wrapperStyle={{}}
              wrapperClassName=""
              visible={true}
            />
          </div>
        ) : (
          <>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "15px",
                backgroundColor: "#E0115F"
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: "1 0 auto" }}>
                  <Typography
                    component="div"
                    variant="h5"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                  >
                    Today's Expense 🥺{" "}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography variant="h5" component="div">
                      ৳.
                    </Typography>
                  <Typography
                    color="#913831"
                    fontWeight="bolder"
                    display="flex"
                    variant="h4"
                    alignItems="center"
                    justifyContent="center"
                    margin={1}
                  >
                    {todayExpense}
                  </Typography>
                  </Stack>
                </CardContent>
              </Box>
            </Card>
          </>
        )}
      </>
    );
  }
  