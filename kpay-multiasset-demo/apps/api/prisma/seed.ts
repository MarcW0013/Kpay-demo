import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // No-op seed for demo. Keeping file for convenience.
  await prisma.$connect();
  console.log("Seed: nothing to seed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
