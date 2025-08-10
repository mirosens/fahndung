import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // 🚀 PROTOYP-MODUS: Keine Authentifizierung erforderlich
  // Alle Routen sind frei zugänglich für schnelle Entwicklung

  // TODO: Für Produktion wieder aktivieren
  // const protectedRoutes = ["/dashboard", "/fahndungen/neu", "/admin"];
  // const isProtected = protectedRoutes.some((route) =>
  //   request.nextUrl.pathname.startsWith(route),
  // );

  // if (isProtected) {
  //   // Prüfe auf Supabase Auth Cookies
  //   const supabaseCookies = [
  //     "sb-access-token",
  //     "sb-refresh-token",
  //     "supabase-auth-token",
  //     "supabase-auth-refresh-token",
  //   ];

  //   const hasValidSession = supabaseCookies.some((cookieName) => {
  //     const cookie = request.cookies.get(cookieName);
  //     return cookie && cookie.value && cookie.value.length > 10;
  //   });

  //   // Zusätzlich prüfe Authorization Header für API-Aufrufe
  //   const authHeader = request.headers.get("Authorization");
  //   const hasAuthHeader = authHeader?.startsWith("Bearer ");

  //   if (!hasValidSession && !hasAuthHeader) {
  //     // Keine Session gefunden - Weiterleitung zu Login
  //     const loginUrl = new URL("/login", request.url);
  //     loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  //     return NextResponse.redirect(loginUrl);
  //   }
  // }

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
