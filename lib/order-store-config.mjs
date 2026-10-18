export class OrderStoreConfigurationError extends Error {
  constructor(code) {
    super(code);
    this.name = "OrderStoreConfigurationError";
    this.code = code;
  }
}

/**
 * @param {Record<string, string | undefined>} environment
 * @returns {{ backend: "d1" } | { backend: "supabase", url: string, key: string }}
 */
export function resolveOrderStoreConfig(environment = process.env) {
  const rawUrl = environment.SUPABASE_URL;
  const rawKey = environment.SUPABASE_SERVICE_ROLE_KEY;
  const url = typeof rawUrl === "string" ? rawUrl.trim() : "";
  const key = typeof rawKey === "string" ? rawKey.trim() : "";
  const isVercel = Boolean(environment.VERCEL || environment.VERCEL_ENV);

  if (!url && !key) {
    if (isVercel) throw new OrderStoreConfigurationError("SUPABASE_CONFIG_MISSING");
    return { backend: "d1" };
  }

  if (!url || !key) {
    throw new OrderStoreConfigurationError("SUPABASE_CONFIG_INCOMPLETE");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new OrderStoreConfigurationError("SUPABASE_URL_INVALID");
  }
  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new OrderStoreConfigurationError("SUPABASE_URL_INVALID");
  }

  if (parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
    throw new OrderStoreConfigurationError("SUPABASE_URL_INVALID");
  }

  // The Supabase dashboard exposes both the project URL and the REST endpoint.
  // createClient() expects the project URL and appends /rest/v1 itself. Normalize
  // the commonly pasted REST endpoint so it cannot become /rest/rest/v1.
  const pathname = parsedUrl.pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/rest/v1") {
    parsedUrl.pathname = "/";
  } else if (pathname !== "/") {
    throw new OrderStoreConfigurationError("SUPABASE_URL_INVALID_PATH");
  }

  return { backend: "supabase", url: parsedUrl.origin, key };
}
