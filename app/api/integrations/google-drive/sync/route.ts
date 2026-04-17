import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorizeBusinessAccessSession } from "@/lib/auth";
import { markGoogleDriveSyncError, setGoogleDriveFolderForBusiness, syncDriveFolder } from "@/services/google-drive";

export async function POST(req: NextRequest) {
  let businessId = "";
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));
    businessId = String(body?.businessId || "").trim();
    const parentFolderId = String(body?.parentFolderId || "").trim();

    if (!businessId) {
      return NextResponse.json({ error: "businessId requerido" }, { status: 400 });
    }

    await authorizeBusinessAccessSession(session, businessId);

    if (parentFolderId) {
      await setGoogleDriveFolderForBusiness(businessId, parentFolderId);
    }

    const result = await syncDriveFolder(businessId, {
      parentFolderId: parentFolderId || undefined,
      reason: "manual",
    });

    return NextResponse.json({
      success: true,
      message: "Sincronizacion de Google Drive completada.",
      data: result,
    });
  } catch (error: any) {
    if (businessId) {
      await markGoogleDriveSyncError(businessId, error?.message || "SYNC_FAILED").catch(() => undefined);
    }
    return NextResponse.json({ error: error?.message || "Error sincronizando Google Drive" }, { status: 500 });
  }
}


