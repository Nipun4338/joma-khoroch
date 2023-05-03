import Head from "next/head";
import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import { Stack } from "@mui/system";
import { Button, Typography } from "@mui/material";
import { useSession, signIn, signOut } from "next-auth/react";

const name = "Joma Khoroch";
export const siteTitle = "Joma Khoroch";

export default function Layout({ children, home }) {
  const { data: session, status } = useSession();

  console.log(status);

  if (status === "authenticated") {
    return (
      <div className={styles.container}>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content="An app to store debit and credit" />
          <meta name="og:title" content={siteTitle} />
        </Head>
        <header className={styles.header}>
          {home ? (
            <>
              <h1 className={utilStyles.heading2Xl}>{name}</h1>
            </>
          ) : (
            <>
              <h2 className={utilStyles.headingLg}>
                <Link href="/" className={utilStyles.colorInherit}>
                  {name}
                </Link>
              </h2>
            </>
          )}
        </header>
        <main>{children}</main>
        {!home && (
          <div className={styles.backToHome}>
            <Link href="/">← Back to home</Link>
          </div>
        )}
        <section className="grid h-screen place-items-center">
          <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            {/* <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Hello {session?.user?.name}</h2><br />
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">You are an admin user currently signed in as {session?.user?.email}.</p> */}
            <Button
              variant="contained"
              sx={{ fontWeight: "bold" }}
              onClick={() => signOut()}
            >
              Logout
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="An app to store debit and credit" />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <header className={styles.header}>
        <Stack
          border={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <div
            style={{
              margin: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography>
              You are currently not authenticated. Click the login button to get
              started!
            </Typography>
            <Button
              variant="contained"
              sx={{ fontWeight: "bold" }}
              onClick={() => signIn()}
              style={{ marginLeft: "10px" }}
            >
              Login
            </Button>
          </div>
        </Stack>
      </header>
    </div>
  );
}
