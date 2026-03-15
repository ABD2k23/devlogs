import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
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
  providers: [GitHub],
  callbacks: {
    async session({ session, user }) {
      // Attach the user id and username to the session
      // so we can access it anywhere in the app
      session.user.id = user.id;
      session.user.username = (user as { username?: string }).username ?? "";
      return session;
    },
  },
  events: {
    async signIn({ user, profile }) {
      // When someone signs in, if they don't have a username yet
      // grab it from their GitHub profile and save it
      if (user.id && profile?.login) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .then((res) => res[0]);

        if (existingUser && !existingUser.username) {
          await db
            .update(users)
            .set({ username: profile.login as string })
            .where(eq(users.id, user.id));
        }
      }
    },
  },
});
