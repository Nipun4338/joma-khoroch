import Head from "next/head";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export const siteTitle = "Joma Khoroch";

export default function Layout({ children, home }) {
  const { data: session, status } = useSession();

  return (
    <Box
      sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}
    >
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Personal Finance Manager - Joma Khoroch"
        />
        <meta name="og:title" content={siteTitle} />
      </Head>

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e2e8f0",
          color: "text.primary",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Box
                component={Link}
                href="/"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textDecoration: "none",
                  color: "primary.main",
                }}
              >
                <AccountBalanceWalletIcon color="primary" />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, letterSpacing: -0.5 }}
                >
                  JOMA KHOROCH
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                sx={{ display: { xs: "none", md: "flex" } }}
              >
                <Button
                  component={Link}
                  href="/"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  component={Link}
                  href="/insights"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  Insights
                </Button>
              </Stack>
            </Box>

            {status === "authenticated" ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    display: { xs: "none", sm: "block" },
                    textAlign: "right",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ display: "block", fontWeight: 700, opacity: 0.6 }}
                  >
                    SIGNED IN AS
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {session?.user?.email}
                  </Typography>
                </Box>
                <Tooltip title="Log Out">
                  <IconButton
                    onClick={() => signOut()}
                    color="primary"
                    sx={{
                      bgcolor: "rgba(99, 102, 241, 0.1)",
                      "&:hover": { bgcolor: "rgba(99, 102, 241, 0.2)" },
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            ) : (
              <Button
                component={Link}
                href="/auth/signin"
                variant="contained"
                size="small"
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Sign In
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <main style={{ paddingBottom: "40px" }}>{children}</main>
    </Box>
  );
}
