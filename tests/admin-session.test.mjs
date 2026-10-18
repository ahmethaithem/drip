import test from "node:test";
import assert from "node:assert/strict";
import {
  adminSecretMatches,
  configuredAdminEmails,
  createAdminSession,
  safeAdminReturnPath,
  verifyAdminSession,
} from "../lib/admin-session.mjs";

test("admin sessions accept the configured email and reject tampering", async () => {
  const token = await createAdminSession("Owner@Example.com", "strong-test-secret");
  assert.equal(
    await verifyAdminSession(token, "strong-test-secret", ["owner@example.com"]),
    "owner@example.com",
  );
  assert.equal(await verifyAdminSession(`${token}x`, "strong-test-secret", ["owner@example.com"]), null);
  assert.equal(await verifyAdminSession(token, "different-secret", ["owner@example.com"]), null);
  assert.equal(await verifyAdminSession(token, "strong-test-secret", ["other@example.com"]), null);
});

test("admin password comparison does not accept an empty or different secret", async () => {
  assert.equal(await adminSecretMatches("correct-password", "correct-password"), true);
  assert.equal(await adminSecretMatches("wrong-password", "correct-password"), false);
  assert.equal(await adminSecretMatches("", "correct-password"), false);
});

test("admin configuration normalizes email allowlists", () => {
  assert.deepEqual(
    configuredAdminEmails({ ADMIN_EMAILS: " Owner@Example.com, second@example.com " }),
    ["owner@example.com", "second@example.com"],
  );
});

test("admin return paths remain same-origin and inside the dashboard", () => {
  assert.equal(safeAdminReturnPath("/admin?status=new"), "/admin?status=new");
  assert.equal(safeAdminReturnPath("/admin/login"), "/admin");
  assert.equal(safeAdminReturnPath("//evil.example/admin"), "/admin");
  assert.equal(safeAdminReturnPath("/checkout"), "/admin");
});
