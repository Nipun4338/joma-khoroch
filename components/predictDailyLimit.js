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

export default function PredictDailyLimit(props) {
  const [tempExpense, setTempExpense] = useState(0);
  const [predictedDailyLimit, setPredictedDailyLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD hh:mm");
  const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD hh:mm");
  const currentDay = parseInt(dayjs().date());
  const maxDay = parseInt(dayjs().endOf("month").format("DD"));

  useEffect(() => {
    setLoading(true);
    let temp = 0;
    let monthlyExpenseTarget = props.monthlyExpenseTarget;
    props.expenseList?.map((expense, i) => {
      dayjs(expense.created_date).format("YYYY-MM-DD hh:mm") >= startOfMonth &&
      dayjs(expense.created_date).format("YYYY-MM-DD hh:mm") <= endOfMonth &&
      expense.expense_type == "remove"
        ? (temp += expense.expense)
        : null;
    });
    temp += monthlyExpenseTarget;
    temp = temp / (maxDay + 1 - currentDay);
    setPredictedDailyLimit(temp);
    setTempExpense(temp);
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
              backgroundColor: "#93C572"
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
                  Today you shouldn't spend more than 👉{" "}
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
                  color="green"
                  fontWeight="bolder"
                  display="flex"
                  variant="h4"
                  alignItems="center"
                  justifyContent="center"
                  margin={1}
                >
                  {Math.round(predictedDailyLimit * 100) / 100}
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
