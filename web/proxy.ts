import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// fun.samitmohan.in is an alias for the unlisted /fun index. Serve that page
// at the subdomain root; every other path renders normally on both hosts.
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("fun.") && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/fun", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
