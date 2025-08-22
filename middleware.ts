// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ['/', '/login', '/signup'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl.clone();

  // Skip public paths and static assets
  const isPublicAsset =
    url.pathname.startsWith('/_next/') || // Next.js static files
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/images/') || // if you have /public/images/
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico)$/); // all public images

  if (isPublicAsset) {
    return NextResponse.next();
  }

  if (!token && !publicPaths.includes(url.pathname)) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (token && publicPaths.includes(url.pathname)) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'], // apply middleware to all pages except API routes
};
