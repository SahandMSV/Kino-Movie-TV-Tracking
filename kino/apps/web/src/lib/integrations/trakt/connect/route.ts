import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { buildTraktAuthorizationUrl } from "@/lib/integrations/trakt";

const STATE_COOKIE = "kino_trakt_oauth_state";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/register", request.url));
  }

  try {
    const state = randomBytes(32).toString("base64url");
    const response = NextResponse.redirect(buildTraktAuthorizationUrl(state));

    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Trakt connect initialization error:", error);

    return NextResponse.redirect(new URL("/settings?trakt=configuration_error", request.url));
  }
}
