import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin-login-form";
import { safeAdminReturnPath } from "@/lib/admin-session.mjs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "تسجيل دخول الإدارة | DRIP EGYPT",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="admin-login-page">
      <AdminLoginForm returnTo={safeAdminReturnPath(params.return_to)} />
    </main>
  );
}
