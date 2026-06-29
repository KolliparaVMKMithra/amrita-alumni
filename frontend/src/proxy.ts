import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PATHS = ["/auth/login", "/auth/signup", "/auth/verify-otp"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  // Redirect authenticated users away from auth pages
  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/register/:path*", "/profile/:path*", "/auth/:path*"],
};
