import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

type UploadKnowledgeFileParams = {
  buffer: Buffer;
  fileName: string;
  contentType?: string;
  businessId?: string;
};

type UploadKnowledgeFileResult = {
  publicUrl: string | null;
  provider: "supabase" | "none";
  path?: string;
  error?: string;
};

type ReplaceKnowledgeFileResult = {
  success: boolean;
  provider: "supabase" | "none";
  publicUrl?: string;
  path?: string;
  error?: string;
};

function sanitizeFileName(name: string) {
  return String(name || "archivo")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 180);
}

function getSupabaseStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function uploadKnowledgeFileToStorage({
  buffer,
  fileName,
  contentType,
  businessId,
}: UploadKnowledgeFileParams): Promise<UploadKnowledgeFileResult> {
  const client = getSupabaseStorageClient();
  if (!client) {
    return { publicUrl: null, provider: "none", error: "Supabase storage is not configured." };
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "knowledge-files";
  const safeName = sanitizeFileName(fileName);
  const prefix = businessId ? `business/${businessId}` : "business/unassigned";
  const path = `${prefix}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;

  const { error: uploadError } = await client.storage.from(bucket).upload(path, buffer, {
    contentType: contentType || "application/octet-stream",
    upsert: false,
    cacheControl: "31536000",
  });

  if (uploadError) {
    return {
      publicUrl: null,
      provider: "supabase",
      path,
      error: uploadError.message,
    };
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return {
    publicUrl: data?.publicUrl || null,
    provider: "supabase",
    path,
  };
}

function parseSupabasePublicUrl(publicUrl: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !publicUrl.startsWith(supabaseUrl)) return null;

  const u = new URL(publicUrl);
  const marker = "/storage/v1/object/public/";
  const idx = u.pathname.indexOf(marker);
  if (idx < 0) return null;

  const tail = u.pathname.slice(idx + marker.length);
  const slash = tail.indexOf("/");
  if (slash <= 0) return null;

  const bucket = decodeURIComponent(tail.slice(0, slash));
  const path = decodeURIComponent(tail.slice(slash + 1));
  if (!bucket || !path) return null;

  return { bucket, path };
}

export async function replaceKnowledgeFileByPublicUrl({
  publicUrl,
  buffer,
  contentType,
}: {
  publicUrl: string;
  buffer: Buffer;
  contentType?: string;
}): Promise<ReplaceKnowledgeFileResult> {
  const client = getSupabaseStorageClient();
  if (!client) {
    return { success: false, provider: "none", error: "Supabase storage is not configured." };
  }

  const parsed = parseSupabasePublicUrl(publicUrl);
  if (!parsed) {
    return { success: false, provider: "supabase", error: "Unsupported public URL for Supabase storage." };
  }

  const { error: uploadError } = await client.storage.from(parsed.bucket).upload(parsed.path, buffer, {
    contentType: contentType || "application/octet-stream",
    upsert: true,
    cacheControl: "0",
  });

  if (uploadError) {
    return {
      success: false,
      provider: "supabase",
      path: parsed.path,
      error: uploadError.message,
    };
  }

  const { data } = client.storage.from(parsed.bucket).getPublicUrl(parsed.path);
  return {
    success: true,
    provider: "supabase",
    path: parsed.path,
    publicUrl: data?.publicUrl || publicUrl,
  };
}

