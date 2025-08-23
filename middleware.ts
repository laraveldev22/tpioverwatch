import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ['/', '/login', '/signup', '/news-letter'];

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

  // ✅ Allow all routes that START with a public path
  const isPublicPath = publicPaths.some(path => url.pathname.startsWith(path));

  if (!token && !isPublicPath) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // ✅ Prevent logged-in users from visiting login/signup (but NOT /news-letter)
  if (token && ['/','/login','/signup'].includes(url.pathname)) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'],
};
