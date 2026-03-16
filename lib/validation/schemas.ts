import { z } from "zod";

// ============ AUTHENTICATION ============
export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// ============ BUSINESS ============
export const createBusinessSchema = z.object({
  name: z.string().min(1, "El nombre del negocio es requerido"),
  phone: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
  description: z.string().optional(),
});

export const updateBusinessSchema = z.object({
  name: z.string().min(1, "El nombre del negocio es requerido").optional(),
  phone: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
});

// ============ ONBOARDING ============
export const onboardingSchema = z.object({
  ownerDescription: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
});

// ============ KNOWLEDGE ============
export const knowledgeQuerySchema = z.object({
  businessId: z.string().min(1, "El businessId es requerido"),
});

export const knowledgeCreateSchema = z.object({
  businessId: z.string().min(1, "El businessId es requerido"),
  text: z.string().min(1, "El contenido es requerido").optional(),
  name: z.string().min(1, "El nombre es requerido").optional(),
  url: z.string().url("La URL no es válida").optional(),
  type: z.string().optional(),
}).refine((data) => {
  if (data.url) return true;
  return Boolean(data.text && data.name);
}, {
  message: "Debes enviar URL o contenido con nombre",
  path: ["text"],
});

// ============ CHAT ============
export const chatSchema = z.object({
  businessId: z.string().min(1, "El businessId es requerido"),
  message: z.string().min(1, "El mensaje es requerido"),
  conversationId: z.string().optional(),
});

// ============ IMPROVE DESCRIPTION ============
export const improveDescriptionSchema = z.object({
  text: z.string().min(5, "El texto debe tener al menos 5 caracteres"),
});

// ============ GENERATE PROMPT ============
export const generatePromptSchema = z.object({
  businessDescription: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  context: z.string().optional(),
});

// ============ METRICS ============
export const metricsQuerySchema = z.object({
  businessId: z.string().min(1, "El businessId es requerido"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ============ WEBHOOK (Telegram/WhatsApp) ============
export const telegramWebhookSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({
      id: z.number(),
      first_name: z.string(),
    }),
    text: z.string().optional(),
  }).optional(),
});

export const whatsappWebhookSchema = z.object({
  messaging_product: z.string(),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      value: z.object({
        messaging_product: z.string(),
        messages: z.array(z.any()).optional(),
      }),
    })),
  })),
});

export const whatsappConnectSchema = z.object({
  businessId: z.string().min(1, "El businessId es requerido"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Número de teléfono inválido"),
  accessToken: z.string().min(1, "El accessToken es requerido"),
});

// Type exports para usar en TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type KnowledgeQueryInput = z.infer<typeof knowledgeQuerySchema>;
export type KnowledgeCreateInput = z.infer<typeof knowledgeCreateSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
export type ImproveDescriptionInput = z.infer<typeof improveDescriptionSchema>;
export type MetricsQueryInput = z.infer<typeof metricsQuerySchema>;

