import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Get token from cookie (most reliable for middleware)
  const token = request.cookies.get("auth_token")?.value;

  console.log("Middleware - Path:", request.nextUrl.pathname);
  console.log("Middleware - Token exists:", !!token);

  // Protected routes that require authentication
  const protectedPaths = [
    "/",
    "/profile",
    "/messages",
    "/friends",
    "/groups",
    "/notifications",
    "/settings",
    "/search",
  ];

  // Auth routes that should redirect authenticated users
  const authPaths = ["/login", "/register"];

  const { pathname } = request.nextUrl;

  // Skip middleware for certain paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/.well-known")
  ) {
    return NextResponse.next();
  }

  // Check if current path is a protected route
  const isProtectedRoute = protectedPaths.some((path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  });

  // Check if current path is an auth route
  const isAuthRoute = authPaths.some((path) => pathname.startsWith(path));

  // If user has token and tries to access auth pages, redirect to home
  if (token && isAuthRoute) {
    console.log(
      "Middleware - Redirecting authenticated user from auth page to home"
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user doesn't have token and tries to access protected routes, redirect to login
  if (!token && isProtectedRoute) {
    console.log("Middleware - Redirecting unauthenticated user to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow all other requests to proceed
  console.log("Middleware - Allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
