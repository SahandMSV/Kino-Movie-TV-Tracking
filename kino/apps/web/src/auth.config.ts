import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/", // we use the landing page sliding panels
  },
  providers: [], // real providers live in auth.ts
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;