import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Triangle } from "react-loader-spinner";

export default function PredictDailyLimit(props) {
  const [predictedDailyLimit, setPredictedDailyLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    label: "Analyzing",
    color: "info",
    message: "",
  });
  const [percentUsed, setPercentUsed] = useState(0);

  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD hh:mm");
  const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD hh:mm");
  const currentDay = parseInt(dayjs().date());
  const maxDay = parseInt(dayjs().endOf("month").format("DD"));

  useEffect(() => {
    setLoading(true);
    let totalSpent = 0;
    let monthlyTarget = Number(props.monthlyExpenseTarget);

    props.expenseList?.forEach((expense) => {
      const expenseDate = dayjs(expense.created_date).format(
        "YYYY-MM-DD hh:mm"
      );
      if (
        expenseDate >= startOfMonth &&
        expenseDate <= endOfMonth &&
        expense.expense_type === "remove"
      ) {
        totalSpent += Number(expense.expense);
      }
    });

    const remainingBudget = monthlyTarget - totalSpent;
    const daysRemaining = maxDay + 1 - currentDay;
    const dailyTarget = remainingBudget / daysRemaining;
    const used = (totalSpent / monthlyTarget) * 100;

    setPredictedDailyLimit(dailyTarget);
    setPercentUsed(used);

    // Smart Status Logic
    if (used > 90) {
      setStatus({
        label: "Critical",
        color: "error",
        message: "You have almost reached your monthly target!",
      });
    } else if (used > (currentDay / maxDay) * 100 + 10) {
      setStatus({
        label: "Caution",
        color: "warning",
        message: "You are spending faster than planned.",
      });
    } else {
      setStatus({
        label: "On Track",
        color: "success",
        message: "Great job! You are managing your budget well.",
      });
    }

    setLoading(false);
  }, [props.expenseList, props.monthlyExpenseTarget]);

  return (
    <Card
      sx={{
        borderRadius: 4,
        bgcolor: "primary.main",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 4, position: "relative", zIndex: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <Triangle height="60" width="60" color="white" />
          </Box>
        ) : (
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, letterSpacing: 1.5, opacity: 0.9 }}
              >
                Smart Budget Guide 💡
              </Typography>
              <Chip
                label={status.label}
                color={status.color}
                size="small"
                sx={{
                  fontWeight: 800,
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 500, opacity: 0.9, mb: 1 }}
              >
                Recommended Daily Limit:
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900 }}>
                ৳
                {Number(predictedDailyLimit).toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </Typography>
            </Box>

            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Monthly Budget Used
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {Math.round(percentUsed)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentUsed, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.2)",
                  "& .MuiLinearProgress-bar": { bgcolor: "white" },
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                opacity: 0.9,
                bgcolor: "rgba(255,255,255,0.1)",
                p: 2,
                borderRadius: 2,
              }}
            >
              "{status.message}"
            </Typography>
          </Stack>
        )}
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}
      />
    </Card>
  );
}
