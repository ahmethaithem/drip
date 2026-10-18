import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  configuredAdminEmails,
  verifyAdminSession,
} from "@/lib/admin-session.mjs";

const ADMIN_USER_ID_HEADER = "oai-authenticated-user-id";
const ADMIN_EMAIL_HEADER = "oai-authenticated-user-email";
const ADMIN_NAME_HEADER = "oai-authenticated-user-full-name";
const ADMIN_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";

function readBasicCredentials(
  authorization: string | null,
): { username: string; password: string } | null {
  if (!authorization?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;

    return {
      username: decoded.slice(0, separator).trim().toLowerCase(),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

function unauthorized(message = "Authentication required") {
  return new NextResponse(message, {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": 'Basic realm="DRIP EGYPT Admin", charset="UTF-8"',
    },
  });
}

export async function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  if (
    request.nextUrl.pathname === "/admin/login" ||
    request.nextUrl.pathname.startsWith("/api/admin/session")
  ) {
    return NextResponse.next();
  }

  // OpenAI Sites injects its own authenticated-user headers. Vercel does not,
  // so ADMIN_PASSWORD enables a small, server-side Basic Auth adapter there.
  if (!password) return NextResponse.next();

  const adminEmails = configuredAdminEmails();
  if (!adminEmails.length) {
    return new NextResponse(
      "ADMIN_EMAILS must be configured when ADMIN_PASSWORD is enabled.",
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  const credentials = readBasicCredentials(
    request.headers.get("authorization"),
  );
  const basicEmail =
    credentials &&
    adminEmails.includes(credentials.username) &&
    credentials.password === password
      ? credentials.username
      : null;
  const sessionEmail = await verifyAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    password,
    adminEmails,
  );
  const adminEmail = basicEmail ?? sessionEmail;

  if (!adminEmail) {
    if (request.nextUrl.pathname.startsWith("/api/admin/")) return unauthorized();
    const signInUrl = new URL("/admin/login", request.url);
    signInUrl.searchParams.set("return_to", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(ADMIN_USER_ID_HEADER, "vercel-admin");
  requestHeaders.set(ADMIN_EMAIL_HEADER, adminEmail);
  requestHeaders.set(
    ADMIN_NAME_HEADER,
    encodeURIComponent("DRIP EGYPT Admin"),
  );
  requestHeaders.set(ADMIN_NAME_ENCODING_HEADER, "percent-encoded-utf-8");

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
