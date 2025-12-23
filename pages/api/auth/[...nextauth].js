import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  // Support both casing variations for the secret
  secret: process.env.NEXTAUTH_SECRET || process.env.NextAuth_SECRET,
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter Password",
        },
      },

      async authorize(credentials, req) {
        const { email, password } = credentials;

        // Use NEXTAUTH_URL for the base path, falling back to localhost or the hardcoded legacy URL
        const baseUrl =
          process.env.NEXTAUTH_URL ||
          (process.env.NODE_ENV === "production"
            ? "https://joma-khoroch.vercel.app"
            : "http://localhost:3000");
        const URL = `${baseUrl}/api/login`;
        const res = await fetch(URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
        const user = await res.json();
        console.log("Login API Response Status:", res.status);
        console.log("Login API User Object:", user);

        if (res.ok && user) {
          return user;
        } else {
          console.log(
            "Login failed: res.ok is false or user object is missing"
          );
          return null;
        }
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.user = token;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
export default NextAuth(authOptions);
