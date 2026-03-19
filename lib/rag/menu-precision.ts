export type MenuEntry = {
  section: string;
  item: string;
  price: string;
};

function normalizeWhitespace(value: string) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function sanitizeSection(value: string) {
  return normalizeWhitespace(value)
    .replace(/^\[?\s*SECCI[OÓ]N\s*:\s*/i, "")
    .replace(/\]$/, "")
    .replace(/^[-•*]\s*/, "")
    .trim();
}

function looksLikeNoiseLine(value: string) {
  const line = normalizeWhitespace(value).toLowerCase();
  if (!line) return true;
  return (
    line === "menu" ||
    line === "menú" ||
    line.includes("panaderia y reposteria") ||
    line.includes("panadería y repostería")
  );
}

function detectPrice(line: string) {
  const source = normalizeWhitespace(line);
  if (!source) return null;

  const direct = source.match(/([$€£]\s?\d+(?:[.,]\d{1,2})?)/);
  if (direct) {
    return {
      price: direct[1].trim(),
      item: source.replace(direct[1], "").replace(/[|:-]\s*$/, "").trim(),
    };
  }

  const trailing = source.match(/(.+?)\s+(\d+(?:[.,]\d{1,2})?\s?(?:usd|eur|mxn|cop|s\/))/i);
  if (trailing) {
    return {
      item: trailing[1].trim(),
      price: trailing[2].trim(),
    };
  }

  return null;
}

function maybeSectionHeading(line: string) {
  const raw = normalizeWhitespace(line);
  if (!raw) return null;
  const cleaned = raw.replace(/^[\-•*]\s*/, "");
  const noAccents = cleaned.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const alphaOnly = noAccents.replace(/[^A-Za-z ]/g, "").trim();
  const isUpper = alphaOnly.length > 2 && alphaOnly === alphaOnly.toUpperCase();
  const hasNoPrice = !detectPrice(cleaned);
  const shortEnough = cleaned.length <= 32;

  if (isUpper && hasNoPrice && shortEnough) {
    return cleaned;
  }
  return null;
}

export function hasMenuLikeSignals(text: string) {
  const value = normalizeWhitespace(text).toLowerCase();
  if (!value) return false;
  return /(menu|menú|panader[ií]a|pasteles|postres|bebidas|precio|carta)/i.test(value);
}

export function extractMenuEntries(text: string): MenuEntry[] {
  const lines = normalizeWhitespace(text)
    .split("\n")
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);

  const entries: MenuEntry[] = [];
  let currentSection = "General";

  for (const originalLine of lines) {
    if (looksLikeNoiseLine(originalLine)) continue;

    const sectionMarker = originalLine.match(/^\[?\s*SECCI[OÓ]N\s*:\s*(.+?)\]?$/i);
    if (sectionMarker?.[1]) {
      currentSection = sanitizeSection(sectionMarker[1]) || currentSection;
      continue;
    }

    const heading = maybeSectionHeading(originalLine);
    if (heading) {
      currentSection = sanitizeSection(heading) || currentSection;
      continue;
    }

    // Formato preferido: "producto | $precio"
    if (originalLine.includes("|")) {
      const [left, right] = originalLine.split("|").map((part) => normalizeWhitespace(part));
      if (left && right) {
        const parsedRight = detectPrice(right);
        const parsedLeft = detectPrice(left);
        if (parsedRight?.price) {
          entries.push({ section: currentSection, item: left, price: parsedRight.price });
          continue;
        }
        if (parsedLeft?.price && right) {
          entries.push({ section: currentSection, item: right, price: parsedLeft.price });
          continue;
        }
      }
    }

    // Formato común OCR: "Producto ... $15"
    const detected = detectPrice(originalLine);
    if (detected?.item && detected?.price) {
      const item = detected.item.replace(/[.\-:]+$/, "").trim();
      if (item.length >= 2) {
        entries.push({
          section: currentSection,
          item,
          price: detected.price,
        });
      }
    }
  }

  // Deduplicación estable por sección+item
  const byKey = new Map<string, MenuEntry>();
  for (const entry of entries) {
    const key = `${entry.section.toLowerCase()}::${entry.item.toLowerCase()}`;
    if (!byKey.has(key)) {
      byKey.set(key, entry);
    }
  }

  return Array.from(byKey.values());
}

export function buildCanonicalMenuText(entries: MenuEntry[]) {
  if (!entries.length) return "";
  const grouped = new Map<string, MenuEntry[]>();
  for (const entry of entries) {
    const section = entry.section || "General";
    const bucket = grouped.get(section) || [];
    bucket.push(entry);
    grouped.set(section, bucket);
  }

  const sections = Array.from(grouped.keys());
  const chunks: string[] = [];
  for (const section of sections) {
    chunks.push(`[SECCION: ${section}]`);
    const rows = grouped.get(section) || [];
    for (const row of rows) {
      chunks.push(`${row.item} | ${row.price}`);
    }
    chunks.push("");
  }

  return chunks.join("\n").trim();
}

function normalizeMenuKey(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function intersectMenuEntries(primary: MenuEntry[], secondary: MenuEntry[]) {
  if (!primary.length || !secondary.length) return [];

  const secondaryByKey = new Set(
    secondary.map((entry) => `${normalizeMenuKey(entry.item)}::${normalizeMenuKey(entry.price)}`)
  );

  return primary.filter((entry) =>
    secondaryByKey.has(`${normalizeMenuKey(entry.item)}::${normalizeMenuKey(entry.price)}`)
  );
}

