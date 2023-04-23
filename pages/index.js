import React from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import Balance from "../components/balance";
import { Stack } from "@mui/system";
import ExpenseCard from "../components/expenseCard";
import ExpenseEditCard from "../components/expenseEditCard";
import { CircularProgress, Typography } from "@mui/material";

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [expenseList, setExpenseList] = useState();
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [showInputBalance, setShowInputBalance] = useState(false);

  const getExpenselist = async (loading) => {
    setLoadingBalance(loadingBalance);
    setLoadingList(loadingList);
    await setExpenseList([]);
    let response = await axios.get("/api/getexpenselist");
    let response2 = await axios.get("/api/getbalance");
    await setExpenseList(response.data.rows);
    const newBalance = initializeBalance(response.data.rows);
    const bl = response2.data.rows[0]["current_balance"];
    setInitialBalance(bl);
    setBalance(newBalance + bl);
    await setLoadingBalance(false);
    await setLoadingList(false);
  };

  const reloadBalance = async (loading) => {
    setLoadingBalance(loading);
    let response2 = await axios.get("/api/getbalance");
    const newBalance = initializeBalance(expenseList);
    const bl = response2.data.rows[0]["current_balance"];
    setInitialBalance(bl);
    setBalance(newBalance + bl);
    await setLoadingBalance(false);
  };

  useEffect(() => {
    getExpenselist(true);
  }, []);

  const initializeBalance = (expenseList) => {
    let newBalance = 0;
    expenseList.map((expense) => {
      newBalance = newBalance + expense.expense;
    });
    console.log(expenseList);
    return newBalance;
  };

  const ReloadExpenseList = () => {
    return (
      <>
        {loadingList ? (
          <CircularProgress />
        ) : !expenseList ? (
          <p>No List to show</p>
        ) : (
          expenseList.map((expense, i) => {
            return (
              <ExpenseCard
                key={i}
                id={expense.expense_id}
                title={expense.expense_title}
                type={expense.expense_type}
                details={expense.expense_details}
                attention={expense.expense}
                created={expense.created_date}
                getExpenselist={getExpenselist}
              />
            );
          })
        )}
      </>
    );
  };

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
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
        <ExpenseEditCard getExpenselist={getExpenselist} />
        <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
          List of latest expenses
        </Typography>
        <ReloadExpenseList />
      </section>
    </Layout>
  );
}
