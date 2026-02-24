import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Triangle } from "react-loader-spinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MonthlyExpenseChart({ expenseList }) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const theme = useTheme();

  const currentMonth = dayjs().format("MMMM YYYY");
  const daysInMonth = dayjs().daysInMonth();

  useEffect(() => {
    if (!expenseList) return;

    setLoading(true);
    const startOfMonth = dayjs().startOf("month");

    // Initialize days of the month
    const dailyExpenses = new Array(daysInMonth).fill(0);
    const dailyIncome = new Array(daysInMonth).fill(0);
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    expenseList.forEach((item) => {
      const date = dayjs(item.created_date);
      if (date.isSame(startOfMonth, "month")) {
        const day = date.date() - 1;
        if (item.expense_type === "remove") {
          dailyExpenses[day] += Math.abs(Number(item.expense));
        } else {
          dailyIncome[day] += Math.abs(Number(item.expense));
        }
      }
    });

    setChartData({
      labels,
      datasets: [
        {
          fill: true,
          label: "Daily Expenses",
          data: dailyExpenses,
          borderColor: theme.palette.error.main,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom
            );
            gradient.addColorStop(0, "rgba(239, 68, 68, 0.2)");
            gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
            return gradient;
          },
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
        {
          fill: true,
          label: "Daily Income",
          data: dailyIncome,
          borderColor: theme.palette.success.main,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom
            );
            gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
            gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
            return gradient;
          },
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
      ],
    });
    setLoading(false);
  }, [expenseList, theme]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: theme.typography.fontFamily, weight: 600 },
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1e293b",
        bodyColor: "#475569",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        boxPadding: 8,
        usePointStyle: true,
        callbacks: {
          label: (context) => ` ৳${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: theme.palette.text.secondary },
      },
      y: {
        beginAtZero: true,
        grid: { borderDash: [5, 5], color: "#e2e8f0" },
        ticks: {
          callback: (value) => "৳" + value,
          font: { size: 11 },
          color: theme.palette.text.secondary,
        },
      },
    },
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        height: 400,
      }}
    >
      <CardContent
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {currentMonth} Trends
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Visualize your daily spending vs earnings
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          {loading || !chartData ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Triangle
                height="60"
                width="60"
                color={theme.palette.primary.main}
                visible={true}
              />
            </Box>
          ) : (
            <Line options={options} data={chartData} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
