import Link from "next/link";
import { Logo } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-espresso text-gold">
          <Logo className="h-12 w-12" />
        </span>
        <p className="eyebrow mt-6 justify-center">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">This page slipped out of the braid.</h1>
        <p className="mx-auto mt-4 max-w-md text-mocha">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to something beautiful.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-dark">
            Back home
          </Link>
          <Link href="/book" className="btn btn-gold">
            Book a slot
          </Link>
        </div>
      </div>
    </div>
  );
}
