import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth, authConfigured } from "@/lib/auth";

export default async function middleware(request: NextRequest) {
  if (!authConfigured) {
    return NextResponse.next();
  }

  const session = await auth();
  if (session?.user) {
    return NextResponse.next();
  }

  const login = new URL("/login", request.nextUrl.origin);
  login.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/overview/:path*", "/runs/:path*", "/workflows/:path*", "/settings/:path*"],
};
