type CounterMap = Map<string, number>;

type DurationStats = {
  count: number;
  totalMs: number;
  maxMs: number;
};

type DurationMap = Map<string, DurationStats>;

const counters: CounterMap = new Map();
const durations: DurationMap = new Map();

function round(value: number, precision = 2) {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

export function incrementOpsCounter(name: string, value = 1) {
  counters.set(name, (counters.get(name) || 0) + value);
}

export function recordOpsDuration(name: string, durationMs: number) {
  const current = durations.get(name) || { count: 0, totalMs: 0, maxMs: 0 };
  current.count += 1;
  current.totalMs += durationMs;
  current.maxMs = Math.max(current.maxMs, durationMs);
  durations.set(name, current);
}

export function getOpsMetricsSnapshot() {
  const countersObj: Record<string, number> = {};
  for (const [key, value] of counters.entries()) {
    countersObj[key] = value;
  }

  const durationsObj: Record<string, { count: number; avgMs: number; maxMs: number }> = {};
  for (const [key, value] of durations.entries()) {
    durationsObj[key] = {
      count: value.count,
      avgMs: value.count > 0 ? round(value.totalMs / value.count) : 0,
      maxMs: round(value.maxMs),
    };
  }

  return {
    counters: countersObj,
    durations: durationsObj,
    generatedAt: new Date().toISOString(),
  };
}

