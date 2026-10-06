import dotenv from "dotenv";
import { processPaymentEmailOutbox } from "../src/lib/payments/email-outbox";

dotenv.config({ path: ".env.local" });

const limitArg = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? 10);

processPaymentEmailOutbox({ limit: Number.isFinite(limitArg) ? limitArg : 10 })
  .then(({ processed }) => {
    console.log(`Processed ${processed} payment email outbox job(s).`);
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
