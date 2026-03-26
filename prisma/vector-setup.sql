-- Prisma / PostgreSQL helper: Set up pgvector extension and an HNSW index
-- Run this manually using psql or include it in your migration pipeline.

-- 1) Ensure extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 2) Ensure the embedding column has the correct type and dimension
-- Adjust 1536 to your embedding dimension (e.g. 1536 for OpenAI / Cohere common dims)
ALTER TABLE "KnowledgeItem" ALTER COLUMN embedding TYPE vector(1536) USING embedding::text::vector(1536);

-- 3) Create an HNSW index for fast nearest-neighbor search
-- If your pgvector version does not support hnsw, this will fail and you can
-- fall back to ivfflat (example provided below).
DROP INDEX IF EXISTS "KnowledgeItem_embedding_hnsw_idx";
CREATE INDEX "KnowledgeItem_embedding_hnsw_idx"
  ON "KnowledgeItem"
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200)
  WHERE embedding IS NOT NULL;

-- Fallback (uncomment if HNSW not supported):
-- DROP INDEX IF EXISTS "KnowledgeItem_embedding_ivfflat_idx";
-- CREATE INDEX "KnowledgeItem_embedding_ivfflat_idx"
--   ON "KnowledgeItem"
--   USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 100)
--   WHERE embedding IS NOT NULL;

-- Verification: list indexes on the table
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'KnowledgeItem';

