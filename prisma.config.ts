// Loads .env for the Prisma CLI (migrate / generate / db seed).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // datasource (url + directUrl) is defined in prisma/schema.prisma.
});
