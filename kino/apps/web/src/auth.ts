import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { z } from "zod";

import clientPromise from "@/lib/db/mongodb";
import { connectMongoose } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/user";
import { verifyPassword } from "@/lib/password";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" }, // required when using Credentials
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { emailOrUsername, password } = parsed.data;

        await connectMongoose();

        const isEmail = emailOrUsername.includes("@");
        const user = await User.findOne(
          isEmail
            ? { email: emailOrUsername.toLowerCase() }
            : { username: emailOrUsername.toLowerCase() },
        ).select("+passwordHash");

        if (!user || !user.passwordHash) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? user.username,
          username: user.username,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});