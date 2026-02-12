"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicSnippet } from "@/app/actions";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { ExplanationResponse } from "@/lib/ai";
import { getLanguageName, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Copy, ArrowLeft } from "lucide-react";

interface PublicSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  explanation: string;
  explanationJson: ExplanationResponse | null;
  createdAt: Date;
  user: { name: string | null };
  tags: Array<{ tag: { name: string } }>;
}

export default function SharedSnippetPage() {
  const params = useParams();
  const [snippet, setSnippet] = useState<PublicSnippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSnippet();
  }, [params]);

  async function loadSnippet() {
    try {
      const shareToken = params.shareToken as string;
      const result = await getPublicSnippet(shareToken);
      if (result.error) {
        setError(result.error);
      } else if (result.snippet) {
        setSnippet(result.snippet as PublicSnippet);
      }
    } catch (err) {
      setError("Failed to load snippet");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopyCode() {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block relative w-12 h-12 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-emerald-600 rounded-full animate-spin" style={{ animation: "spin 2s linear infinite" }} />
            <div className="absolute inset-1 bg-white rounded-full" />
          </div>
          <p className="text-gray-600 font-semibold">Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-semibold">{error || "Snippet not found"}</p>
          <Link href="/login">
            <button className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg">
              Back to CodeLens
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-primary-50 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/login" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 font-semibold">
          <ArrowLeft size={20} />
          Back to CodeLens
        </Link>
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{snippet.title}</h1>
          <div className="flex items-center gap-4 text-gray-600 text-sm font-medium">
            <span>👤 {snippet.user.name || "Anonymous"}</span>
            <span>•</span>
            <span>📅 {formatDate(new Date(snippet.createdAt))}</span>
            <span>•</span>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold">
              {getLanguageName(snippet.language)}
            </span>
          </div>
        </div>
      </div>

      {/* Code and Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Panel */}
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-3 flex items-center justify-between border-b-2 border-gray-200">
            <span className="text-gray-700 font-semibold">Code</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 text-sm rounded font-semibold transition-all"
            >
              <Copy size={16} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="p-6 overflow-auto bg-gray-50 text-gray-700 text-sm font-mono max-h-96 border-t border-gray-200">
            <code>{snippet.code}</code>
          </pre>
        </div>

        {/* Explanation Panel */}
        {snippet.explanationJson ? (
          <ExplanationPanel
            explanation={snippet.explanationJson as ExplanationResponse}
          />
        ) : (
          <div className="flex items-center justify-center bg-white rounded-lg border-2 border-gray-200 p-6 shadow-lg">
            <p className="text-gray-600 font-semibold">No explanation available for this snippet</p>
          </div>
        )}
      </div>

      {/* Tags */}
      {snippet.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map((item) => (
              <span
                key={item.tag.name}
                className="px-3 py-1 bg-primary-100 border-2 border-primary-300 text-primary-700 text-sm rounded-full font-semibold"
              >
                {item.tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 text-sm font-medium mb-4">Want to create your own code explanations?</p>
        <Link href="/login">
          <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg">
            Sign Up for CodeLens AI
          </button>
        </Link>
      </div>
    </div>
  );
}
