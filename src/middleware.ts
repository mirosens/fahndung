import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Geschützte Routen definieren
  const protectedRoutes = [
    "/dashboard",
    "/fahndungen/neu",
    "/admin",
    "/fahndungen/neu/enhanced",
  ];

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  // 🔥 VERBESSERTE SESSION-VALIDIERUNG
  const checkSession = () => {
    // Alle möglichen Supabase Auth Cookies prüfen
    const supabaseCookies = [
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
      "supabase-auth-refresh-token",
      // Neue Cookie-Namen für bessere Kompatibilität
      "supabase-auth-token-v2",
      "supabase-auth-refresh-token-v2",
    ];

    // Prüfe auf gültige Cookies
    const hasValidSession = supabaseCookies.some((cookieName) => {
      const cookie = request.cookies.get(cookieName);
      return cookie?.value && cookie.value.length > 10;
    });

    // Zusätzlich prüfe Authorization Header für API-Aufrufe
    const authHeader = request.headers.get("Authorization");
    const hasAuthHeader = authHeader?.startsWith("Bearer ") ?? false;

    // Prüfe auch auf localStorage-basierte Session (für bessere Persistierung)
    const hasLocalStorageSession =
      request.headers.get("X-Session-Active") === "true";

    return hasValidSession || hasAuthHeader || hasLocalStorageSession;
  };

  // Wenn es eine geschützte Route ist
  if (isProtected) {
    const hasValidSession = checkSession();

    if (!hasValidSession) {
      // Keine Session gefunden - Weiterleitung zu Login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Wenn bereits angemeldeter Benutzer zur Login-Seite geht, weiterleiten
  if (request.nextUrl.pathname === "/login") {
    const hasValidSession = checkSession();

    if (hasValidSession) {
      // 🔥 Bereits angemeldet - SOFORTIGE Weiterleitung zur Startseite
      console.log("🔄 Middleware: Bereits angemeldet - Weiterleitung zu /");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 🔥 SESSION-HEADER FÜR BESSERE PERSISTIERUNG
  const response = NextResponse.next();

  // Füge Session-Header hinzu für bessere Erkennung
  if (checkSession()) {
    response.headers.set("X-Session-Active", "true");
  }

  return response;
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
