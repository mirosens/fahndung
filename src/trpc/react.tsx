"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { httpBatchStreamLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  clientQueryClientSingleton ??= createQueryClient();

  return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");

            // Get session from localStorage (Supabase stores it there)
            try {
              if (typeof window !== "undefined") {
                // Try to get session from localStorage first (faster)
                const sessionKeys = Object.keys(localStorage).filter(
                  (key) =>
                    key.includes("supabase") && key.includes("auth-token"),
                );

                for (const key of sessionKeys) {
                  const sessionStr = localStorage.getItem(key);
                  if (sessionStr) {
                    try {
                      const session = JSON.parse(sessionStr) as {
                        access_token?: string;
                      };
                      if (session?.access_token) {
                        headers.set(
                          "Authorization",
                          `Bearer ${session.access_token}`,
                        );
                        console.log(
                          "✅ tRPC: Auth token set from localStorage",
                          {
                            tokenLength: session.access_token.length,
                          },
                        );
                        break;
                      }
                    } catch (parseError) {
                      console.warn(
                        "Failed to parse localStorage session:",
                        parseError,
                      );
                    }
                  }
                }

                // If no token found in localStorage, log for debugging
                if (!headers.has("Authorization")) {
                  console.warn(
                    "❌ tRPC: No Authorization header set from localStorage",
                  );

                  // Log all localStorage keys for debugging
                  const allKeys = Object.keys(localStorage);
                  const supabaseKeys = allKeys.filter((key) =>
                    key.includes("supabase"),
                  );
                  console.log("🔍 tRPC: All localStorage keys:", allKeys);
                  console.log("🔍 tRPC: Supabase keys:", supabaseKeys);
                }
              }
            } catch (error) {
              console.warn("Failed to get auth token for tRPC headers:", error);
            }

            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env["VERCEL_URL"]) return `https://${process.env["VERCEL_URL"]}`;
  return `http://localhost:${process.env["PORT"] ?? 3000}`;
}
