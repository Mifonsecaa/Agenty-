import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { analyzeMenuConsistency, buildCanonicalMenuText, extractMenuEntries, hasMenuLikeSignals } from "@/lib/rag/menu-precision";

type AgenticMenuInput = {
  rawText?: string;
  binaryBuffer?: Buffer;
  mimeType?: string;
  fileName?: string;
};

type ScoredCandidate = {
  source: string;
  text: string;
  canonical: string;
  score: number;
  entriesCount: number;
  conflicts: number;
};

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

function normalizeText(value?: string) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\u0000/g, "")
    .trim();
}

function scoreMenuCandidate(text: string, source: string): ScoredCandidate | null {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  const entries = extractMenuEntries(normalized);
  if (entries.length < 3) return null;

  const report = analyzeMenuConsistency(normalized);
  const sections = new Set(entries.map((e) => (e.section || "General").toLowerCase())).size;
  const score = entries.length * 3 + sections * 2 - report.conflicts.length * 8;

  return {
    source,
    text: normalized,
    canonical: buildCanonicalMenuText(entries),
    score,
    entriesCount: entries.length,
    conflicts: report.conflicts.length,
  };
}

async function extractWithOpenAiFromText(rawText: string, fileName?: string) {
  if (!openaiClient) return "";

  const prompt = `Extrae menu/precios con maxima fidelidad desde este texto.
Reglas:
1) No inventes ni normalices precios.
2) No mezcles columnas ni secciones.
3) Si no lees un precio, omite el item.
4) Salida SOLO en formato:
[SECCION: nombre]
producto | precio

Archivo: ${fileName || "documento"}
Texto:
${rawText.slice(0, 18000)}
`;

  try {
    const res = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 1400,
    });
    return normalizeText(res.choices[0]?.message?.content || "");
  } catch (error) {
    console.warn("[AgenticMenu] OpenAI text extraction failed:", error);
    return "";
  }
}

async function extractWithOpenAiFromImage(buffer: Buffer, mimeType: string, fileName?: string) {
  if (!openaiClient || !mimeType.startsWith("image/")) return "";
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const instruction = `Transcribe menu con precision maxima.
Salida SOLO:
[SECCION: nombre]
producto | precio
No inventes ni normalices.
Archivo: ${fileName || "imagen"}`;

  try {
    const res = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: instruction },
            { type: "image_url", image_url: { url: dataUri } },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 1400,
    });
    return normalizeText(res.choices[0]?.message?.content || "");
  } catch (error) {
    console.warn("[AgenticMenu] OpenAI image extraction failed:", error);
    return "";
  }
}

async function extractWithGeminiFromBinary(buffer: Buffer, mimeType: string, fileName?: string) {
  if (!geminiClient) return "";
  try {
    const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      `Extrae menu/precios con precision maxima.
Reglas:
1) No inventes ni normalices precios.
2) Mantén secciones.
3) Salida SOLO:
[SECCION: nombre]
producto | precio
Archivo: ${fileName || "documento"}
`,
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType,
        },
      },
    ]);
    return normalizeText(result.response.text() || "");
  } catch (error) {
    console.warn("[AgenticMenu] Gemini binary extraction failed:", error);
    return "";
  }
}

export async function buildBestAgenticMenuContext(input: AgenticMenuInput) {
  const rawText = normalizeText(input.rawText);
  const mimeType = normalizeText(input.mimeType || "application/octet-stream").split(";")[0];
  const fileName = input.fileName;
  const buffer = input.binaryBuffer;

  const candidates: ScoredCandidate[] = [];

  if (rawText && hasMenuLikeSignals(rawText)) {
    const c = scoreMenuCandidate(rawText, "raw_text");
    if (c) candidates.push(c);
  }

  if (rawText) {
    const openAiText = await extractWithOpenAiFromText(rawText, fileName);
    const c = scoreMenuCandidate(openAiText, "openai_text");
    if (c) candidates.push(c);
  }

  if (buffer && mimeType.startsWith("image/")) {
    const openAiImage = await extractWithOpenAiFromImage(buffer, mimeType, fileName);
    const c1 = scoreMenuCandidate(openAiImage, "openai_image");
    if (c1) candidates.push(c1);
  }

  if (buffer && (mimeType.startsWith("image/") || mimeType.includes("pdf"))) {
    const geminiBinary = await extractWithGeminiFromBinary(buffer, mimeType || "application/pdf", fileName);
    const c2 = scoreMenuCandidate(geminiBinary, "gemini_binary");
    if (c2) candidates.push(c2);
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  return {
    source: best.source,
    canonicalText: best.canonical,
    entriesCount: best.entriesCount,
    conflicts: best.conflicts,
    score: best.score,
  };
}

