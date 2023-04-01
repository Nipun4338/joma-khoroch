import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import axios from "axios";
import { useEffect, useState } from "react";

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
        <p>Current Balance: {balance}</p>
        <button onClick={()=>{setBalance(balance+8);}}>Click</button>
      </section>
    </Layout>
  );
}
