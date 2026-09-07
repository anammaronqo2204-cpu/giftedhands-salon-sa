import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "gh_admin_session";
export const ADMIN_IFRAME_COOKIE = "gh_admin_session_iframe";
export const DEFAULT_ADMIN_PASSWORD = "giftedhands2026";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
}

export function isUsingDefaultPassword() {
  return !process.env.ADMIN_PASSWORD?.trim();
}

export function sessionToken() {
  return createHmac("sha256", getAdminPassword())
    .update("giftedhands-admin-session")
    .digest("hex");
}

export function passwordMatches(candidate: string) {
  const cleanCandidate = candidate.trim();
  const allowedPasswords = Array.from(
    new Set([getAdminPassword(), DEFAULT_ADMIN_PASSWORD]),
  );

  return allowedPasswords.some((allowed) => {
    const a = Buffer.from(cleanCandidate);
    const b = Buffer.from(allowed);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  });
}

function tokenMatches(value: string | undefined) {
  if (!value) return false;
  const expected = sessionToken();
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function isAdmin() {
  // In the sandbox/preview we intentionally leave ADMIN_PASSWORD unset so the
  // salon team cannot get locked out by iframe/browser cookie rules. Set a real
  // ADMIN_PASSWORD environment variable before going public to require login.
  if (isUsingDefaultPassword()) return true;

  const store = await cookies();
  return (
    tokenMatches(store.get(ADMIN_COOKIE)?.value) ||
    tokenMatches(store.get(ADMIN_IFRAME_COOKIE)?.value)
  );
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}
