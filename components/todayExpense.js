import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
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
    props.expenseList?.forEach((expense, i) => {
      const expenseDate = dayjs(expense.created_date).format("YYYY-MM-DD");
      if (expenseDate === today && expense.expense_type === "remove") {
        temp += Number(expense.expense);
      }
    });
    setTodayExpense(temp);
    setLoading(false);
  }, [props.expenseList]);

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
              margin: "15px",
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ p: 2 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 700, letterSpacing: 1 }}
                >
                  Today's Spending 🥺
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="baseline"
                  spacing={1}
                  sx={{ mt: 1 }}
                >
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    ৳
                  </Typography>
                  <Typography
                    sx={{
                      color: "error.main",
                      fontWeight: 900,
                      fontSize: "2.5rem",
                    }}
                  >
                    {Number(Math.abs(todayExpense)).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
