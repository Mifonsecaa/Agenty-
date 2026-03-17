export type KnowledgeItem = {
  id: string;
  content: string;
  metadata?: {
    fileName?: string;
    fileUrl?: string;
    fileType?: string;
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

