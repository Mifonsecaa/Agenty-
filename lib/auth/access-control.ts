import { prisma } from "@/lib/prisma";

const TRIAL_DAYS = Number(process.env.TRIAL_DAYS || 7);
const TRIAL_MAX_AGENTS = Number(process.env.TRIAL_MAX_AGENTS || 2);

export type CreationAccessDecision = {
  allowed: boolean;
  status: number;
  reason?: string;
  trialEndsAt?: Date | null;
  remainingDays?: number;
};

type AppUserRole = "ADMIN" | "USER";

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || "";
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function resolveRoleFromEmail(email: string): AppUserRole {
  const adminEmails = parseAdminEmails();
  return adminEmails.has(email.toLowerCase()) ? "ADMIN" : "USER";
}

export async function resolveRoleForNewUser(email: string): Promise<AppUserRole> {
  const explicitRole = resolveRoleFromEmail(email);
  if (explicitRole === "ADMIN") return "ADMIN";

  // Preview-friendly bootstrap: if no ADMIN exists yet, first user becomes ADMIN.
  try {
    const prismaAny = prisma as any;
    const existingAdmin = await prismaAny.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
    return existingAdmin ? "USER" : "ADMIN";
  } catch {
    // If role column is not migrated yet, keep safe default USER.
    return "USER";
  }
}

function buildTrialWindow() {
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  return { startedAt, endsAt };
}

export function createTrialWindow() {
  return buildTrialWindow();
}

export async function enforceAgentCreationPolicy(userId: string, email?: string | null): Promise<CreationAccessDecision> {
  const prismaAny = prisma as any;

  let user: any;
  try {
    user = await prismaAny.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        trialStartedAt: true,
        trialEndsAt: true,
        businesses: { select: { id: true } },
      },
    });
  } catch {
    // DB schema not migrated yet in preview: don't block creation to avoid hard downtime.
    return { allowed: true, status: 200 };
  }

  if (!user) {
    return { allowed: false, status: 404, reason: "Usuario no encontrado" };
  }

  const adminEmails = parseAdminEmails();
  const emailIsAdmin = !!email && adminEmails.has(email.toLowerCase());

  if (user.role === "ADMIN" || emailIsAdmin) {
    return { allowed: true, status: 200 };
  }

  let trialStartedAt = user.trialStartedAt;
  let trialEndsAt = user.trialEndsAt;

  if (!trialStartedAt || !trialEndsAt) {
    const trial = buildTrialWindow();
    trialStartedAt = trial.startedAt;
    trialEndsAt = trial.endsAt;

    await prismaAny.user.update({
      where: { id: userId },
      data: {
        trialStartedAt,
        trialEndsAt,
      },
    });
  }

  const now = new Date();
  const remainingDays = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

  if (now > trialEndsAt) {
    return {
      allowed: false,
      status: 403,
      reason: "Tu trial de 7 dias ha expirado. Contacta al admin para activar acceso.",
      trialEndsAt,
      remainingDays,
    };
  }

  if (user.businesses.length >= TRIAL_MAX_AGENTS) {
    return {
      allowed: false,
      status: 403,
      reason: `Limite alcanzado para trial: maximo ${TRIAL_MAX_AGENTS} agentes.`,
      trialEndsAt,
      remainingDays,
    };
  }

  return {
    allowed: true,
    status: 200,
    trialEndsAt,
    remainingDays,
  };
}
