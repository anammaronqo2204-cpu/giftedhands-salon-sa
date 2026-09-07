import Link from "next/link";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Bookings" },
  { href: "/admin/services", label: "Services & images" },
  { href: "/admin/staff", label: "Braiders & stylists" },
  { href: "/admin/schedule", label: "Schedule log" },
];

export function AdminNav({ active }: { active: "bookings" | "services" | "staff" | "schedule" }) {
  return (
    <nav className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
      {LINKS.map((link) => {
        const isActive =
          (active === "bookings" && link.href === "/admin") ||
          (active === "services" && link.href === "/admin/services") ||
          (active === "staff" && link.href === "/admin/staff") ||
          (active === "schedule" && link.href === "/admin/schedule");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition",
              isActive
                ? "border-espresso bg-espresso text-cream"
                : "border-linen bg-white text-cocoa hover:border-espresso",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
