// src/middleware.js: protectRoute.js
import { verifyAccessToken } from "@/utils/helper/jwtHelper";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const url = req.nextUrl.clone();

  // protect /api/private/* and /dashboard/*
  if (url.pathname.startsWith("/api/private") || url.pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      // if request is API, return 401; else redirect to login
      if (req.nextUrl.pathname.startsWith("/api/")) return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" }});
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    try {
      const payload = verifyAccessToken(token);
      // optionally attach user id to headers for downstream (server actions)
      req.headers.set("x-user-id", String(payload.id));
      return NextResponse.next();
    } catch (e) {
      // invalid token — redirect to login / 401
      if (req.nextUrl.pathname.startsWith("/api/")) return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" }});
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/private/:path*", "/dashboard/:path*"],
};
