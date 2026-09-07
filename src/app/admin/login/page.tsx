import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/icons";
import { DEFAULT_ADMIN_PASSWORD, isAdmin, isUsingDefaultPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Salon login",
  robots: { index: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-espresso text-gold">
          <Logo className="h-10 w-10" />
        </span>
        <p className="eyebrow mt-6">Salon dashboard</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-mocha">Sign in to manage bookings and reviews.</p>

        <form action="/api/admin/login" method="post" className="mt-8 space-y-5">
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              autoComplete="current-password"
              required
              autoFocus
            />
          </div>
          {error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              Incorrect password. Please try again.
            </p>
          )}
          <button type="submit" className="btn btn-dark w-full">
            Sign in
          </button>
        </form>

        {isUsingDefaultPassword() && (
          <a href="/api/admin/login?unlock=1" className="btn btn-gold mt-4 w-full">
            Unlock dashboard now
          </a>
        )}

        {isUsingDefaultPassword() && (
          <p className="mt-6 rounded-2xl bg-sand/70 px-4 py-3 text-xs leading-relaxed text-cocoa">
            Use the password <code className="rounded bg-white px-1.5 py-0.5 font-mono">{DEFAULT_ADMIN_PASSWORD}</code>, or tap the unlock button above.
            Set an <code className="font-mono">ADMIN_PASSWORD</code> environment variable later to remove one-click unlock.
          </p>
        )}
      </div>
    </div>
  );
}
