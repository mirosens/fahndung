import { handleCommonErrors } from "./error-handlers";

// Globaler Error Handler für unhandled errors
export function setupGlobalErrorHandlers() {
  // Unhandled Promise Rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("🚨 Unhandled Promise Rejection:", event.reason);

    // Behandle bekannte Fehler
    if (handleCommonErrors(event.reason, "unhandledrejection")) {
      event.preventDefault(); // Verhindere Standard-Fehlerbehandlung
      return;
    }

    // Für unbekannte Fehler, logge sie aber verhindere Standard-Behandlung
    event.preventDefault();
  });

  // Unhandled Errors
  window.addEventListener("error", (event) => {
    console.error("🚨 Unhandled Error:", event.error);

    // Behandle bekannte Fehler
    if (handleCommonErrors(event.error, "unhandlederror")) {
      event.preventDefault(); // Verhindere Standard-Fehlerbehandlung
      return;
    }

    // Für unbekannte Fehler, logge sie aber verhindere Standard-Behandlung
    event.preventDefault();
  });

  // Console Error Interceptor
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Prüfe ob es sich um bekannte Fehler handelt
    const errorMessage = args.join(" ");
    if (
      errorMessage.includes("filesystem") ||
      errorMessage.includes("storage") ||
      errorMessage.includes("illegal path") ||
      errorMessage.includes("Unable to add filesystem") ||
      errorMessage.includes("blob:") ||
      errorMessage.includes("ERR_FILE_NOT_FOUND")
    ) {
      // Behandle bekannte Fehler still
      console.log("ℹ️ Bekannter Fehler abgefangen:", errorMessage);
      return;
    }

    // Für unbekannte Fehler, verwende die ursprüngliche console.error
    originalConsoleError.apply(console, args);
  };
}

// Cleanup-Funktion
export function cleanupGlobalErrorHandlers() {
  // Entferne Event Listener wenn nötig
  // (In der Praxis wird dies selten benötigt)
}
