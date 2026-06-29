import { getActiveCities } from "@/lib/data";
import { QuestionnaireForm } from "@/components/QuestionnaireForm";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const cities = await getActiveCities();

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Get a quote
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          A few quick questions
        </h1>
        <p className="mt-2 text-ink-soft">
          Tell us about your shoot and we&apos;ll build your quote instantly.
        </p>

        <div className="mt-10">
          <QuestionnaireForm cities={cities} />
        </div>
      </div>
    </div>
  );
}
