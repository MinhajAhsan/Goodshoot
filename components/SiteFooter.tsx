import { brand } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/60">
      <div className="container-page flex flex-col gap-2 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-base text-ink">{brand.name}</p>
        <p>{brand.tagline}</p>
        <p>
          &copy; {new Date().getFullYear()} · {brand.email}
        </p>
      </div>
    </footer>
  );
}
