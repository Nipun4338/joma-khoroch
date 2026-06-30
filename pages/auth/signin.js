import { useRef } from "react";
import { getProviders, getSession, signIn } from "next-auth/react";
import {
  Button,
  Input,
  Card,
  CardContent,
  Typography,
  Box,
  Label,
} from "@mui/material";
import { Stack } from "@mui/system";

import { TextField, Container, Paper, Divider } from "@mui/material";

// Inline Google "G" mark so we don't pull in an extra icon dependency.
const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 43.5c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 34.5 26.7 35.5 24 35.5c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39 16.2 43.5 24 43.5z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.3 5.3C41.2 36.2 43.5 30.6 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);

const Signin = ({ providers }) => {
  const email = useRef("");
  const password = useRef("");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        padding: "20px",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 6,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
          }}
        >
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, mb: 1, color: "primary.main" }}
            >
              Joma Khoroch
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Welcome back! Please enter your details.
            </Typography>
          </Box>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              signIn("credentials", {
                email: email.current,
                password: password.current,
              });
            }}
          >
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                variant="outlined"
                onChange={(e) => (email.current = e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                onChange={(e) => (password.current = e.target.value)}
                required
              />
              <Button
                variant="contained"
                type="submit"
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: "1rem",
                  fontWeight: 800,
                  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
                }}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          {providers?.google ? (
            <>
              <Divider sx={{ my: 3, color: "text.secondary", fontSize: 13 }}>
                or
              </Divider>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<GoogleMark />}
                onClick={() => signIn("google", { callbackUrl: "/" })}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  color: "text.primary",
                  borderColor: "#e2e8f0",
                  textTransform: "none",
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                }}
              >
                Continue with Google
              </Button>
            </>
          ) : null}

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Default Project Credentials:
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: "monospace", fontWeight: 700 }}
            >
              user@example.com / password123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signin;
export async function getServerSideProps(context) {
  const { req } = context;
  const session = await getSession({ req });
  const providers = await getProviders();
  if (session) {
    return {
      redirect: { destination: "/" },
    };
  }
  return {
    props: {
      providers,
    },
  };
}
