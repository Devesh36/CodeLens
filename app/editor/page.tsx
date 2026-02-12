"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@/components/Editor";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { ExplanationResponse } from "@/lib/ai";
import { createSnippet } from "@/app/actions";
import type { Prisma } from "@prisma/client";

export default function EditorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("auto");
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status but don't redirect
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
  }, []);

  async function handleExplain() {
    if (!code.trim()) {
      setError("Please write some code first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch("/api/explain", {
        method: "POST",
        headers,
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to explain code");
      }

      const data = (await response.json()) as ExplanationResponse;
      setExplanation(data);
      
      // Update language if AI detected it
      if (data.detectedLanguage && language === "auto") {
        setLanguage(data.detectedLanguage);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to explain code"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveSnippet() {
    // Check authentication first
    if (!isAuthenticated) {
      // Show sign up prompt
      if (confirm("You need to sign up to save snippets. Would you like to sign up now?")) {
        router.push("/signup");
      }
      return;
    }

    if (!snippetTitle.trim()) {
      setError("Please enter a title for your snippet");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Decode token to get userId (basic JWT decode)
      const parts = token.split(".");
      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.userId;

      const result = await createSnippet(
        userId,
        snippetTitle,
        code,
        language,
        explanation?.summary || "",
        // cast client-side ExplanationResponse to a Prisma JSON input value
        (explanation as unknown) as Prisma.InputJsonValue | null
      );

      if (result.error) {
        setError(result.error);
      } else {
        setShowSaveModal(false);
        setSnippetTitle("");
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Failed to save snippet");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Navigation */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CodeLens AI</h1>
          <p className="text-gray-600 mt-1">Understand code line-by-line with AI</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
          type="button"
          onClick={() => {
            // Feature under development — show a user-facing message instead of saving
            setError("Save snippets are still in development — coming soon!");
            // auto-clear the message after a short delay
            setTimeout(() => setError(""), 4000);
          }}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all flex-1 md:flex-none"
        >
            Save Snippet
          </button>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("auth_token");
                router.push("/login");
              }}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all flex-1 md:flex-none"
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError("Sign in is still in development — coming soon!");
                setTimeout(() => setError(""), 4000);
              }}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-teal-600 hover:text-teal-600 transition-all flex-1 md:flex-none"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <title>Test </title>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Guest User Banner */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-white border border-teal-200 rounded-lg flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">Try it free, no sign up needed</p>
            <p className="text-sm text-gray-600 mt-0.5">Sign up to save snippets, share with others, and access your history.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setError("Sign up is still in development — coming soon!");
              setTimeout(() => setError(""), 4000);
            }}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all whitespace-nowrap text-sm"
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div>
          <Editor
            value={code}
            onChange={setCode}
            language={language}
            onExplain={handleExplain}
            isLoading={isLoading}
          />
        </div>

        {/* Explanation Panel */}
        <div>
          <ExplanationPanel explanation={explanation} isLoading={isLoading} />
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Save Snippet</h2>
            <p className="text-gray-600 mb-6 text-sm">Give your code snippet a meaningful name</p>

            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Snippet Title
              </label>
              <input
                id="title"
                type="text"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                placeholder="e.g., Quick Sort Algorithm"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSnippet}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
