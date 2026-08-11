import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const githubConfigured =
  Boolean(process.env.AUTH_GITHUB_ID) &&
  Boolean(process.env.AUTH_GITHUB_SECRET);

export const authConfigured = githubConfigured;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "hookforge-local-dev-secret",
  providers: githubConfigured
    ? [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID!,
          clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
      ]
    : [],
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});
