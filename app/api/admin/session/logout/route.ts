import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, safeAdminReturnPath } from "@/lib/admin-session.mjs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeAdminReturnPath(url.searchParams.get("return_to"));
  const destination = returnTo === "/admin" ? "/" : returnTo;
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
