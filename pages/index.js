import React from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Stack } from "@mui/system";
import ExpenseCard from "../components/expenseCard";
import ExpenseEditCard from "../components/expenseEditCard";
import { Button, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { MagnifyingGlass, ProgressBar } from "react-loader-spinner";
import ExportAsCSV from "../components/exportAsCSV";

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [expenseList, setExpenseList] = useState();
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [visible, setVisible] = useState(5);
  const [loadMore, setLoadMore] = useState(false);

  const showMoreItems = async () => {
    setLoadMore(true);
    setVisible((prevValue) => prevValue + 5);
    setLoadMore(false);
  };

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            <ProgressBar
              height="80"
              width="80"
              ariaLabel="progress-bar-loading"
              wrapperStyle={{}}
              wrapperClass="progress-bar-wrapper"
              borderColor="#F4442E"
              barColor="#51E5FF"
            />
          </div>
        ) : !expenseList ? (
          <p>No List to show</p>
        ) : (
          <>
            <Grid
              container
              rowSpacing={1}
              columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            >
              <Grid item xs={6}>
                <Typography
                  sx={{ fontSize: 18 }}
                  color="text.secondary"
                  gutterBottom
                >
                  List of latest expenses
                </Typography>
              </Grid>
              <Grid
                item
                xs={6}
                display="flex"
                alignItems="flex-end"
                justifyContent="flex-end"
              >
                <ExportAsCSV expenseList={expenseList} />
              </Grid>
            </Grid>
            {expenseList?.slice(0, visible).map((expense, i) => {
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
            })}
            <div>
              {loadMore ? (
                <MagnifyingGlass
                  visible={true}
                  height="80"
                  width="80"
                  ariaLabel="MagnifyingGlass-loading"
                  wrapperStyle={{}}
                  wrapperClass="MagnifyingGlass-wrapper"
                  glassColor="#c0efff"
                  color="#e15b64"
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "10px"
                  }}
                >
                  <Button onClick={showMoreItems}>Load More</Button>
                </div>
              )}
            </div>
          </>
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
            <MagnifyingGlass
              visible={true}
              height="80"
              width="80"
              ariaLabel="MagnifyingGlass-loading"
              wrapperStyle={{}}
              wrapperClass="MagnifyingGlass-wrapper"
              glassColor="#c0efff"
              color="#e15b64"
            />
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
        {loadingList ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            <ProgressBar
              height="80"
              width="80"
              ariaLabel="progress-bar-loading"
              wrapperStyle={{}}
              wrapperClass="progress-bar-wrapper"
              borderColor="#F4442E"
              barColor="#51E5FF"
            />
          </div>
        ) : (
          <ExpenseEditCard getExpenselist={getExpenselist} />
        )}
        <ReloadExpenseList />
      </section>
    </Layout>
  );
}
