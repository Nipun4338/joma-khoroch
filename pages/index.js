import React from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  Button,
  Grid,
  Typography,
  Box,
  Stack,
  Container,
  Paper,
} from "@mui/material";
import Link from "next/link";
import ExpenseCard from "../components/expenseCard";
import ExpenseEditCard from "../components/expenseEditCard";
import { MagnifyingGlass, ProgressBar } from "react-loader-spinner";
import ExportAsCSV from "../components/exportAsCSV";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [expenseList, setExpenseList] = useState();
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [visible, setVisible] = useState(5);
  const [loadMore, setLoadMore] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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
    const bl = Number(response2.data.rows[0]["current_balance"]);
    setInitialBalance(bl);
    setBalance(newBalance + bl);
    setLoadingBalance(false);
    setLoadingList(false);
  };

  useEffect(() => {
    if (status === "authenticated") {
      getExpenselist(true);
    }
  }, [status]);

  const initializeBalance = (expenseList) => {
    let newBalance = 0;
    expenseList?.forEach((expense) => {
      newBalance = newBalance + Number(expense.expense);
    });
    return newBalance;
  };

  const ReloadExpenseList = () => {
    return (
      <>
        {loadingList ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <ProgressBar
              height="80"
              width="80"
              borderColor="#6366f1"
              barColor="#818cf8"
            />
          </Box>
        ) : !expenseList ? (
          <Typography textAlign="center">No activities to show</Typography>
        ) : (
          <Box sx={{ mt: 4 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ px: 2, mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Activities
              </Typography>
              <ExportAsCSV expenseList={expenseList} />
            </Stack>

            <Box>
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
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              {loadMore ? (
                <MagnifyingGlass
                  visible={true}
                  height="40"
                  width="40"
                  color="#6366f1"
                />
              ) : (
                <Button
                  onClick={showMoreItems}
                  variant="outlined"
                  sx={{ borderRadius: 4, px: 4 }}
                >
                  Load More History
                </Button>
              )}
            </Box>
          </Box>
        )}
      </>
    );
  };

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
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* Hero Balance Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 6,
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            color: "white",
            textAlign: "center",
            mb: 4,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="overline"
              sx={{ opacity: 0.8, fontWeight: 700, letterSpacing: 2 }}
            >
              YOUR CURRENT BALANCE
            </Typography>

            {loadingBalance ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <ProgressBar
                  height="60"
                  width="60"
                  borderColor="#fff"
                  barColor="#fff"
                />
              </Box>
            ) : (
              <Box>
                <Typography variant="h2" sx={{ fontWeight: 900, mb: 1 }}>
                  ৳
                  {Number(balance).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                <Button
                  component={Link}
                  href="/insights"
                  variant="contained"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  }}
                >
                  View Financial Insights
                </Button>
              </Box>
            )}
          </Box>

          {/* Decorative Circles */}
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            }}
          />
        </Paper>

        <Box sx={{ mb: 4 }}>
          {loadingList ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <ProgressBar
                height="60"
                width="60"
                borderColor="#6366f1"
                barColor="#818cf8"
              />
            </Box>
          ) : (
            <ExpenseEditCard getExpenselist={getExpenselist} />
          )}
        </Box>

        <ReloadExpenseList />
      </Container>
    </Layout>
  );
}
