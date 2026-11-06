import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "saritelkayam.com";
const WWW_HOST = `www.${CANONICAL_HOST}`;

/**
 * Permanent redirect apex canonical host. If www is still behind Cloudflare Access
 * while apex is public, align Access policies at the edge; this runs only once
 * the request reaches the app.
 */
export function middleware(request: NextRequest) {
  const rawHost =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host") ??
    "";

  const hostname = rawHost.split(":")[0]?.toLowerCase();
  if (hostname !== WWW_HOST) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.hostname = CANONICAL_HOST;
  url.port = "";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    /*
     * All paths except Next internals and static assets so redirects stay cheap.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
