export type PlannerAction = "ask_missing" | "confirm" | "append_row" | "update_cell" | "error";

export type PlannerState = {
  session_id?: string;
  stage?: string;
  reservation?: {
    date?: string | null;
    time?: string | null;
    people?: number | null;
    name?: string | null;
    notes?: string | null;
  };
  pending_action?: string | null;
  turn?: number;
  reask_count?: number;
  last_prompted_field?: string | null;
  max_reasks?: number;
  last_user_message?: string | null;
};

export type PlannerRequest = {
  context: Record<string, unknown>;
  message: string;
  state: PlannerState;
};

export type PlannerResponse = {
  action: PlannerAction;
  assistant_message: string;
  state: PlannerState;
  tool_payload?: Record<string, unknown>;
  reason?: string;
  guardrail_flags?: string[];
};

const DEFAULT_TIMEOUT_MS = Number(process.env.PLANNER_EXECUTOR_TIMEOUT_MS || 3500);

function parsePlannerResponse(raw: unknown): PlannerResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const action = data.action;
  const assistantMessage = data.assistant_message;
  const state = data.state;

  if (
    typeof action !== "string" ||
    !["ask_missing", "confirm", "append_row", "update_cell", "error"].includes(action) ||
    typeof assistantMessage !== "string" ||
    !state ||
    typeof state !== "object"
  ) {
    return null;
  }

  return {
    action: action as PlannerAction,
    assistant_message: assistantMessage,
    state: state as PlannerState,
    tool_payload: typeof data.tool_payload === "object" && data.tool_payload ? (data.tool_payload as Record<string, unknown>) : {},
    reason: typeof data.reason === "string" ? data.reason : "",
    guardrail_flags: Array.isArray(data.guardrail_flags)
      ? data.guardrail_flags.filter((v): v is string => typeof v === "string")
      : [],
  };
}

export async function callPlannerExecutor(payload: PlannerRequest): Promise<PlannerResponse | null> {
  const baseUrl = process.env.PLANNER_EXECUTOR_URL;
  const enabled = process.env.PLANNER_EXECUTOR_ENABLED !== "false";

  if (!enabled || !baseUrl) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/plan-execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    return parsePlannerResponse(json);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

