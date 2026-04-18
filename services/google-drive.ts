import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { ingestionService } from "@/lib/rag/ingestion";

type GoogleDriveTokenPayload = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scope?: string;
};

type DriveSyncParams = {
  parentFolderId?: string;
  reason?: "manual" | "webhook" | "queue_webhook";
};

type DriveSyncResult = {
  scannedFiles: number;
  ingestedFiles: number;
  skippedFiles: number;
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  md5Checksum?: string;
  size?: string;
  headRevisionId?: string;
  webViewLink?: string;
  parents?: string[];
};

type GoogleDriveConfig = {
  connected?: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  scope?: string;
  parentFolderId?: string;
  lastSyncedAt?: string;
  lastSyncReason?: string;
  lastSyncError?: string;
};

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function getGoogleDriveConfigFromBusinessConfig(config: unknown): GoogleDriveConfig {
  const root = asObject(config);
  const integration = asObject(root.googleDrive);
  return {
    connected: Boolean(integration.connected),
    accessToken: typeof integration.accessToken === "string" ? integration.accessToken : "",
    refreshToken: typeof integration.refreshToken === "string" ? integration.refreshToken : "",
    expiresAt: typeof integration.expiresAt === "string" ? integration.expiresAt : "",
    scope: typeof integration.scope === "string" ? integration.scope : "",
    parentFolderId: typeof integration.parentFolderId === "string" ? integration.parentFolderId : "",
    lastSyncedAt: typeof integration.lastSyncedAt === "string" ? integration.lastSyncedAt : "",
    lastSyncReason: typeof integration.lastSyncReason === "string" ? integration.lastSyncReason : "",
    lastSyncError: typeof integration.lastSyncError === "string" ? integration.lastSyncError : "",
  };
}

async function updateBusinessGoogleDriveConfig(
  businessId: string,
  updater: (current: GoogleDriveConfig, rawConfig: Record<string, unknown>) => GoogleDriveConfig
) {
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, config: true } });
  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const rawConfig = asObject(business.config);
  const current = getGoogleDriveConfigFromBusinessConfig(rawConfig);
  const next = updater(current, rawConfig);

  const nextConfig = {
    ...rawConfig,
    googleDrive: {
      ...next,
    },
  };

  await prisma.business.update({
    where: { id: businessId },
    data: { config: nextConfig },
  });

  return next;
}

function shouldRefreshToken(config: GoogleDriveConfig) {
  if (!config.expiresAt) return false;
  const expiresMs = new Date(config.expiresAt).getTime();
  if (!Number.isFinite(expiresMs)) return false;
  return expiresMs - Date.now() <= 60_000;
}

async function refreshDriveAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("GOOGLE_DRIVE_OAUTH_NOT_CONFIGURED");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });

  const data = await tokenRes.json().catch(() => ({} as any));
  if (!tokenRes.ok || !data?.access_token) {
    throw new Error(data?.error_description || data?.error || "GOOGLE_TOKEN_REFRESH_FAILED");
  }

  const expiresIn = Number(data.expires_in || 3600);
  return {
    accessToken: String(data.access_token),
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    scope: typeof data.scope === "string" ? data.scope : undefined,
  };
}

async function ensureValidAccessToken(businessId: string) {
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, config: true } });
  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const config = getGoogleDriveConfigFromBusinessConfig(business.config);
  if (!config.connected || !config.accessToken) {
    throw new Error("GOOGLE_DRIVE_NOT_CONNECTED");
  }

  if (!shouldRefreshToken(config)) {
    return {
      accessToken: config.accessToken,
      parentFolderId: config.parentFolderId || "",
    };
  }

  if (!config.refreshToken) {
    return {
      accessToken: config.accessToken,
      parentFolderId: config.parentFolderId || "",
    };
  }

  const refreshed = await refreshDriveAccessToken(config.refreshToken);
  await updateBusinessGoogleDriveConfig(businessId, (current) => ({
    ...current,
    connected: true,
    accessToken: refreshed.accessToken,
    expiresAt: refreshed.expiresAt,
    scope: refreshed.scope || current.scope,
    lastSyncError: "",
  }));

  return {
    accessToken: refreshed.accessToken,
    parentFolderId: config.parentFolderId || "",
  };
}

async function listFolderFiles(accessToken: string, parentFolderId?: string) {
  const q = parentFolderId
    ? `'${parentFolderId}' in parents and trashed = false`
    : "trashed = false";

  const params = new URLSearchParams({
    pageSize: "200",
    q,
    fields: "files(id,name,mimeType,modifiedTime,md5Checksum,size,headRevisionId,webViewLink,parents)",
    includeItemsFromAllDrives: "true",
    supportsAllDrives: "true",
    orderBy: "modifiedTime desc",
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) {
    throw new Error(data?.error?.message || "GOOGLE_DRIVE_LIST_FAILED");
  }

  const files = Array.isArray(data?.files) ? (data.files as DriveFile[]) : [];
  return files;
}

function buildContentHash(file: DriveFile) {
  const hashBase = [
    file.id,
    file.md5Checksum || "",
    file.modifiedTime || "",
    file.size || "",
    file.headRevisionId || "",
  ].join("|");
  return createHash("sha256").update(hashBase).digest("hex");
}

async function shouldIngestFile(businessId: string, sourceId: string, contentHash: string) {
  const row = await prisma.knowledgeItem.findFirst({
    where: {
      businessId,
      metadata: {
        path: ["sourceId"],
        equals: sourceId,
      },
    },
    orderBy: { createdAt: "desc" },
    select: { metadata: true },
  });

  if (!row?.metadata || typeof row.metadata !== "object" || Array.isArray(row.metadata)) {
    return true;
  }

  const currentHash = (row.metadata as Record<string, unknown>).contentHash;
  return currentHash !== contentHash;
}

async function downloadDriveFileText(accessToken: string, file: DriveFile) {
  const mimeType = file.mimeType || "";

  if (mimeType === "application/vnd.google-apps.folder") {
    return "";
  }

  const exportMap: Record<string, string> = {
    "application/vnd.google-apps.document": "text/plain",
    "application/vnd.google-apps.spreadsheet": "text/csv",
    "application/vnd.google-apps.presentation": "text/plain",
  };

  let url = "";
  if (exportMap[mimeType]) {
    const params = new URLSearchParams({ mimeType: exportMap[mimeType] });
    url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}/export?${params.toString()}`;
  } else {
    url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return "";
  }

  const contentType = res.headers.get("content-type") || "";
  if (
    !contentType.includes("text/") &&
    !contentType.includes("json") &&
    !contentType.includes("csv") &&
    !contentType.includes("xml") &&
    !contentType.includes("javascript")
  ) {
    return "";
  }

  const text = await res.text();
  return String(text || "").trim();
}

export async function saveGoogleDriveTokensForBusiness(
  businessId: string,
  payload: GoogleDriveTokenPayload & { parentFolderId?: string }
) {
  return updateBusinessGoogleDriveConfig(businessId, (current) => ({
    ...current,
    connected: true,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken || current.refreshToken,
    expiresAt: payload.expiresAt || current.expiresAt,
    scope: payload.scope || current.scope,
    parentFolderId: payload.parentFolderId || current.parentFolderId,
    lastSyncError: "",
  }));
}

export async function setGoogleDriveFolderForBusiness(businessId: string, parentFolderId: string) {
  return updateBusinessGoogleDriveConfig(businessId, (current) => ({
    ...current,
    parentFolderId,
  }));
}

export async function syncDriveFolder(businessId: string, params: DriveSyncParams = {}): Promise<DriveSyncResult> {
  const auth = await ensureValidAccessToken(businessId);
  const parentFolderId = params.parentFolderId || auth.parentFolderId || "";
  const files = await listFolderFiles(auth.accessToken, parentFolderId || undefined);

  let ingestedFiles = 0;
  let skippedFiles = 0;

  for (const file of files) {
    const sourceId = `google-drive:${file.id}`;
    const contentHash = buildContentHash(file);

    const shouldIngest = await shouldIngestFile(businessId, sourceId, contentHash);
    if (!shouldIngest) {
      skippedFiles += 1;
      continue;
    }

    const text = await downloadDriveFileText(auth.accessToken, file);
    if (!text) {
      skippedFiles += 1;
      continue;
    }

    const fileUrl = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;
    await ingestionService.ingestText(businessId, text, {
      source: "google_drive",
      sourceId,
      fileName: file.name,
      fileType: file.mimeType,
      fileUrl,
      driveFileId: file.id,
      driveRevisionId: file.headRevisionId || "",
      parentFolderId: file.parents?.[0] || parentFolderId || "",
      contentHash,
      syncedFrom: "google_drive",
    });

    ingestedFiles += 1;
  }

  await updateBusinessGoogleDriveConfig(businessId, (current) => ({
    ...current,
    connected: true,
    parentFolderId: parentFolderId || current.parentFolderId,
    lastSyncedAt: new Date().toISOString(),
    lastSyncReason: params.reason || "manual",
    lastSyncError: "",
  }));

  return {
    scannedFiles: files.length,
    ingestedFiles,
    skippedFiles,
  };
}

export async function markGoogleDriveSyncError(businessId: string, errorMessage: string) {
  await updateBusinessGoogleDriveConfig(businessId, (current) => ({
    ...current,
    lastSyncError: errorMessage,
    lastSyncReason: "error",
  }));
}

