import type { NextFetchEvent, NextRequest } from "next/server";
import { auth } from "@/auth";

// next-auth's `auth` export is heavily overloaded (middleware / route handler /
// server-component call signatures); cast at this framework boundary rather
// than fight overload resolution for the proxy-invocation shape.
const authProxy = auth as (request: NextRequest, event: NextFetchEvent) => unknown;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  return authProxy(request, event);
}

export const config = {
  matcher: ["/dashboard/:path*", "/creator/:path*", "/create/checkout", "/admin/:path*"],
};
