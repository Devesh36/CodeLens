"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getSnippet,
  toggleFavorite,
  toggleSnippetVisibility,
  deleteSnippet,
  addTagToSnippet,
  removeTagFromSnippet,
  getCurrentUser,
} from "@/app/actions";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { ExplanationResponse } from "@/lib/ai";
import { getLanguageName, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Copy, Heart, Trash2, Edit2, Share2, Tag, X } from "lucide-react";

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  explanation: string;
  explanationJson: ExplanationResponse | null;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: Date;
  user?: { name: string | null };
  tags: Array<{ tag: { id: string; name: string } }>;
  favorites: Array<{ id: string }>;
  _count?: { favorites: number };
}

export default function SnippetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState("");

  async function copyShareLink(shareLink: string) {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert("Share link copied to clipboard!");
    } catch {
      window.prompt("Copy this share link:", shareLink);
    }
  }

  const loadData = useCallback(async () => {
    try {
      const authResult = await getCurrentUser();
      if (!authResult.user?.id) {
        router.push("/login");
        return;
      }

      setUserId(authResult.user.id);

      const snippetId = params.snippetId as string;
      const result = await getSnippet(snippetId);
      if (result.snippet) {
        const snip = result.snippet as unknown as Snippet;
        setSnippet(snip);
        setIsFavorite((snip.favorites?.length ?? 0) > 0);
      }
    } catch (error) {
      console.error("Failed to load snippet:", error);
      setError("Failed to load snippet");
    } finally {
      setIsLoading(false);
    }
  }, [params, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCopyCode() {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleToggleFavorite() {
    if (snippet) {
      await toggleFavorite(userId, snippet.id);
      setIsFavorite(!isFavorite);
    }
  }

  async function handleShare() {
    if (snippet) {
      const result = await toggleSnippetVisibility(snippet.id, !snippet.isPublic);
      if (result.snippet) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const shareLink = result.snippet.shareToken
          ? `${baseUrl}/shared/${result.snippet.shareToken}`
          : "";
        if (shareLink) {
          await copyShareLink(shareLink);
        }
        loadData();
      }
    }
  }

  async function handleDelete() {
    if (!snippet || !confirm("Delete this snippet?")) return;
    await deleteSnippet(snippet.id);
    router.push("/dashboard");
  }

  async function handleAddTag() {
    if (!snippet || !newTag.trim()) return;
    await addTagToSnippet(snippet.id, newTag.trim());
    setNewTag("");
    loadData();
  }

  async function handleRemoveTag(tagId: string) {
    if (!snippet) return;
    await removeTagFromSnippet(snippet.id, tagId);
    loadData();
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
          <Link href="/dashboard">
            <button className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg">
              Back to Dashboard
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
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 mb-4 font-semibold inline-flex items-center gap-1">
          ← Back to Dashboard
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{snippet.title}</h1>
            <div className="flex items-center gap-4 text-gray-600 text-sm font-medium">
              <span>📅 {formatDate(new Date(snippet.createdAt))}</span>
              <span>•</span>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold">
                {getLanguageName(snippet.language)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-lg transition-all ${
                isFavorite
                  ? "text-emerald-600 bg-emerald-100 hover:bg-emerald-200"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
              title={snippet.isPublic ? "Make Private" : "Make Public"}
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={() => router.push(`/dashboard/snippet/${snippet.id}/edit`)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
              title="Edit snippet"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-gray-500 hover:bg-red-100 hover:text-red-600 transition-all"
              title="Delete snippet"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Visibility Badge */}
        {snippet.isPublic && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 border-2 border-emerald-300 text-emerald-700 rounded-lg text-sm font-semibold">
            <Share2 size={16} />
            Public
            {snippet.shareToken && (
              <button
                onClick={() => {
                  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                  copyShareLink(`${baseUrl}/shared/${snippet.shareToken}`);
                }}
                className="ml-2 text-emerald-600 hover:text-emerald-800 font-bold"
              >
                Copy Link
              </button>
            )}
          </div>
        )}
      </div>

      {/* Code and Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
          <ExplanationPanel explanation={snippet.explanationJson as ExplanationResponse} />
        ) : (
          <div className="flex items-center justify-center bg-white rounded-lg border-2 border-gray-200 p-6 shadow-lg">
            <p className="text-gray-600 font-semibold">No explanation available</p>
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Tag size={20} className="text-amber-500" />
          Tags
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {snippet.tags.map((item) => (
            <div
              key={item.tag.id}
              className="px-3 py-1 bg-primary-100 border-2 border-primary-300 text-primary-700 text-sm rounded-full flex items-center gap-2 font-semibold"
            >
              {item.tag.name}
              <button
                onClick={() => handleRemoveTag(item.tag.id)}
                className="hover:text-primary-900 font-bold"
                title={`Remove ${item.tag.name} tag`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAddTag();
            }}
            placeholder="Add a new tag..."
            className="flex-1 px-4 py-2 bg-white border-2 border-gray-200 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500 text-sm font-medium"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
