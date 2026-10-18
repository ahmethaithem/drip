import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import {
  createIdempotencyKey,
  createOrderEndpoint,
  readJsonResponse,
} from "../lib/checkout-submit.mjs";
import {
  OrderStoreConfigurationError,
  resolveOrderStoreConfig,
} from "../lib/order-store-config.mjs";

test("checkout creates an RFC 4122 idempotency key without randomUUID", () => {
  const cryptoFallback = {
    getRandomValues(bytes) {
      bytes.set(Array.from({ length: 16 }, (_, index) => index));
      return bytes;
    },
  };
  const key = createIdempotencyKey(cryptoFallback);
  assert.match(key, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("checkout constructs an absolute same-origin API URL", () => {
  assert.equal(
    createOrderEndpoint("https://drip.example/checkout?from=cart"),
    "https://drip.example/api/orders",
  );
});

test("non-JSON server errors do not expose a browser parser exception", async () => {
  const response = new Response("<html>Internal Server Error</html>", { status: 500 });
  assert.equal(await readJsonResponse(response), null);
});

test("Vercel requires both server-only Supabase variables", () => {
  assert.throws(
    () => resolveOrderStoreConfig({ VERCEL: "1" }),
    (error) => error instanceof OrderStoreConfigurationError && error.code === "SUPABASE_CONFIG_MISSING",
  );
  assert.throws(
    () => resolveOrderStoreConfig({ VERCEL: "1", SUPABASE_URL: "https://project.supabase.co" }),
    (error) => error instanceof OrderStoreConfigurationError && error.code === "SUPABASE_CONFIG_INCOMPLETE",
  );
});

test("Supabase URL must be an HTTP API URL and values are trimmed", () => {
  assert.throws(
    () => resolveOrderStoreConfig({ VERCEL: "1", SUPABASE_URL: "postgresql://db.example", SUPABASE_SERVICE_ROLE_KEY: "secret" }),
    (error) => error instanceof OrderStoreConfigurationError && error.code === "SUPABASE_URL_INVALID",
  );
  assert.deepEqual(
    resolveOrderStoreConfig({ VERCEL: "1", SUPABASE_URL: " https://project.supabase.co/ ", SUPABASE_SERVICE_ROLE_KEY: " secret " }),
    { backend: "supabase", url: "https://project.supabase.co", key: "secret" },
  );
});

test("Supabase REST endpoint is normalized to the project base URL", () => {
  assert.deepEqual(
    resolveOrderStoreConfig({
      VERCEL: "1",
      SUPABASE_URL: "https://project.supabase.co/rest/v1/",
      SUPABASE_SERVICE_ROLE_KEY: "secret",
    }),
    { backend: "supabase", url: "https://project.supabase.co", key: "secret" },
  );
});

test("Supabase SDK builds the orders request with one REST path", async () => {
  let requestedUrl;
  const config = resolveOrderStoreConfig({
    VERCEL: "1",
    SUPABASE_URL: "https://project.supabase.co/rest/v1",
    SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
  });
  const client = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: async (input) => {
        requestedUrl = input instanceof Request ? input.url : String(input);
        return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
      },
    },
  });

  const { error } = await client.from("orders").select("*").limit(1);

  assert.equal(error, null);
  assert.equal(new URL(requestedUrl).pathname, "/rest/v1/orders");
});

test("Supabase URL rejects paths and URL metadata that create invalid API requests", () => {
  for (const url of [
    "https://project.supabase.co/project/settings",
    "https://project.supabase.co?key=secret",
    "https://project.supabase.co/#fragment",
    "https://user:password@project.supabase.co",
  ]) {
    assert.throws(
      () => resolveOrderStoreConfig({ VERCEL: "1", SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: "secret" }),
      (error) => error instanceof OrderStoreConfigurationError &&
        ["SUPABASE_URL_INVALID", "SUPABASE_URL_INVALID_PATH"].includes(error.code),
    );
  }
});

test("Cloudflare builds retain the D1 fallback", () => {
  assert.deepEqual(resolveOrderStoreConfig({}), { backend: "d1" });
});
