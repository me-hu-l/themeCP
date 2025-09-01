import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // List of protected routes
  const protectedPaths = [
    "/contest",
    "/start_contest",
    "/profile",
    "/contest_history",
    "/importExport",
  ];

  if (protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/contest",
    "/start_contest",
    "/profile",
    "/contest_history",
    "/importExport",
  ],
};
