export const KNOWLEDGE_LAYERS = ["products", "operations", "general"] as const;

export type RetrievalLayer = (typeof KNOWLEDGE_LAYERS)[number];

export function normalizeKnowledgeLayer(value?: string | RetrievalLayer): RetrievalLayer {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "products" || normalized === "producto" || normalized === "productos") return "products";
  if (normalized === "operations" || normalized === "operacion" || normalized === "operaciones") return "operations";
  return "general";
}

export function classifyQueryLayer(query: string): RetrievalLayer {
  const text = String(query || "").toLowerCase();

  if (/(precio|precios|costo|costos|valor|menu|men\u00fa|carta|catalogo|cat\u00e1logo|producto|productos|stock|inventario|promocion|promoci\u00f3n)/i.test(text)) {
    return "products";
  }

  if (/(horario|horarios|reserva|reservar|agenda|turno|entrega|envio|env\u00edo|domicilio|politica|pol\u00edtica|devolucion|devoluci\u00f3n|metodo de pago|metodos de pago|factura|soporte|contacto)/i.test(text)) {
    return "operations";
  }

  return "general";
}

export function inferLayerFromMetadata(metadata: Record<string, unknown>): RetrievalLayer {
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.map((x) => String(x || "")).join(" ")
    : String(metadata.tags || "");
  const fileName = String(metadata.fileName || metadata.title || "");
  const source = String(metadata.source || "");
  const all = `${tags} ${fileName} ${source}`.toLowerCase();

  return classifyQueryLayer(all);
}

