import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import Balance from "../components/balance";
import { Stack } from "@mui/system";

export default function Home() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    axios
      .get("/api/get")
      .then((response) => {
        setBalance(response.data.rows[0]["current_balance"]);
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
