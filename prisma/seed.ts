import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log("User already exists, skipping seed.");
    return;
  }
  const passwordHash = await bcrypt.hash("changeme", 10);
  const user = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "管理者",
      passwordHash,
    },
  });
  await prisma.persona.updateMany({
    where: { userId: null },
    data: { userId: user.id },
  });
  console.log("Seed: created user", user.email, "and assigned existing personas.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
