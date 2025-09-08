import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ['/', '/login', '/signup', '/news-letter', '/newsletter'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl.clone();

  // Skip public paths and static assets
  const isPublicAsset =
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico)$/);

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // ✅ Handle special redirect for newsletter slug
  if (url.pathname === "/news-letter" && url.searchParams.get("slug") === "vo2025w362") {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/newsletter";
    redirectUrl.searchParams.set("slug", "vo2025w3537");
    return NextResponse.redirect(redirectUrl);
  }

  // ✅ Allow all routes that START with a public path
  const isPublicPath = publicPaths.some(path => url.pathname.startsWith(path));

  if (!token && !isPublicPath) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // ✅ Prevent logged-in users from visiting login/signup (but NOT newsletter)
  if (token && ['/', '/login', '/signup'].includes(url.pathname)) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'],
};
