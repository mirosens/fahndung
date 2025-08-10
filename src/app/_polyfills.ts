// src/app/_polyfills.ts
// Prevent SSR crashes when libs expect the browser's `self` at module eval time.
if (
  typeof globalThis !== "undefined" &&
  typeof (globalThis as any).self === "undefined"
) {
  (globalThis as any).self = globalThis;
}

