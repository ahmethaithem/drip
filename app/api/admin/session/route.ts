import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  adminSecretMatches,
  configuredAdminEmails,
  createAdminSession,
  safeAdminReturnPath,
} from "@/lib/admin-session.mjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const adminEmails = configuredAdminEmails();
  if (!password || adminEmails.length === 0) {
    return NextResponse.json(
      { error: "لوحة الإدارة غير مهيأة حالياً." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: { email?: unknown; password?: unknown; returnTo?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "بيانات تسجيل الدخول غير صالحة." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const suppliedPassword = typeof body.password === "string" ? body.password : "";
  const validPassword = await adminSecretMatches(suppliedPassword, password);
  if (!adminEmails.includes(email) || !validPassword) {
    return NextResponse.json(
      { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const session = await createAdminSession(email, password);
  const response = NextResponse.json({ redirectTo: safeAdminReturnPath(body.returnTo) });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(ADMIN_SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
