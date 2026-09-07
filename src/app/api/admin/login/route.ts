import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_IFRAME_COOKIE,
  isUsingDefaultPassword,
  passwordMatches,
  sessionToken,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function redirectResponse(location: string) {
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: location,
    },
  });
}

function setAdminCookies(response: NextResponse) {
  const token = sessionToken();

  // Works in normal browser tabs and with local/internal testing.
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  // Works inside hosted preview iframes where SameSite=Lax cookies can be blocked.
  response.cookies.set(ADMIN_IFRAME_COOKIE, token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("unlock") !== "1" || !isUsingDefaultPassword()) {
    return redirectResponse("/admin/login");
  }

  const response = redirectResponse("/admin");
  setAdminCookies(response);
  return response;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!passwordMatches(password)) {
    return redirectResponse("/admin/login?error=1");
  }

  const response = redirectResponse("/admin");
  setAdminCookies(response);
  return response;
}
