"use server";

import { CHECK_RUNNERS, type CheckId, type HealthCheck } from "@/lib/status/checks";

export async function refreshCheckAction(id: CheckId): Promise<HealthCheck> {
  const runner = CHECK_RUNNERS[id];
  if (!runner) {
    return {
      id,
      name: id,
      description: "Unknown check",
      status: "down",
      latencyMs: null,
      message: `Unknown check: ${id}`,
    };
  }

  try {
    return await runner();
  } catch (err) {
    return {
      id,
      name: id,
      description: "Check failed",
      status: "down",
      latencyMs: null,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
