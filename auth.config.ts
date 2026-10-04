import type { NextAuthConfig } from "next-auth";

// Shared callbacks/session config, consumed by the full auth.ts (which adds
// the Prisma adapter + Credentials provider). Proxy in this Next.js version
// runs on the Node.js runtime by default, so no edge-safety split is needed.
export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      if (nextUrl.pathname.startsWith("/admin")) {
        return isLoggedIn && auth?.user.role === "ADMIN";
      }
      if (nextUrl.pathname.startsWith("/creator")) {
        return isLoggedIn && (auth?.user.role === "CREATOR" || auth?.user.role === "ADMIN");
      }
      if (nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname === "/create/checkout") {
        return isLoggedIn;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role ?? "USER";
      }
      // Role (and other DB-derived fields) can change after the JWT was issued
      // (e.g. becomeCreator()) — server actions call unstable_update({ user: {...} })
      // to re-sign the cookie immediately rather than waiting for next sign-in.
      if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
