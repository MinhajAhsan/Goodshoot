// Small server-side data helpers shared across pages and API routes.
import { prisma } from "@/lib/prisma";

export async function getActiveCities() {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getActiveTemplate() {
  return prisma.questionnaireTemplate.findFirst({
    where: { isActive: true },
    orderBy: { version: "desc" },
  });
}

// There is a single AdminSettings row. Returns sensible defaults if unseeded.
export async function getAdminSettings() {
  const settings = await prisma.adminSettings.findFirst();
  return (
    settings ?? {
      baseQuoteAmount: 20000,
      quoteValidityHours: 24,
      firstPaymentPercentage: 50,
      currency: "PKR",
    }
  );
}
