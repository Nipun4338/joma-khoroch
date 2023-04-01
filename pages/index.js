import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import Balance from "../components/balance";
import { Stack } from "@mui/system";
import ExpenseCard from "../components/expenseCard";

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [expenseList, setExpenseList] = useState();

  useEffect(() => {
    axios
      .get("/api/getbalance")
      .then((response) => {
        setBalance(response.data.rows[0]["current_balance"]);
      })
      .catch((e) => {
        console.log(e);
      });

    axios
      .get("/api/getexpenselist")
      .then((response) => {
        setExpenseList(response.data.rows);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [setBalance]);

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
          <Balance balance={balance} />
          <h3>/=</h3>
        </Stack>
        {expenseList?.map((expense, i)=>{
          return <ExpenseCard key={i} title={expense.expense_title} type={expense.expense_type}  details={expense.expense_details} attention={expense.expense} created={expense.created_date} />
        })}
        <button
          onClick={() => {
            setBalance(balance + 8);
          }}
        >
          Click
        </button>
      </section>
    </Layout>
  );
}
