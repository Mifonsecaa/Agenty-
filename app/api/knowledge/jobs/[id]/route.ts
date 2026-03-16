import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getKnowledgeJob } from "@/lib/rag/queue";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const job = await getKnowledgeJob(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const business = await prisma.business.findFirst({
      where: {
        id: job.businessId,
        user: { email: session.user.email },
      },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: job.id,
        status: job.status,
        attempts: job.attempts,
        maxAttempts: job.maxAttempts,
        chunkCount: job.chunkCount ?? 0,
        lastError: job.lastError || null,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
      },
    });
  } catch (error) {
    console.error("[API Knowledge Job] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

