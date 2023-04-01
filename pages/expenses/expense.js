import Link from "next/link";
import Head from "next/head";
import Layout from "../../components/layout";

export default function Expense() {
  return (
    <>
      <Layout>
        <Head>
          <title>Joma Khoroch - Expense List</title>
        </Head>
        <h1>Expense List</h1>
        <h2>
          <Link href="/">Back to home</Link>
        </h2>
      </Layout>
    </>
  );
}
