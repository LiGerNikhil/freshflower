/**
 * Read-only customer audit.
 *
 * Reports customer records that need manual review before removing guest
 * checkout upserts or consolidating account records. This script never writes
 * to MongoDB.
 *
 * Run: npm run report:customer-duplicates
 */
import "dotenv/config";
import path from "node:path";
import dns from "node:dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MONGODB_URI } from "@/lib/env";
import { CustomerModel } from "@/lib/db/models";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const { getServers, setServers } = dns;
if (getServers().length === 1 && ["127.0.0.1", "::1"].includes(getServers()[0])) {
  setServers(["1.1.1.1", "8.8.8.8"]);
}

type CustomerAuditDoc = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  totalOrders?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizePhone(value?: string) {
  return value?.replace(/\D/g, "").slice(-10) ?? "";
}

function printGroup(title: string, groups: CustomerAuditDoc[][]) {
  console.log(`\n${title}: ${groups.length}`);
  if (!groups.length) return;
  for (const [index, group] of groups.entries()) {
    console.log(`\n${title} #${index + 1}`);
    for (const customer of group) {
      console.log(
        JSON.stringify(
          {
            id: customer._id,
            name: customer.name ?? "",
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            totalOrders: customer.totalOrders ?? 0,
            createdAt: customer.createdAt?.toISOString?.() ?? "",
            updatedAt: customer.updatedAt?.toISOString?.() ?? "",
          },
          null,
          2,
        ),
      );
    }
  }
}

function duplicateGroups(
  customers: CustomerAuditDoc[],
  keyFor: (customer: CustomerAuditDoc) => string,
) {
  const groups = new Map<string, CustomerAuditDoc[]>();
  for (const customer of customers) {
    const key = keyFor(customer);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), customer]);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI(), {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  const customers = await CustomerModel.find()
    .select({ _id: 1, name: 1, email: 1, phone: 1, totalOrders: 1, createdAt: 1, updatedAt: 1 })
    .sort({ email: 1, phone: 1, _id: 1 })
    .lean<CustomerAuditDoc[]>();

  console.log(`Customers scanned: ${customers.length}`);

  const sameEmailMultipleIds = duplicateGroups(customers, (customer) => normalizeEmail(customer.email));
  const samePhoneMultipleEmails = duplicateGroups(customers, (customer) => normalizePhone(customer.phone))
    .filter((group) => new Set(group.map((customer) => normalizeEmail(customer.email))).size > 1);
  const missingEmailOrPhone = customers.filter(
    (customer) => !normalizeEmail(customer.email) || !normalizePhone(customer.phone),
  );

  printGroup("Same email across multiple customer ids", sameEmailMultipleIds);
  printGroup("Same phone with different emails", samePhoneMultipleEmails);
  printGroup("Missing/invalid email or phone", missingEmailOrPhone.map((customer) => [customer]));

  console.log("\nRead-only report complete. No documents were modified.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
