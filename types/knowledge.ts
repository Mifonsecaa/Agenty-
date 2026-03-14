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
};

