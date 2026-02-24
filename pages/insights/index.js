import React from "react";
import Link from "next/link";
import Head from "next/head";
import Layout from "../../components/layout";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import DailyLimit from "../../components/dailyLimit";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Container,
  Grid,
  Paper,
  LinearProgress,
} from "@mui/material";
import MonthlyExpenseTarget from "../../components/monthlyExpenseTarget";
import Balance from "../../components/balance";
import PredictDailyLimit from "../../components/predictDailyLimit";
import { Dna, Triangle, ProgressBar } from "react-loader-spinner";
import TodayExpense from "../../components/todayExpense";
import MonthlyExpenseChart from "../../components/MonthlyExpenseChart";
import dayjs from "dayjs";

const StatCard = ({
  title,
  loading,
  component,
  color = "primary.main",
  emoji,
  subtitle,
}) => (
  <Card
    sx={{
      borderRadius: 4,
      height: "100%",
      border: "1px solid #e2e8f0",
      boxShadow: "none",
      "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
      transition: "all 0.2s",
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 700, letterSpacing: 1 }}
        >
          {title}
        </Typography>
        <Typography variant="h5">{emoji}</Typography>
      </Stack>
      <Box>
        {loading ? (
          <ProgressBar
            height="40"
            width="40"
            borderColor="#6366f1"
            barColor="#818cf8"
          />
        ) : (
          <>
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography
                variant="h6"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                ৳
              </Typography>
              <Box
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: color,
                  },
                }}
              >
                {component}
              </Box>
            </Stack>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </Box>
    </CardContent>
  </Card>
);

const ShowPredictedDailyLimit = ({ expenseList, monthlyExpenseTarget }) => {
  return (
    <PredictDailyLimit
      expenseList={expenseList}
      monthlyExpenseTarget={monthlyExpenseTarget}
    />
  );
};

export default function Insights() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 1. Declare all State first
  const [balance, setBalance] = useState(0);
  const [expenseList, setExpenseList] = useState();
  const [dailyLimit, setDailyLimit] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [showInputBalance, setShowInputBalance] = useState(false);
  const [monthlyExpenseTarget, setMonthlyExpenseTarget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInputDailyLimit, setShowInputDailyLimit] = useState(false);
  const [showInputMonthlyExpenseTarget, setShowInputMonthlyExpenseTarget] =
    useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingDailyLimit, setLoadingDailyLimit] = useState(true);
  const [loadingMonthlyExpenseTarget, setLoadingMonthlyExpenseTarget] =
    useState(true);

  // 2. Then declare Memoized values
  const SpendingBreakdown = useMemo(() => {
    if (!expenseList) return [];
    const groups = {};
    expenseList.forEach((ex) => {
      if (ex.expense_type === "remove") {
        const title = (ex.expense_title || "Other").split(" ")[0].toLowerCase();
        groups[title] = (groups[title] || 0) + Math.abs(Number(ex.expense));
      }
    });
    return Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [expenseList]);

  const Projection = useMemo(() => {
    if (!expenseList || !monthlyExpenseTarget) return 0;
    const currentDay = dayjs().date();
    const daysInMonth = dayjs().daysInMonth();
    let spentThisMonth = 0;
    expenseList.forEach((ex) => {
      if (
        ex.expense_type === "remove" &&
        dayjs(ex.created_date).isSame(dayjs(), "month")
      ) {
        spentThisMonth += Math.abs(Number(ex.expense));
      }
    });
    const dailyAvg = spentThisMonth / currentDay;
    return (dailyAvg * daysInMonth).toFixed(2);
  }, [expenseList, monthlyExpenseTarget]);

  const getExpenselist = async () => {
    setLoadingBalance(true);
    setLoadingDailyLimit(true);
    setLoadingMonthlyExpenseTarget(true);
    try {
      let response = await axios.get("/api/getexpenselist");
      let response2 = await axios.get("/api/getbalance");
      let response3 = await axios.get("/api/getDailyLimit");
      let response4 = await axios.get("/api/getMonthlyExpenseTarget");

      setExpenseList(response.data.rows);
      const newBalance = initializeBalance(response.data.rows);
      const bl = Number(response2.data.rows[0]["current_balance"]);
      setBalance(newBalance + bl);
      setDailyLimit(Number(response3.data.rows[0]["daily_limit"]));
      setMonthlyExpenseTarget(
        Number(response4.data.rows[0]["monthly_expense_target"])
      );
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
      setLoadingBalance(false);
      setLoadingDailyLimit(false);
      setLoadingMonthlyExpenseTarget(false);
    }
  };

  const reloadBalance = async (loading) => {
    setLoadingBalance(loading);
    let response2 = await axios.get("/api/getbalance");
    const newBalance = initializeBalance(expenseList);
    const bl = Number(response2.data.rows[0]["current_balance"]);
    setInitialBalance(bl);
    setBalance(newBalance + bl);
    setLoadingBalance(false);
  };

  const reloadDailyLimit = async (loading) => {
    setLoadingDailyLimit(loading);
    let response3 = await axios.get("/api/getDailyLimit");
    const dl = Number(response3.data.rows[0]["daily_limit"]);
    setDailyLimit(dl);
    setLoadingDailyLimit(false);
  };

  const reloadMonthlyExpenseTarget = async (loading) => {
    setLoadingMonthlyExpenseTarget(loading);
    let response4 = await axios.get("/api/getMonthlyExpenseTarget");
    setMonthlyExpenseTarget(
      Number(response4.data.rows[0]["monthly_expense_target"])
    );
    setLoadingMonthlyExpenseTarget(false);
  };

  const initializeBalance = (expenseList) => {
    let newBalance = 0;
    expenseList?.forEach((expense) => {
      newBalance = newBalance + Number(expense.expense);
    });
    return newBalance;
  };

  useEffect(() => {
    if (status === "authenticated") {
      getExpenselist();
    }
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ProgressBar
          height="100"
          width="100"
          borderColor="#6366f1"
          barColor="#818cf8"
        />
      </Box>
    );
  }

  if (!session) return null;

  return (
    <Layout>
      <Head>
        <title>Financial Insights | Joma Khoroch</title>
      </Head>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
          Financial Insights
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <Triangle height="100" width="100" color="#6366f1" visible={true} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Main Predictions */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <ShowPredictedDailyLimit
                  expenseList={expenseList}
                  monthlyExpenseTarget={monthlyExpenseTarget}
                />
              </Box>

              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  mb: 3,
                  border: "1px solid #e2e8f0",
                }}
                elevation={0}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  Spending Trends
                </Typography>
                <MonthlyExpenseChart expenseList={expenseList} />
              </Paper>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{ p: 3, borderRadius: 4, border: "1px solid #e2e8f0" }}
                    elevation={0}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      🏷️ Top Categories
                    </Typography>
                    <Stack spacing={2}>
                      {SpendingBreakdown.length > 0 ? (
                        SpendingBreakdown.map(([cat, val]) => (
                          <Box key={cat}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  textTransform: "capitalize",
                                  fontWeight: 600,
                                }}
                              >
                                {cat}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700 }}
                              >
                                ৳{val.toLocaleString()}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={
                                (val /
                                  Math.max(
                                    ...SpendingBreakdown.map((b) => b[1])
                                  )) *
                                100
                              }
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: "#f1f5f9",
                                "& .MuiLinearProgress-bar": { borderRadius: 3 },
                              }}
                            />
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No data available yet
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: "1px solid #e2e8f0",
                      bgcolor: "primary.dark",
                      color: "white",
                    }}
                    elevation={0}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, mb: 1 }}
                    >
                      🔮 Month-End Forecast
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.8, display: "block", mb: 2 }}
                    >
                      Based on your current spending velocity
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                      ৳{Number(Projection).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {Number(Projection) > monthlyExpenseTarget
                        ? "⚠️ Above Target"
                        : "✅ Within Target"}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            {/* Sidebar Stats */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Box>
                  <TodayExpense expenseList={expenseList} />
                </Box>

                <StatCard
                  title="Current Balance"
                  emoji="💰"
                  loading={loadingBalance}
                  component={
                    <Balance
                      balance={balance}
                      showInputBalance={showInputBalance}
                      handleDoubleClick={() => setShowInputBalance(true)}
                      setshowInputBalance={showInputBalance}
                      handleBlur={() => setShowInputBalance(false)}
                      reloadBalance={reloadBalance}
                    />
                  }
                />

                <StatCard
                  title="Daily Spending Limit"
                  emoji="🎯"
                  loading={loadingDailyLimit}
                  component={
                    <DailyLimit
                      dailyLimit={dailyLimit}
                      showInputDailyLimit={showInputDailyLimit}
                      handleDoubleClick={() => setShowInputDailyLimit(true)}
                      setShowInputDailyLimit={showInputDailyLimit}
                      handleBlur={() => setShowInputDailyLimit(false)}
                      reloadDailyLimit={reloadDailyLimit}
                    />
                  }
                />

                <StatCard
                  title="Monthly Target"
                  emoji="📉"
                  loading={loadingMonthlyExpenseTarget}
                  component={
                    <MonthlyExpenseTarget
                      monthlyExpenseTarget={monthlyExpenseTarget}
                      showInputMonthlyExpenseTarget={
                        showInputMonthlyExpenseTarget
                      }
                      handleDoubleClick={() =>
                        setShowInputMonthlyExpenseTarget(true)
                      }
                      setshowInputMonthlyExpenseTarget={
                        showInputMonthlyExpenseTarget
                      }
                      handleBlur={() => setShowInputMonthlyExpenseTarget(false)}
                      reloadMonthlyExpenseTarget={reloadMonthlyExpenseTarget}
                    />
                  }
                />
              </Stack>
            </Grid>
          </Grid>
        )}
      </Container>
    </Layout>
  );
}
