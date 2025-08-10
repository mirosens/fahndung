"use client";

import { useState } from "react";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";

export default function TestAuthPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setStatus("🔄 Teste Login...");

    try {
      const supabase = getBrowserClient();

      // Teste Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "ptlsweb@gmail.com",
        password: "Heute-2025!sp",
      });

      if (error) {
        setStatus(`❌ Login-Fehler: ${error.message}`);
        return;
      }

      if (!data.user) {
        setStatus("❌ Kein Benutzer zurückgegeben");
        return;
      }

      setStatus(`✅ Login erfolgreich: ${data.user.email}`);

      // Teste Session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setStatus(`⚠️ Session-Fehler: ${sessionError.message}`);
      } else if (session) {
        setStatus(
          `✅ Session erstellt: ${session.user.email} (Token: ${session.access_token ? "Ja" : "Nein"})`,
        );
      } else {
        setStatus("⚠️ Login erfolgreich, aber keine Session erstellt");
      }
    } catch (err) {
      setStatus(
        `❌ Unerwarteter Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const testSession = async () => {
    setLoading(true);
    setStatus("🔄 Prüfe Session...");

    try {
      const supabase = getBrowserClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setStatus(`❌ Session-Fehler: ${error.message}`);
      } else if (session) {
        setStatus(`✅ Session gefunden: ${session.user.email}`);
      } else {
        setStatus("ℹ️ Keine Session gefunden");
      }
    } catch (err) {
      setStatus(
        `❌ Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    setStatus("🔄 Teste Logout...");

    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setStatus(`❌ Logout-Fehler: ${error.message}`);
      } else {
        setStatus("✅ Logout erfolgreich");
      }
    } catch (err) {
      setStatus(
        `❌ Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-2xl font-bold">Auth Test</h1>

        <div className="space-y-4">
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            Test Login
          </button>

          <button
            onClick={testSession}
            disabled={loading}
            className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
          >
            Test Session
          </button>

          <button
            onClick={testLogout}
            disabled={loading}
            className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:bg-gray-400"
          >
            Test Logout
          </button>
        </div>

        {status && (
          <div className="mt-6 rounded bg-white p-4 shadow">
            <p className="text-sm">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
