// Seeds the baseline data the app needs: active cities, the questionnaire
// template, and the single AdminSettings row. Idempotent — safe to re-run.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { QUESTION_FLOW } from "../lib/questionnaire";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding GoodShoot…");

  // --- Cities ---
  const cityNames = ["Karachi", "Lahore", "Islamabad"];
  const cities = [];
  for (const name of cityNames) {
    const existing = await prisma.city.findFirst({ where: { name } });
    const city = existing
      ? existing
      : await prisma.city.create({
          data: { name, countryCode: "PK", timezone: "Asia/Karachi", isActive: true },
        });
    cities.push(city);
    console.log(`  city: ${city.name} (${city.id})`);
  }

  // --- Questionnaire template ---
  const existingTemplate = await prisma.questionnaireTemplate.findFirst({
    where: { name: "Default booking flow", isActive: true },
  });
  const template =
    existingTemplate ??
    (await prisma.questionnaireTemplate.create({
      data: {
        name: "Default booking flow",
        version: QUESTION_FLOW.version,
        isActive: true,
        questionFlow: QUESTION_FLOW,
      },
    }));
  console.log(`  template: ${template.name} (${template.id})`);

  // --- Admin settings (single row) ---
  const existingSettings = await prisma.adminSettings.findFirst();
  const settings =
    existingSettings ??
    (await prisma.adminSettings.create({
      data: {
        baseQuoteAmount: 20000,
        currency: "PKR",
        activeCities: cities.map((c) => c.id),
        firstPaymentPercentage: 50,
        quoteValidityHours: 24,
      },
    }));
  // Keep activeCities in sync with seeded cities.
  await prisma.adminSettings.update({
    where: { id: settings.id },
    data: { activeCities: cities.map((c) => c.id) },
  });
  console.log(`  admin settings: base ${settings.baseQuoteAmount} ${settings.currency}`);

  console.log("Seed complete ✅");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
