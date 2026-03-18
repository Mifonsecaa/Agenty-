/*
  Verifies that the AudioTranscriptionJob table and enum exist in Postgres.
*/

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function run() {
  try {
    const tableRows = await prisma.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'AudioTranscriptionJob'
      LIMIT 1;
    `);

    const enumRows = await prisma.$queryRawUnsafe(`
      SELECT t.typname
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typname = 'AudioTranscriptionJobStatus'
      LIMIT 1;
    `);

    const hasTable = Array.isArray(tableRows) && tableRows.length > 0;
    const hasEnum = Array.isArray(enumRows) && enumRows.length > 0;

    console.log(`[MigrationCheck] AudioTranscriptionJob table: ${hasTable ? "OK" : "MISSING"}`);
    console.log(`[MigrationCheck] AudioTranscriptionJobStatus enum: ${hasEnum ? "OK" : "MISSING"}`);

    if (!hasTable || !hasEnum) {
      console.error("[MigrationCheck] Migration not fully applied. Run: npx prisma migrate deploy");
      process.exitCode = 1;
      return;
    }

    console.log("[MigrationCheck] Migration looks good.");
  } catch (error) {
    console.error("[MigrationCheck] Error:", error && error.message ? error.message : error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();

