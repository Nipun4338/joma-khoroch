import React from "react";
import Link from "next/link";
import Head from "next/head";
import Layout from "../../components/layout";
import { useEffect, useState } from "react";
import axios from "axios";
import DailyLimit from "../../components/dailyLimit";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import MonthlyExpenseTarget from "../../components/monthlyExpenseTarget";
import Balance from "../../components/balance";
import PredictDailyLimit from "../../components/predictDailyLimit";
import { Dna, Triangle } from "react-loader-spinner";

export default function Insights() {
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

  const getExpenselist = async () => {
    setLoadingBalance(loadingBalance);
    setLoadingDailyLimit(loadingDailyLimit);
    setLoadingMonthlyExpenseTarget(loadingMonthlyExpenseTarget);
    setExpenseList([]);
    let response = await axios.get("/api/getexpenselist");
    let response2 = await axios.get("/api/getbalance");
    let response3 = await axios.get("/api/getDailyLimit");
    let response4 = await axios.get("/api/getMonthlyExpenseTarget");
    setExpenseList(response.data.rows);
    const newBalance = initializeBalance(response.data.rows);
    const bl = response2.data.rows[0]["current_balance"];
    setBalance(newBalance + bl);
    setDailyLimit(response3.data.rows[0]["daily_limit"]);
    setMonthlyExpenseTarget(response4.data.rows[0]["monthly_expense_target"]);
    setLoading(false);
    setLoadingBalance(false);
    setLoadingDailyLimit(false);
    setLoadingMonthlyExpenseTarget(false);
  };

  const reloadBalance = async (loading) => {
    setLoadingBalance(loading);
    let response2 = await axios.get("/api/getbalance");
    const newBalance = initializeBalance(expenseList);
    const bl = response2.data.rows[0]["current_balance"];
    setInitialBalance(bl);
    setBalance(newBalance + bl);
    setLoadingBalance(false);
  };

  const reloadDailyLimit = async (loading) => {
    setLoadingDailyLimit(loading);
    let response3 = await axios.get("/api/getDailyLimit");
    const dl = response3.data.rows[0]["daily_limit"];
    setDailyLimit(dl);
    setLoadingDailyLimit(false);
  };

  const reloadMonthlyExpenseTarget = async (loading) => {
    setLoadingMonthlyExpenseTarget(loading);
    let response4 = await axios.get("/api/getMonthlyExpenseTarget");
    setMonthlyExpenseTarget(response4.data.rows[0]["monthly_expense_target"]);
    setLoadingMonthlyExpenseTarget(false);
  };

  const initializeBalance = (expenseList) => {
    let newBalance = 0;
    expenseList.map((expense) => {
      newBalance = newBalance + expense.expense;
    });
    return newBalance;
  };

  const ShowPredictedDailyLimit = () => {
    return (
      <PredictDailyLimit
        expenseList={expenseList}
        monthlyExpenseTarget={monthlyExpenseTarget}
      />
    );
  };

  useEffect(() => {
    getExpenselist();
  }, []);

  useEffect(() => {
    ShowPredictedDailyLimit();
  }, [monthlyExpenseTarget]);

  return (
    <>
      <Layout>
        <Head>
          <title>Joma Khoroch - Insights</title>
        </Head>
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
          <ShowPredictedDailyLimit />
        )}
        <Card
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "15px",
            backgroundColor: "#93C572",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <CardContent>
              <Typography
                component="div"
                variant="h6"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                Current Balance:
              </Typography>

              {loadingBalance ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Dna
                    visible={true}
                    height="60"
                    width="60"
                    ariaLabel="dna-loading"
                    wrapperStyle={{}}
                    wrapperClass="dna-wrapper"
                  />
                </div>
              ) : (
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={1}
                >
                  <Typography variant="h5" component="div">
                    ৳.
                  </Typography>
                  <Balance
                    balance={balance}
                    showInputBalance={showInputBalance}
                    handleDoubleClick={() => setShowInputBalance(true)}
                    setshowInputBalance={showInputBalance}
                    handleBlur={() => setShowInputBalance(false)}
                    reloadBalance={reloadBalance}
                  />
                </Stack>
              )}
            </CardContent>
          </Box>
        </Card>

        <Card
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "15px",
            backgroundColor: "#93C572",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <CardContent>
              <Typography
                component="div"
                variant="h6"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                Daily Limit:
              </Typography>

              {loadingDailyLimit ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Dna
                    visible={true}
                    height="60"
                    width="60"
                    ariaLabel="dna-loading"
                    wrapperStyle={{}}
                    wrapperClass="dna-wrapper"
                  />
                </div>
              ) : (
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={1}
                >
                  <Typography variant="h5" component="div">
                    ৳.
                  </Typography>
                  <DailyLimit
                    dailyLimit={dailyLimit}
                    showInputDailyLimit={showInputDailyLimit}
                    handleDoubleClick={() => setShowInputDailyLimit(true)}
                    setShowInputDailyLimit={showInputDailyLimit}
                    handleBlur={() => setShowInputDailyLimit(false)}
                    reloadDailyLimit={reloadDailyLimit}
                  />
                </Stack>
              )}
            </CardContent>
          </Box>
        </Card>

        <Card
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "15px",
            backgroundColor: "#93C572",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <CardContent>
              <Typography
                component="div"
                variant="h6"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                Monthly Expense Target:
              </Typography>

              {loadingMonthlyExpenseTarget ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Dna
                    visible={true}
                    height="60"
                    width="60"
                    ariaLabel="dna-loading"
                    wrapperStyle={{}}
                    wrapperClass="dna-wrapper"
                  />
                </div>
              ) : (
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={1}
                >
                  <Typography variant="h5" component="div">
                    ৳.
                  </Typography>
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
                </Stack>
              )}
            </CardContent>
          </Box>
        </Card>
      </Layout>
    </>
  );
}
