import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Ensure `/` always serves the marketing homepage.
 * (Protects against any accidental root redirects / CF misconfig.)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
