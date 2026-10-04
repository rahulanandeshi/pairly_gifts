import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "CREATOR" | "BUSINESS" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "USER" | "CREATOR" | "BUSINESS" | "ADMIN";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "CREATOR" | "BUSINESS" | "ADMIN";
  }
}
