"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { handleCommonErrors } from "~/lib/error-handlers";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Aktualisiere den State, damit der nächste Render den Fallback UI zeigt
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Logge den Fehler
    console.error("🚨 ErrorBoundary caught an error:", error, errorInfo);

    // Behandle bekannte Fehler
    if (handleCommonErrors(error, "ErrorBoundary")) {
      // Fehler wurde behandelt, keine weitere Aktion nötig
      return;
    }

    // Für unbekannte Fehler, setze den State
    this.setState({ hasError: true, error });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              Ein Fehler ist aufgetreten
            </h2>
            
            <p className="mb-4 text-sm text-muted-foreground">
              {this.state.error?.message || "Ein unerwarteter Fehler ist aufgetreten."}
            </p>
            
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Erneut versuchen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook für funktionale Komponenten
export function useErrorHandler() {
  return (error: unknown, context?: string) => {
    console.error(`🚨 Error in ${context || 'unknown context'}:`, error);
    handleCommonErrors(error, context);
  };
}
