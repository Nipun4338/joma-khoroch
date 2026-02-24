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

import { TextField, Container, Paper } from "@mui/material";

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
