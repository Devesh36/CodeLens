"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSnippet, updateSnippet, getSnippetVersions, getCurrentUser } from "@/app/actions";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { ExplanationResponse } from "@/lib/ai";
import { getLanguageName } from "@/lib/utils";
import Link from "next/link";
import { PROGRAMMING_LANGUAGES } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";


interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  explanation: string;
  explanationJson: ExplanationResponse | null;
}

export default function EditSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    language: "javascript",
  });

  const [versions, setVersions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"edit" | "history">("edit");
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [refactorInstruction, setRefactorInstruction] = useState("");
  const [userPlan, setUserPlan] = useState<"FREE" | "PRO">("FREE");

  useEffect(() => {
    loadSnippet();
  }, [params]);

  useEffect(() => {
    if (!snippet) return;
    const displayTitle = formData.title?.trim() || snippet.title || "Snippet";
    document.title = `Edit ${displayTitle} - CodeLens AI`;
  }, [formData.title, snippet]);

  async function loadSnippet() {
    try {
      const authResult = await getCurrentUser();
      if (!authResult.user?.id) {
        router.push("/login");
        return;
      }
      setUserPlan(authResult.user.plan || "FREE");

      const snippetId = params.snippetId as string;
      const result = await getSnippet(snippetId);
      if (result.snippet) {
        const snip = result.snippet as Snippet;
        setSnippet(snip);
        setFormData({
          title: snip.title,
          code: snip.code,
          language: snip.language,
        });
      }
      const vResult = await getSnippetVersions(snippetId);
      if (vResult.versions) {
        setVersions(vResult.versions);
      }
    } catch (error) {
      setError("Failed to load snippet");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefactor() {
    if (!formData.code || !refactorInstruction) return;
    setIsRefactoring(true);
    try {
      const res = await fetch("/api/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          language: formData.language,
          instruction: refactorInstruction
        }),
      });
      if (!res.ok) throw new Error("Failed to refactor");
      const data = await res.json();
      if (data.code) {
        setFormData((prev) => ({ ...prev, code: data.code }));
        alert(`Refactored successfully: ${data.explanation}`);
      }
    } catch (err) {
      alert("Refactoring failed");
    } finally {
      setIsRefactoring(false);
      setRefactorInstruction("");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!snippet) return;

    setIsSaving(true);
    setError("");

    try {
      const result = await updateSnippet(
        snippet.id,
        formData.title,
        formData.code,
        formData.language,
        snippet.explanation,
        // pass JSON through with a broad type for cross-version compatibility
        (snippet.explanationJson as unknown) as any | null
      );

      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/dashboard/snippet/${snippet.id}`);
      }
    } catch (err) {
      setError("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
          <p className="text-gray-400">Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Snippet not found</p>
          <Link href="/dashboard">
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-4 block">
        ← Back to Dashboard
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 mb-8 border-b border-gray-800 pb-2">
          <button 
            onClick={() => setActiveTab("edit")} 
            className={`text-xl font-bold ${activeTab === 'edit' ? 'text-white' : 'text-gray-500'}`}
          >
            Edit Snippet
          </button>
          <button 
            onClick={() => setActiveTab("history")} 
            className={`text-xl font-bold ${activeTab === 'history' ? 'text-white' : 'text-gray-500'}`}
          >
            History
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {activeTab === "edit" ? (
          <>
            <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              title="Snippet title"
              placeholder="Enter snippet title"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                title="Programming language"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
              >
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {getLanguageName(lang)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 items-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Convert to arrow functions"
                  value={refactorInstruction}
                  onChange={(e) => setRefactorInstruction(e.target.value)}
                  disabled={userPlan !== "PRO"}
                  title={userPlan === "PRO" ? "" : "Pro plan required"}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-indigo-500 w-64 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={handleRefactor}
                  disabled={userPlan !== "PRO" || isRefactoring || !refactorInstruction}
                  title={userPlan === "PRO" ? "" : "Pro plan required"}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded text-sm flex items-center gap-1 transition-colors"
                >
                  {isRefactoring ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  AI Refactor
                </button>
                {userPlan !== "PRO" && (
                  <Link href="/dashboard" className="text-xs text-amber-300 hover:text-amber-200">
                    Pro only
                  </Link>
                )}
              </div>
            </div>
            <textarea
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              title="Code snippet content"
              placeholder="Paste your code here..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm h-96 resize-none"
              required
              />
            </div>
          </form>
          {/* Preview */}
          {snippet.explanationJson && (
            <div className="max-w-4xl mx-auto mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Current Explanation
              </h2>
              <ExplanationPanel explanation={snippet.explanationJson as ExplanationResponse} />
            </div>
          )}
          </>
        ) : (
          <div className="space-y-6">
            {versions.length === 0 ? (
              <p className="text-gray-400">No previous versions found.</p>
            ) : (
              versions.map((v) => (
                <div key={v.id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-400">{new Date(v.createdAt).toLocaleString()}</span>
                    <button 
                      onClick={() => {
                        if(confirm("Restore this version?")) {
                          setFormData({ ...formData, code: v.code });
                          setActiveTab("edit");
                        }
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                  <pre className="text-xs bg-gray-900 p-3 rounded text-gray-300 overflow-auto max-h-40">
                    {v.code}
                  </pre>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
