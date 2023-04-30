import React from "react";
import Link from "next/link";
import Head from "next/head";
import Layout from "../../components/layout";
import { useEffect, useState } from "react";
import axios from "axios";
import DailyLimit from "../../components/dailyLimit";
import { CircularProgress, Stack, Typography } from "@mui/material";
import MonthlyExpenseTarget from "../../components/monthlyExpenseTarget";
import Balance from "../../components/balance";
import PredictDailyLimit from "../../components/predictDailyLimit";

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

  const ShowPredictedDailyLimit = () =>{
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
          <CircularProgress />
        ) : (
          <ShowPredictedDailyLimit />
        )}
        <Stack border={5} borderColor="violet" borderRadius={10}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <h6>Current Balance: </h6>
            <Typography variant="h5" component="div">
              ৳.
            </Typography>
            {loadingBalance ? (
              <CircularProgress />
            ) : (
              <Balance
                balance={balance}
                showInputBalance={showInputBalance}
                handleDoubleClick={() => setShowInputBalance(true)}
                setshowInputBalance={showInputBalance}
                handleBlur={() => setShowInputBalance(false)}
                reloadBalance={reloadBalance}
              />
            )}
          </Stack>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <h6>Daily Limit: </h6>
            <Typography variant="h5" component="div">
              ৳.
            </Typography>
            {loadingDailyLimit ? (
              <CircularProgress />
            ) : (
              <DailyLimit
                dailyLimit={dailyLimit}
                showInputDailyLimit={showInputDailyLimit}
                handleDoubleClick={() => setShowInputDailyLimit(true)}
                setShowInputDailyLimit={showInputDailyLimit}
                handleBlur={() => setShowInputDailyLimit(false)}
                reloadDailyLimit={reloadDailyLimit}
              />
            )}
          </Stack>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <h6>Monthly Expense Target: </h6>
            <Typography variant="h5" component="div">
              ৳.
            </Typography>
            {loadingMonthlyExpenseTarget ? (
              <CircularProgress />
            ) : (
              <MonthlyExpenseTarget
                monthlyExpenseTarget={monthlyExpenseTarget}
                showInputMonthlyExpenseTarget={showInputMonthlyExpenseTarget}
                handleDoubleClick={() => setShowInputMonthlyExpenseTarget(true)}
                setshowInputMonthlyExpenseTarget={showInputMonthlyExpenseTarget}
                handleBlur={() => setShowInputMonthlyExpenseTarget(false)}
                reloadMonthlyExpenseTarget={reloadMonthlyExpenseTarget}
              />
            )}
          </Stack>
        </Stack>
      </Layout>
    </>
  );
}
