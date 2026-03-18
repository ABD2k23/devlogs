import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db/index";
import { users, accounts, sessions } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  providers: [GitHub, Google],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.username = (user as { username?: string }).username ?? "";
      return session;
    },
  },
  events: {
    async signIn({ user, profile }) {
      if (user.id) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .then((res) => res[0]);

        if (existingUser && !existingUser.username) {
          // GitHub has profile.login, Google doesn't
          // So we fallback to generating from their name
          const username =
            (profile?.login as string) ||
            user.name?.toLowerCase().replace(/\s+/g, "") +
              Math.floor(Math.random() * 1000);

          await db.update(users).set({ username }).where(eq(users.id, user.id));
        }
      }
    },
  },
});
