import Link from "next/link";
import { brand } from "@/lib/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container-page flex h-16 items-center">
        <Link href="/" className="font-display text-xl font-semibold">
          {brand.name}
        </Link>
      </header>
      <main className="container-page flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
