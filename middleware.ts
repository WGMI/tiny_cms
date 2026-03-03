import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CMS_PROTECTED_PREFIX = "/cms/";

// Public API routes that may be fetched from another origin (e.g. main site)
const CORS_API_PATHS = ["/api/events", "/api/events-page", "/api/media"];

function isCorsApiPath(pathname: string): boolean {
  return (
    pathname === "/api/events" ||
    pathname === "/api/events-page" ||
    pathname === "/api/pages" ||
    pathname.startsWith("/api/media/")
  );
}

function corsHeaders(origin: string | null) {
  const allowOrigin = origin || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // CORS for public API (so main site at different origin can fetch events)
  if (isCorsApiPath(pathname)) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
    }
    const response = NextResponse.next();
    Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // CMS auth: only apply to /cms routes (except login/register)
  if (!pathname.startsWith(CMS_PROTECTED_PREFIX)) {
    return NextResponse.next();
  }
  if (pathname === "/cms/login" || pathname === "/cms/register") {
    return NextResponse.next();
  }

  const session = request.cookies.get("session")?.value;
  if (!session) {
    const login = new URL("/cms/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cms/:path*", "/api/events", "/api/events-page", "/api/pages", "/api/media/:path*"],
};
