import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { authConfig } from "./auth.config";

// TODO: No Google OAuth app is registered yet — this is a placeholder,
// following the same pattern as lib/sms.ts / lib/tremendous.ts. Set
// GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (from a project in
// https://console.cloud.google.com/apis/credentials, authorized redirect
// URI `${SITE_URL}/api/auth/callback/google`) to enable it — the provider
// only registers when both are present, so sign-in stays Credentials-only
// until then.
const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          // Google verifies the email itself, so it's safe to link a Google
          // sign-in straight onto an existing account with the same email
          // (e.g. one created via the password form) instead of erroring
          // out with "OAuthAccountNotLinked" — this is what makes "sign up
          // with email, later sign in with Google" land on one account.
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...googleProvider,
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true, email: true, name: true, image: true, role: true, password: true, banned: true },
        });
        if (!user?.password) return null;
        if (user.banned) return null;

        const valid = await verifyPassword(password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
      },
    }),
  ],
});
