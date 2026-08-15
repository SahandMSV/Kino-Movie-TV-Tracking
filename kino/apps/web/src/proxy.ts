import { NextRequest, NextResponse } from "next/server";

function getHostname(request: NextRequest): string {
  const host = request.headers.get("host") ?? "";
  return host.split(":")[0];
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = getHostname(request);
  const onStatus = hostname === "status.localhost";

  // Already on the internal status route → do nothing
  if (pathname === "/status" || pathname.startsWith("/status/")) {
    if (!onStatus) {
      // Block /status on the main domain
      return NextResponse.rewrite(new URL("/__status-not-found", request.url));
    }
    return NextResponse.next();
  }

  if (onStatus) {
    // Only rewrite the root (and plain paths) once
    if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/status" : `/status${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
