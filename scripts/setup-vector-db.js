const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando configuración de base de datos vectorial...');

  try {
    // 1. Habilitar extensión vector
    console.log('Habilitando extensión "vector"...');
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log('Extensión habilitada.');

    // 2. Modificar la columna embedding en KnowledgeItem
    console.log('Actualizando tabla KnowledgeItem...');
    
    // Verificamos si la columna existe y su tipo (esto es un enfoque "fuerza bruta" para dev)
    // Simplemente intentamos convertirla, y si falla, la borramos y recreamos.
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "KnowledgeItem" ALTER COLUMN embedding TYPE vector(1536) USING embedding::text::vector(1536);`);
        console.log('Columna convertida a vector(1536).');
    } catch (e) {
        console.log('No se pudo convertir directamente. Recreando columna...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "KnowledgeItem" DROP COLUMN IF EXISTS embedding;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "KnowledgeItem" ADD COLUMN embedding vector(1536);`);
        console.log('Columna embedding recreada como vector(1536).');
    }

    // 3. Crear índice para búsquedas rápidas (HNSW)
    console.log('Creando índice HNSW...');
    // Dropeamos índice viejo si existe
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "KnowledgeItem_embedding_idx";`);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX "KnowledgeItem_embedding_idx" 
      ON "KnowledgeItem" 
      USING hnsw (embedding vector_cosine_ops);
    `);
    console.log('Índice creado.');

    console.log('¡Configuración completada con éxito!');
  } catch (error) {
    console.error('Error configurando la DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

