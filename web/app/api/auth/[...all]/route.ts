// Proxy auth requests to the backend
// In production, Better-Auth handles this on the server directly
// This route exists for local dev where frontend/backend are separate

import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const targetUrl = `${API_BASE}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== "GET" ? await request.text() : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 502 });
  }
}

export { handler as GET, handler as POST };
