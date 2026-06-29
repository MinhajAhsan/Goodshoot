import Link from "next/link";
import { brand } from "@/lib/config";
import { ButtonLink } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="border-b border-line/60">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold text-ink">
          {brand.name}
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-soft sm:flex">
          <Link href="/#how" className="hover:text-ink">How it works</Link>
          <Link href="/#work" className="hover:text-ink">Work</Link>
          <Link href="/dashboard" className="hover:text-ink">My bookings</Link>
        </nav>
        <ButtonLink href="/book" size="md">
          Get a quote
        </ButtonLink>
      </div>
    </header>
  );
}
