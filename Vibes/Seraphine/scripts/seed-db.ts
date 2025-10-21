import { createConnection } from "@pharmasaas/db";
import { parseEnv } from "@pharmasaas/config";

const main = () => {
  try {
    const env = parseEnv({
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV
    });
    const connection = createConnection({ url: env.DATABASE_URL ?? "" });
    console.log("Seeding database with connection", connection.url ? "configured" : "not configured");
  } catch (error) {
    console.error("Failed to parse environment configuration for seed script", error);
    process.exit(1);
  }
};

main();
