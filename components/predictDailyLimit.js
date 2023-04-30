import { CircularProgress, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

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
        <CircularProgress />
      ) : (
        <Typography
          variant="h5"
          component="div"
          border={5}
          borderColor="black"
          margin={2}
        >
          Today you should not spend more than 👉{" "}
          <div
            style={{
              color: "green",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid red",
            }}
          >
            ৳. {predictedDailyLimit}
          </div>
        </Typography>
      )}
    </>
  );
}
