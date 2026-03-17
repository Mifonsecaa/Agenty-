const MEDIA_TAG_REGEX = /\[MEDIA_URL:\s*([^\]]+)]/gi;
const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*]\(([^)]+)\)/gi;

function normalizeMediaUrl(rawUrl: string, baseUrl: string): string {
  const trimmed = rawUrl.trim().replace(/^['"]|['"]$/g, "");
  if (!trimmed) return "";

  // Si el modelo devuelve localhost, lo reescribimos al dominio público actual.
  if (/^https?:\/\/localhost(?::\d+)?\/uploads\//i.test(trimmed)) {
    const base = new URL(baseUrl);
    const uploadPath = trimmed.replace(/^https?:\/\/localhost(?::\d+)?/i, "");
    return new URL(uploadPath, base.origin).toString();
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return new URL(trimmed, baseUrl).toString();
  }

  if (trimmed.startsWith("uploads/")) {
    return new URL(`/${trimmed}`, baseUrl).toString();
  }

  return trimmed;
}

export function extractMediaFromAgentReply(reply: string, baseUrl?: string) {
  const resolvedBaseUrl = baseUrl || process.env.PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3001";
  const mediaUrls = new Set<string>();
  let cleanText = reply || "";

  cleanText = cleanText.replace(MEDIA_TAG_REGEX, (_, rawUrl: string) => {
    const normalized = normalizeMediaUrl(rawUrl, resolvedBaseUrl);
    if (normalized) mediaUrls.add(normalized);
    return "";
  });

  cleanText = cleanText.replace(MARKDOWN_IMAGE_REGEX, (_, rawUrl: string) => {
    const normalized = normalizeMediaUrl(rawUrl, resolvedBaseUrl);
    if (normalized) mediaUrls.add(normalized);
    return "";
  });

  return {
    cleanText: cleanText.trim(),
    mediaUrls: Array.from(mediaUrls),
  };
}



