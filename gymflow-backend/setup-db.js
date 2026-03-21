const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("Testing connection...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "gym_owner" (
          "id" SERIAL NOT NULL,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password_hash" TEXT NOT NULL,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "gym_owner_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "gym_owner_email_key" ON "gym_owner"("email");

      CREATE TABLE IF NOT EXISTS "members" (
          "id" SERIAL NOT NULL,
          "name" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "gym_id" INTEGER NOT NULL,

          CONSTRAINT "members_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "memberships" (
          "id" SERIAL NOT NULL,
          "member_id" INTEGER NOT NULL,
          "plan_type" TEXT NOT NULL,
          "start_date" TIMESTAMP(3) NOT NULL,
          "end_date" TIMESTAMP(3) NOT NULL,
          "status" TEXT NOT NULL,

          CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "payments" (
          "id" SERIAL NOT NULL,
          "member_id" INTEGER NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "due_date" TIMESTAMP(3) NOT NULL,
          "paid_date" TIMESTAMP(3),
          "status" TEXT NOT NULL,

          CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
      );

      CREATE INDEX IF NOT EXISTS "payments_due_date_idx" ON "payments"("due_date");
      CREATE INDEX IF NOT EXISTS "payments_member_id_idx" ON "payments"("member_id");

      -- Notice: We are skipping the ALTER TABLE generic foreign keys block if they already exist, by not defining constraints here.
    `);
    console.log("Schema executed successfully!");
  } catch (e) {
    console.log("Error", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
