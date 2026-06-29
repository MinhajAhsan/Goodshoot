import { PhotoFrameGallery } from "@/components/PhotoFrameGallery";
import { ButtonLink } from "@/components/ui/Button";
import { brand } from "@/lib/config";

const STEPS = [
  {
    n: "01",
    title: "Tell us about your shoot",
    body: "Answer six quick questions about your event, city, and what you need delivered.",
  },
  {
    n: "02",
    title: "Get an instant quote",
    body: "Our pricing engine builds a transparent quote in seconds — no waiting, no haggling.",
  },
  {
    n: "03",
    title: "Book a consultation",
    body: "Pick a slot, talk through the details, and lock in your date with a 50% deposit.",
  },
  {
    n: "04",
    title: "We capture & deliver",
    body: "A vetted specialist shoots your event and delivers polished photos and video.",
  },
];

const CATEGORIES = ["Weddings", "Corporate", "Music Videos", "Real Estate", "Portraits"];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="container-page pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted">
            Photography & Video, on demand
          </p>
          <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-6xl">
            One team.
            <br />
            <span className="italic text-accent">Every important moment</span>, captured.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ink-soft">
            {brand.description}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <ButtonLink href="/book" size="lg" variant="secondary">
              Get a free quote →
            </ButtonLink>
            <ButtonLink href="/#how" size="lg" variant="ghost">
              How it works
            </ButtonLink>
          </div>
        </div>

        {/* Fanned portfolio gallery */}
        <div className="mt-16 sm:mt-20">
          <PhotoFrameGallery />
        </div>
      </section>

      {/* Categories strip */}
      <section id="work" className="container-page mt-20">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
          {CATEGORIES.map((c) => (
            <span key={c} className="font-display text-lg text-muted">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container-page mt-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            From idea to delivered, in four steps
          </h2>
          <p className="mt-3 text-ink-soft">
            No back-and-forth emails. No guesswork on price. Just a clear path from booking to final files.
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-cream-50 p-7">
              <span className="font-display text-sm text-accent">{s.n}</span>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-24">
        <div className="rounded-3xl bg-ink px-8 py-14 text-center text-cream-50">
          <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold text-cream-50 sm:text-4xl">
            Ready to see your quote?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-cream-100/70">
            It takes about two minutes. No commitment until you book a consultation.
          </p>
          <div className="mt-7 flex justify-center">
            <ButtonLink href="/book" size="lg" variant="secondary">
              Start now →
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
