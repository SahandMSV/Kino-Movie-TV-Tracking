import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { completeTraktConnection } from "@/lib/integrations/trakt";

const STATE_COOKIE = "kino_trakt_oauth_state";

function redirectToSettings(request: Request, status: string): NextResponse {
  return NextResponse.redirect(new URL(`/settings?trakt=${status}`, request.url));
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return redirectToSettings(request, "unauthorized");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get(STATE_COOKIE)?.value;

  const responseStatus = error
    ? "denied"
    : !code
      ? "missing_code"
      : !returnedState || !storedState || returnedState !== storedState
        ? "invalid_state"
        : null;

  cookieStore.delete(STATE_COOKIE);

  if (responseStatus) {
    return redirectToSettings(request, responseStatus);
  }

  try {
    await completeTraktConnection(session.user.id, code);
    return redirectToSettings(request, "connected");
  } catch (error) {
    console.error("Trakt OAuth callback error:", error);
    return redirectToSettings(request, "error");
  }
}
