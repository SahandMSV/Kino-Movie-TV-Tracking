import "server-only";

import { MongoClient } from "mongodb";
import { connectMongoose } from "@/lib/db/mongoose";
import { tmdbFetch } from "@/lib/tmdb/client";

export type CheckStatus = "operational" | "degraded" | "down";

export type HealthCheck = {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  latencyMs: number | null;
  message?: string;
  details?: Record<string, string | number | boolean | null>;
};

async function time<T>(fn: () => Promise<T>): Promise<{ result?: T; ms: number; error?: unknown }> {
  const start = performance.now();
  try {
    const result = await fn();
    return { result, ms: Math.round(performance.now() - start) };
  } catch (error) {
    return { ms: Math.round(performance.now() - start), error };
  }
}

export async function checkMongo(): Promise<HealthCheck> {
  const id = "mongodb";
  const name = "MongoDB";
  const description = "Primary database (User, WatchEntry, sessions)";

  if (!process.env.MONGODB_URI) {
    return {
      id,
      name,
      description,
      status: "down",
      latencyMs: null,
      message: "MONGODB_URI is not set",
    };
  }

  const { ms, error } = await time(async () => {
    const client = new MongoClient(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 4000,
    });
    await client.connect();
    await client.db().command({ ping: 1 });
    await client.close();
  });

  if (error) {
    return {
      id,
      name,
      description,
      status: "down",
      latencyMs: ms,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }

  return {
    id,
    name,
    description,
    status: ms > 800 ? "degraded" : "operational",
    latencyMs: ms,
    message: ms > 800 ? "High latency" : "Connected",
  };
}

export async function checkMongoose(): Promise<HealthCheck> {
  const id = "mongoose";
  const name = "Mongoose";
  const description = "ODM connection used by models & server actions";

  const { ms, error } = await time(async () => {
    await connectMongoose();
  });

  if (error) {
    return {
      id,
      name,
      description,
      status: "down",
      latencyMs: ms,
      message: error instanceof Error ? error.message : "Failed to connect",
    };
  }

  return {
    id,
    name,
    description,
    status: ms > 800 ? "degraded" : "operational",
    latencyMs: ms,
    message: "Ready",
  };
}

export async function checkTmdb(): Promise<HealthCheck> {
  const id = "tmdb";
  const name = "TMDB API";
  const description = "Movie / TV metadata, search, images, videos";

  if (!process.env.TMDB_ACCESS_TOKEN) {
    return {
      id,
      name,
      description,
      status: "down",
      latencyMs: null,
      message: "TMDB_ACCESS_TOKEN is not set",
    };
  }

  const { ms, error } = await time(async () => {
    await tmdbFetch({
      path: "/configuration",
      next: { revalidate: 0 },
    });
  });

  if (error) {
    return {
      id,
      name,
      description,
      status: "down",
      latencyMs: ms,
      message: error instanceof Error ? error.message.slice(0, 160) : "Request failed",
    };
  }

  return {
    id,
    name,
    description,
    status: ms > 1200 ? "degraded" : "operational",
    latencyMs: ms,
    message: ms > 1200 ? "High latency" : "Reachable",
  };
}

export async function checkAuth(): Promise<HealthCheck> {
  const id = "auth";
  const name = "Auth.js";
  const description = "Credentials provider + JWT sessions";

  const missing: string[] = [];
  if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    missing.push("AUTH_SECRET");
  }
  if (!process.env.MONGODB_URI) {
    missing.push("MONGODB_URI (adapter)");
  }

  if (missing.length > 0) {
    return {
      id,
      name,
      description,
      status: "down",
      latencyMs: null,
      message: `Missing: ${missing.join(", ")}`,
    };
  }

  return {
    id,
    name,
    description,
    status: "operational",
    latencyMs: null,
    message: "Configured (Credentials + JWT + MongoDB adapter)",
    details: {
      trustHost: process.env.AUTH_TRUST_HOST === "true" || true,
      strategy: "jwt",
    },
  };
}

export async function checkEnv(): Promise<HealthCheck> {
  const id = "env";
  const name = "Environment";
  const description = "Required runtime configuration";

  const required = ["MONGODB_URI", "TMDB_ACCESS_TOKEN", "AUTH_SECRET"];
  const present = required.filter(
    key => !!process.env[key] || (key === "AUTH_SECRET" && !!process.env.NEXTAUTH_SECRET),
  );
  const missing = required.length - present.length;

  return {
    id,
    name,
    description,
    status: missing === 0 ? "operational" : missing === required.length ? "down" : "degraded",
    latencyMs: null,
    message:
      missing === 0 ? "All required variables present" : `Missing ${missing} required variable(s)`,
    details: {
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      hasTmdbKey: !!process.env.TMDB_API_KEY,
      hasTmdbToken: !!process.env.TMDB_ACCESS_TOKEN,
    },
  };
}

export async function checkRuntime(): Promise<HealthCheck> {
  const id = "runtime";
  const name = "Runtime";
  const description = "Node.js process & memory";

  const mem = process.memoryUsage();

  return {
    id,
    name,
    description,
    status: "operational",
    latencyMs: null,
    message: `Node ${process.version}`,
    details: {
      pid: process.pid,
      uptimeSec: Math.round(process.uptime()),
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    },
  };
}

export const CHECK_RUNNERS = {
  env: checkEnv,
  mongodb: checkMongo,
  mongoose: checkMongoose,
  tmdb: checkTmdb,
  auth: checkAuth,
  runtime: checkRuntime,
} as const;

export type CheckId = keyof typeof CHECK_RUNNERS;

export async function runAllChecks(): Promise<HealthCheck[]> {
  const results = await Promise.allSettled([
    checkEnv(),
    checkMongo(),
    checkMongoose(),
    checkTmdb(),
    checkAuth(),
    checkRuntime(),
  ]);

  return results.map((result, i) => {
    if (result.status === "fulfilled") return result.value;

    const ids = ["env", "mongodb", "mongoose", "tmdb", "auth", "runtime"] as const;
    return {
      id: ids[i],
      name: ids[i],
      description: "Check failed unexpectedly",
      status: "down" as const,
      latencyMs: null,
      message: result.reason instanceof Error ? result.reason.message : "Unknown error",
    };
  });
}
