import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function requireAdminApi() {
  const user = await getChatGPTUser();
  if (!user) return null;
  const configured = process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (configured?.length && !configured.includes(user.email.toLowerCase())) return null;
  return user;
}

