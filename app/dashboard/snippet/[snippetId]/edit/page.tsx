"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSnippet, updateSnippet } from "@/app/actions";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { ExplanationResponse } from "@/lib/ai";
import { getLanguageName } from "@/lib/utils";
import Link from "next/link";
import { PROGRAMMING_LANGUAGES } from "@/lib/utils";

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

  useEffect(() => {
    loadSnippet();
  }, [params]);

  async function loadSnippet() {
    try {
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
    } catch (error) {
      setError("Failed to load snippet");
    } finally {
      setIsLoading(false);
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
        snippet.explanationJson
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
      <Link href={`/dashboard/snippet/${snippet.id}`} className="text-blue-400 hover:text-blue-300 mb-4 block">
        ← Back to Snippet
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Edit Snippet</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg">
            {error}
          </div>
        )}

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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Code
            </label>
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
      </div>

      {/* Preview */}
      {snippet.explanationJson && (
        <div className="max-w-4xl mx-auto mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Current Explanation
          </h2>
          <ExplanationPanel explanation={snippet.explanationJson as ExplanationResponse} />
        </div>
      )}
    </div>
  );
}
