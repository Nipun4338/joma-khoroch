import { useRef } from "react";
import { getProviders, getSession, signIn } from "next-auth/react";
import { Button, Input } from "@mui/material";
import { Stack } from "@mui/system";

const Signin = ({ providers }) => {
  const email = useRef("");
  const password = useRef("");
  return (
    <Stack
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
        <div className="flex items-center min-h-screen p-4 bg-gray-100 lg:justify-center" style={{border: "2px solid black", padding: "10px"}}>
          <div className="flex flex-col overflow-hidden bg-white rounded-md shadow-lg max md:flex-row md:flex-1 lg:max-w-screen-md">
            <div className="p-5 bg-white md:flex-1">
              <h3 className="my-4 text-2xl font-semibold text-gray-700">
                Account Login
              </h3>
              <form action="#" className="flex flex-col space-y-5">
                <Stack margin={2}>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-500"
                      style={{ marginRight: "10px" }}
                    >
                      Email
                    </label>
                    </div>
                    <Input
                      type="email"
                      id="email"
                      autoFocus
                      onChange={(e) => (email.current = e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-semibold text-gray-500"
                        style={{ marginRight: "10px" }}
                      >
                        Password
                      </label>
                    </div>
                    <Input
                      type="password"
                      id="password"
                      className="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200"
                      onChange={(e) => (password.current = e.target.value)}
                    />
                  </div>
                </Stack>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{ fontWeight: "bold" }}
                    onClick={() =>
                      signIn("credentials", {
                        email: email.current,
                        password: password.current,
                      })
                    }
                  >
                    Log in
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Stack>
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
