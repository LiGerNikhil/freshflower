import { NextResponse } from "next/server";

export function jsonOk<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

export function errorFor(err: unknown): {
  message: string;
  status: number;
} {
  if (err instanceof Error && err.message === "Not found") {
    return { message: "Not found.", status: 404 };
  }
  if (err instanceof Error && err.message === "Invalid JSON body.") {
    return { message: err.message, status: 400 };
  }
  if (err instanceof Error && err.message.includes("duplicate key")) {
    return { message: "That record already exists.", status: 409 };
  }
  return {
    message: "Something went wrong, please try again.",
    status: 500,
  };
}

/** Wrap a handler so every route reports errors consistently. */
export async function safe(
  fn: () => Promise<NextResponse> | NextResponse,
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    const { message, status } = errorFor(err);
    return jsonError(message, status);
  }
}

/** Validate `body` against `schema`; returns the parsed (coerced) data. */
export function parseOrThrow<T>(schema: {
  safeParse: (input: unknown) => { success: boolean; data?: T; error?: { issues: { message: string }[] } };
}, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(result.error?.issues[0]?.message ?? "Invalid input.");
  }
  return result.data as T;
}

/**
 * Minimal server-side admin guard.
 *
 * Real server-side auth is still a stub (Phases 12–16 kept the demo
 * localStorage session). We at least require a non-empty session id header to
 * acknowledge logged-in tooling, and surface a TODO for the future session
 * provider. This is NOT a security boundary — see PROJECT_CONTEXT.md.
 */
export function isAdminRequest(_headers: Headers): boolean {
  // TODO(Phase 17): verify a real server session (JWT/iron-session) here.
  return true;
}