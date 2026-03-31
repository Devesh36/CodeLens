"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Editor } from "@/components/Editor";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import type { ExplanationResponse } from "@/lib/ai";
import { createSnippet, logoutUser } from "@/app/actions";
import {
  AlertCircle,
  Folder,
  LayoutDashboard,
  LogOut,
  Save,
  Settings,
  User,
} from "lucide-react";

function EditorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramInsightLanguage = searchParams.get("insightLanguage");
  const EXPLANATION_LANGUAGES = [
    "English",
    "Hindi",
    "Lazy Hindi (Romanized)",
    "Marathi",
    "Lazy Marathi (Romanized)",
    "Gujarati",
    "Bengali",
    "Punjabi",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Urdu",
    "Odia",
    "Assamese",
    "Nepali",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Dutch",
    "Polish",
    "Russian",
    "Turkish",
    "Arabic",
    "Hebrew",
    "Persian",
    "Swahili",
    "Indonesian",
    "Malay",
    "Thai",
    "Vietnamese",
    "Korean",
    "Japanese",
    "Chinese (Simplified)",
    "Chinese (Traditional)",
  ];

  const [code, setCode] = useState(`async function processCodeInsights(sourceCode) {
  // Initialize AI context for semantic analysis
  const context = await AI.initialize({
    model: "codelens-titan-v2",
    temperature: 0.2,
  });

  try {
    const result = await context.analyze(sourceCode);

    return result.map((entry) => ({
      line: entry.lineNumber,
      description: entry.explanation,
      complexity: entry.metrics.score,
    }));
  } catch (error) {
    console.error("AI processing failed", error);
    throw new InsightError("Context overflow");
  }
}`);
  const [language, setLanguage] = useState("auto");
  const [explanationLanguage, setExplanationLanguage] = useState(() => {
    if (paramInsightLanguage) {
      return decodeURIComponent(paramInsightLanguage);
    }
    if (typeof window !== "undefined") {
      return localStorage.getItem("preferredExplanationLanguage") || "English";
    }
    return "English";
  });
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const lineCount = useMemo(() => (code.trim() ? code.split("\n").length : 0), [code]);
  const charCount = useMemo(() => code.length, [code]);

  const serializedExplanation = useMemo(() => {
    if (!explanation) return "";

    const lines = explanation.lineExplanations
      .map((item) => `L${item.line}: ${item.explanation}`)
      .join("\n");

    const improvements = explanation.improvements.length
      ? `\n\nOptimization Tips:\n- ${explanation.improvements.join("\n- ")}`
      : "";

    return `Summary:\n${explanation.summary}\n\nComplexity: ${explanation.complexity}\n\nInsights:\n${lines}${improvements}`;
  }, [explanation]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = (await response.json()) as {
          user?: { id?: string } | null;
        };

        const currentUserId = data?.user?.id ?? null;
        setUserId(currentUserId);
        setIsAuthenticated(!!currentUserId);

        // If user just logged in and there's pending snippet data, restore it
        if (currentUserId) {
          const pendingSnippet = localStorage.getItem("pendingSnippetSave");
          if (pendingSnippet) {
            try {
              const pendingData = JSON.parse(pendingSnippet);
              setCode(pendingData.code);
              setLanguage(pendingData.language);
              setSnippetTitle(pendingData.title);
              setExplanation(pendingData.explanation);
              setShowSaveModal(true);
              localStorage.removeItem("pendingSnippetSave");
            } catch (e) {
              console.error("Failed to restore pending snippet:", e);
            }
          }
        }
      } catch {
        setUserId(null);
        setIsAuthenticated(false);
      }
    })();
  }, []);

  // Persist explanation language to localStorage
  useEffect(() => {
    localStorage.setItem("preferredExplanationLanguage", explanationLanguage);
  }, [explanationLanguage]);

  async function handleExplain() {
    if (!code.trim()) {
      setError("Please write some code first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, explanationLanguage }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to explain code");
      }

      const data = (await response.json()) as ExplanationResponse;
      setExplanation(data);

      if (data.detectedLanguage && language === "auto") {
        setLanguage(data.detectedLanguage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to explain code");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveSnippet() {
    if (!isAuthenticated) {
      // Store pending snippet data before redirecting
      const pendingData = {
        code,
        language,
        title: snippetTitle,
        explanation,
      };
      localStorage.setItem("pendingSnippetSave", JSON.stringify(pendingData));

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
      if (!userId) {
        // Store pending snippet data and redirect to login
        const pendingData = {
          code,
          language,
          title: snippetTitle,
          explanation,
        };
        localStorage.setItem("pendingSnippetSave", JSON.stringify(pendingData));
        router.push("/login");
        return;
      }

      const result = await createSnippet(
        userId,
        snippetTitle,
        code,
        language,
        explanation?.summary || "",
        explanation ?? null
      );

      if (result.error) {
        setError(result.error);
      } else {
        setShowSaveModal(false);
        setSnippetTitle("");
        localStorage.removeItem("pendingSnippetSave");
        router.push("/dashboard");
      }
    } catch {
      setError("Failed to save snippet");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCopyExplanation() {
    if (!serializedExplanation) return;
    await navigator.clipboard.writeText(serializedExplanation);
  }

  async function handleShareExplanation() {
    if (!serializedExplanation) return;

    if (navigator.share) {
      await navigator.share({
        title: "CodeLens Insight",
        text: serializedExplanation,
      });
      return;
    }

    await handleCopyExplanation();
    alert("Insight copied to clipboard. Paste it anywhere to share.");
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100 p-2 md:p-3">
      <div className="h-[calc(100vh-1rem)] rounded-2xl border border-cyan-500/15 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_100%_100%,rgba(79,70,229,0.15),transparent_42%)] shadow-[0_25px_100px_rgba(2,132,199,0.14)] overflow-hidden">
        <div className="grid h-full grid-cols-[48px_1fr] md:grid-cols-[64px_1fr]">
          <aside className="border-r border-cyan-500/10 bg-slate-900/85 flex flex-col items-center py-3 md:py-4 justify-between">
            <div className="space-y-3">
              <button type="button" title="Explorer" aria-label="Explorer" className="w-9 h-9 rounded-lg border border-cyan-500/35 bg-cyan-500/10 text-cyan-200 inline-flex items-center justify-center">
                <Folder size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <button type="button" title="Account" aria-label="Account" className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 inline-flex items-center justify-center transition-colors">
                <User size={16} />
              </button>
              <button type="button" title="Settings" aria-label="Settings" className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 inline-flex items-center justify-center transition-colors">
                <Settings size={16} />
              </button>
            </div>
          </aside>

          <main className="h-full min-w-0 grid grid-rows-[1fr_auto] bg-slate-950/90">
            <section className="relative min-h-0 h-full p-3 md:p-4 flex flex-col">
              <div className="mb-3 md:mb-0 md:absolute md:top-4 md:right-4 z-20 flex flex-wrap items-center gap-2 rounded-lg border border-slate-800/90 bg-slate-950/85 px-2 py-2 backdrop-blur">
                <button
                  type="button"
                  onClick={() => {
                    if (!code.trim()) {
                      setError("Write or paste code first, then save your snippet.");
                      return;
                    }
                    setShowSaveModal(true);
                  }}
                  className="px-3 py-1.5 rounded-md border border-cyan-400/20 bg-cyan-500/10 text-cyan-100 text-xs font-semibold inline-flex items-center gap-2 hover:bg-cyan-500/20 transition-colors"
                >
                  <Save size={14} />
                  Save
                </button>

                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="px-3 py-1.5 rounded-md border border-slate-700 bg-slate-900 text-slate-200 text-xs font-semibold inline-flex items-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </button>
                )}

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logoutUser().finally(() => {
                        setIsAuthenticated(false);
                        setUserId(null);
                        router.push("/login");
                        router.refresh();
                      });
                    }}
                    className="px-3 py-1.5 rounded-md border border-slate-700 bg-slate-900 text-slate-200 text-xs font-semibold inline-flex items-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="px-3 py-1.5 rounded-md border border-slate-700 bg-slate-900 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {(error || !isAuthenticated) && (
                <div className="mb-3 md:pr-44">
                  {error && (
                    <div className="mb-2 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="px-4 py-2.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-100 flex items-center justify-between gap-3">
                      <p className="text-xs sm:text-sm">Guest mode active. Sign up to save snippets and shared insights.</p>
                      <button
                        type="button"
                        onClick={() => router.push("/signup")}
                        className="px-3 py-1.5 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 min-h-0 h-full grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)] gap-3 auto-rows-fr">
                <Editor
                  value={code}
                  onChange={setCode}
                  language={language}
                  onLanguageChange={setLanguage}
                  insightLanguage={explanationLanguage}
                  insightLanguageOptions={EXPLANATION_LANGUAGES}
                  onInsightLanguageChange={setExplanationLanguage}
                  onExplain={handleExplain}
                  isLoading={isLoading}
                />

                <ExplanationPanel
                  explanation={explanation}
                  isLoading={isLoading}
                  onExplain={handleExplain}
                  onCopyExplanation={handleCopyExplanation}
                  onShareInsight={handleShareExplanation}
                  canExplain={!isLoading && !!code.trim()}
                  hasExplanation={!!serializedExplanation}
                />
              </div>
            </section>

            <footer className="border-t border-cyan-500/10 bg-slate-950/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-slate-500">
                <p className="font-semibold text-slate-400">CodeLens AI</p>
                <button type="button" className="hover:text-slate-300 transition-colors">File</button>
                <button type="button" className="hover:text-slate-300 transition-colors">Edit</button>
                <button type="button" className="hover:text-slate-300 transition-colors">Selection</button>
                <button type="button" className="hover:text-slate-300 transition-colors">View</button>
                <button type="button" className="hover:text-slate-300 transition-colors">Run</button>
              </div>
              <div className="text-xs text-slate-500">{lineCount} lines • {charCount} chars</div>
            </footer>
          </main>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl border border-cyan-500/20 p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">Save Snippet</h2>
            <p className="text-slate-400 mb-6 text-sm">Give your code snippet a meaningful name</p>

            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-semibold text-slate-100 mb-2">
                Snippet Title
              </label>
              <input
                id="title"
                type="text"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                placeholder="e.g., Quick Sort Algorithm"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSnippet}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
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

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Loading editor...</p>
        </div>
      }
    >
      <EditorPageContent />
    </Suspense>
  );
}
