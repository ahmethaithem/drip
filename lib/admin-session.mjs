export const ADMIN_SESSION_COOKIE = "drip_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const encoder = new TextEncoder();

export function configuredAdminEmails(environment = process.env) {
  return (environment.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function safeAdminReturnPath(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  try {
    const url = new URL(value, "https://admin.local");
    if (
      url.origin !== "https://admin.local" ||
      (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/"))
    ) {
      return "/admin";
    }
    if (url.pathname === "/admin/login") return "/admin";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/admin";
  }
}

export async function createAdminSession(email, secret) {
  const payload = {
    email: email.trim().toLowerCase(),
    expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload, secret);
  return `${encodedPayload}.${toBase64Url(signature)}`;
}

export async function verifyAdminSession(token, secret, allowedEmails) {
  if (!token) return null;
  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra) return null;

  let signature;
  let payload;
  try {
    signature = fromBase64Url(encodedSignature);
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload)));
  } catch {
    return null;
  }

  if (
    typeof payload?.email !== "string" ||
    typeof payload?.expiresAt !== "number" ||
    payload.expiresAt <= Date.now() ||
    !allowedEmails.includes(payload.email.toLowerCase())
  ) {
    return null;
  }

  const key = await importSigningKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(encodedPayload),
  );
  return valid ? payload.email.toLowerCase() : null;
}

export async function adminSecretMatches(provided, expected) {
  if (!provided || !expected) return false;
  const challenge = "drip-egypt-admin-password-check";
  const [providedDigest, expectedDigest] = await Promise.all([
    sign(challenge, provided),
    sign(challenge, expected),
  ]);
  if (providedDigest.length !== expectedDigest.length) return false;

  let difference = 0;
  for (let index = 0; index < providedDigest.length; index += 1) {
    difference |= providedDigest[index] ^ expectedDigest[index];
  }
  return difference === 0;
}

async function sign(value, secret) {
  const key = await importSigningKey(secret);
  const result = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return new Uint8Array(result);
}

async function importSigningKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(value) {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
