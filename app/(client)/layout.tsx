import Link from "next/link";
import { brand } from "@/lib/config";
import { SignOutButton } from "@/components/SignOutButton";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line/60">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-display text-xl font-semibold">
              {brand.name}
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-ink-soft sm:flex">
              <Link href="/dashboard" className="hover:text-ink">Overview</Link>
              <Link href="/dashboard/bookings" className="hover:text-ink">Bookings</Link>
              <Link href="/dashboard/profile" className="hover:text-ink">Profile</Link>
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="container-page flex-1 py-10">{children}</main>
    </div>
  );
}
