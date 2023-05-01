import React from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Stack } from "@mui/system";
import ExpenseCard from "../components/expenseCard";
import ExpenseEditCard from "../components/expenseEditCard";
import { CircularProgress, Typography } from "@mui/material";
import Link from "next/link";

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [expenseList, setExpenseList] = useState();
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingList, setLoadingList] = useState(true);

  const getExpenselist = async (loading) => {
    setLoadingBalance(loadingBalance);
    setLoadingList(loadingList);
    setExpenseList([]);
    let response = await axios.get("/api/getexpenselist");
    let response2 = await axios.get("/api/getbalance");
    setExpenseList(response.data.rows);
    const newBalance = initializeBalance(response.data.rows);
    const bl = response2.data.rows[0]["current_balance"];
    setInitialBalance(bl);
    setBalance(newBalance + bl);
    setLoadingBalance(false);
    setLoadingList(false);
  };

  useEffect(() => {
    getExpenselist(true);
  }, []);

  const initializeBalance = (expenseList) => {
    let newBalance = 0;
    expenseList.map((expense) => {
      newBalance = newBalance + expense.expense;
    });
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
            <>
              {balance > 1000 ? (
                <div className="row">
                  <Link href="/insights">
                    <h1 style={{ color: "green" }}>{balance}</h1>
                  </Link>
                </div>
              ) : (
                <div className="row">
                  <Link href="/insights">
                    <h1 style={{ color: "red" }}>{balance}</h1>
                  </Link>
                </div>
              )}
            </>
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
