export type KnowledgeItem = {
  id: string;
  content: string;
  metadata?: {
    fileName?: string;
  };
  createdAt?: string;
};

export type KnowledgeListData = {
  items: KnowledgeItem[];
};

export type KnowledgeListResponse = {
  success: boolean;
  // Compatibilidad: algunos handlers pueden devolver items al tope
  items?: KnowledgeItem[];
  // Formato estandar de successResponse(...)
  data?: KnowledgeListData;
  error?: string;
  details?: string;
  message?: string;
  queued?: boolean;
  deduplicated?: boolean;
  jobId?: string;
  status?: string;
  chunkCount?: number;
};

export type KnowledgeJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "RETRY"
  | "COMPLETED"
  | "FAILED"
  | "DLQ";

export type KnowledgeJob = {
  id: string;
  status: KnowledgeJobStatus;
  attempts: number;
  maxAttempts: number;
  chunkCount: number;
  lastError?: string | null;
  createdAt?: string;
  startedAt?: string | null;
  finishedAt?: string | null;
};

export type KnowledgeJobResponse = {
  success: boolean;
  data?: KnowledgeJob;
  error?: string;
};

export type KnowledgeJobStatusCount = {
  status: KnowledgeJobStatus;
  count: number;
};

export type KnowledgeJobAgeBuckets = {
  lt5m: number;
  m5To30: number;
  m30To120: number;
  gte120m: number;
};

export type KnowledgeQueueSummary = {
  businessId?: string;
  totals: {
    all: number;
    active: number;
    completed: number;
    failed: number;
    dlq: number;
  };
  byStatus: KnowledgeJobStatusCount[];
  ageBuckets: KnowledgeJobAgeBuckets;
  oldestActiveCreatedAt?: string | null;
};

export type KnowledgeQueueSummaryResponse = {
  success: boolean;
  data?: KnowledgeQueueSummary;
  generatedAt?: string;
  error?: string;
};

export type KnowledgeJobReplayResponse = {
  success: boolean;
  replayedCount: number;
  replayedIds: string[];
  businessId?: string;
  jobId?: string;
  error?: string;
};

export type KnowledgeJobCleanupResponse = {
  success: boolean;
  deletedCount: number;
  retentionDays: number;
  businessId?: string;
  cutoff: string;
  error?: string;
};

export type KnowledgeQueueHealthData = {
  businessId?: string;
  health: "ok" | "degraded";
  backlog: number;
  dlq: number;
  failed: number;
  oldestActiveCreatedAt?: string | null;
  ageBuckets: KnowledgeJobAgeBuckets;
  totals: KnowledgeQueueSummary["totals"];
};

export type KnowledgeQueueHealthResponse = {
  success: boolean;
  data?: KnowledgeQueueHealthData;
  generatedAt?: string;
  error?: string;
};

