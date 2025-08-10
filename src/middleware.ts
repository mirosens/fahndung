import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export function middleware(request: NextRequest) {
  // 🚀 OPTIMIERTE MIDDLEWARE FÜR SCHNELLERE NAVIGATION

  // Bestimme erlaubte Ursprung-Domain für CORS. Fällt auf localhost zurück.
  // Use bracket notation to satisfy TypeScript when accessing env variables
  const allowedOrigin =
    process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

  // CORS-Headers nur für API-Routen (reduziert Overhead)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // 🚀 OPTIMIERTE CORS-HEADERS
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-trpc-source",
    );
    response.headers.set("Access-Control-Max-Age", "86400");

    // 🚀 OPTIMIERTE OPTIONS-BEHANDLUNG
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200 });
    }

    // 🚀 OPTIMIERTE tRPC-BEHANDLUNG
    if (request.nextUrl.pathname.startsWith("/api/trpc/")) {
      const authHeader = request.headers.get("Authorization");

      if (authHeader?.startsWith("Bearer ")) {
        response.headers.set("X-Auth-Status", "token-present");
      } else {
        response.headers.set("X-Auth-Status", "no-token");
      }
    }

    return response;
  }

  // 🚀 OPTIMIERTE AUTH-ROUTEN-BEHANDLUNG
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    const response = NextResponse.next();

    // 🚀 REDUZIERTE CORS-HEADERS FÜR AUTH
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    if (request.nextUrl.pathname.includes("/logout")) {
      response.headers.set("X-Auth-Status", "logout");
    }

    return response;
  }

  // 🚀 OPTIMIERTE SUPABASE-AUTH-BEHANDLUNG
  if (request.nextUrl.pathname.includes("/auth/v1/")) {
    const response = NextResponse.next();

    response.headers.set("X-Supabase-Auth", "true");

    if (request.nextUrl.pathname.includes("/logout")) {
      response.headers.set("X-Logout-Status", "processing");
    }

    return response;
  }

  // 🚀 AUTHENTIFIZIERUNGSSCHUTZ FÜR GESCHÜTZTE ROUTEN
  const protectedRoutes = [
    "/dashboard",
    "/fahndungen/alle",
    "/fahndungen/neu",
    "/fahndungen/neu/enhanced",
    "/admin",
    "/profile",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtectedRoute) {
    // Prüfe Session-Cookie
    const sessionCookie = request.cookies.get("sb-access-token");

    if (!sessionCookie) {
      // Keine Session gefunden - Weiterleitung zu Login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session vorhanden - Weiterleitung erlauben
    const response = NextResponse.next();
    response.headers.set("X-Auth-Protected", "true");
    return response;
  }

  // 🚀 SCHNELLE STANDARD-BEHANDLUNG FÜR ANDERE ROUTEN
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
