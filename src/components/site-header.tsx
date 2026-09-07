"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BUSINESS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo, Menu, X } from "./icons";

const NAV = [
  { href: "/services", label: "Services & Prices" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Locations" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isAdmin = pathname?.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-espresso/90 text-cream backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-6 sm:h-20">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold transition group-hover:bg-gold/25">
            <Logo className="h-8 w-8" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Giftedhands
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
              Salon SA
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-semibold tracking-wide text-cream/75 transition hover:text-cream",
                  active && "text-cream",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-2 left-0 h-0.5 w-full origin-left scale-x-0 bg-gold transition-transform",
                    active && "scale-x-100",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={BUSINESS.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm font-semibold text-cream/75 transition hover:text-cream md:inline"
          >
            {BUSINESS.phoneDisplay}
          </a>
          {!isAdmin && (
            <Link href="/book" className="btn btn-gold hidden px-5 py-2.5 sm:inline-flex">
              Book your slot
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 text-cream lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-cream/10 bg-espresso lg:hidden">
          <nav className="container-x flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-base font-semibold text-cream/85 transition hover:bg-cream/5 hover:text-cream"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 px-2">
              <Link href="/book" className="btn btn-gold w-full">
                Book your slot
              </Link>
              <a
                href={BUSINESS.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-light w-full"
              >
                WhatsApp {BUSINESS.phoneDisplay}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
