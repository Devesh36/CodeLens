"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SnippetCard } from "@/components/SnippetCard";
import { getUserSnippets, deleteSnippet, toggleFavorite, toggleSnippetVisibility } from "@/app/actions";
import Link from "next/link";
import { Plus, LogOut } from "lucide-react";

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  createdAt: Date;
  isPublic: boolean;
  shareToken: string | null;
  favorites: { id: string }[];
  _count: { favorites: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Decode token to get userId
      const parts = token.split(".");
      const payload = JSON.parse(atob(parts[1]));
      setUserId(payload.userId);

      const result = await getUserSnippets(payload.userId);
      if (result.snippets) {
        setSnippets(result.snippets as unknown as Snippet[]);
      }
    } catch (error) {
      console.error("Failed to load snippets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(snippetId: string) {
    const result = await deleteSnippet(snippetId);
    if (!result.error) {
      setSnippets(snippets.filter((s) => s.id !== snippetId));
    }
  }

  async function handleFavorite(snippetId: string) {
    await toggleFavorite(userId, snippetId);
    loadData();
  }

  async function handleShare(snippetId: string) {
    const snippet = snippets.find((s) => s.id === snippetId);
    if (!snippet) return;

    const result = await toggleSnippetVisibility(snippetId, !snippet.isPublic);
    if (result.snippet) {
      const shareLink = result.snippet.shareToken
        ? `${process.env.NEXT_PUBLIC_APP_URL}/shared/${result.snippet.shareToken}`
        : "";
      if (shareLink) {
        navigator.clipboard.writeText(shareLink);
        alert("Share link copied to clipboard!");
      }
    }
    loadData();
  }

  const filteredSnippets = snippets.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filterLanguage === "all" || s.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  });

  const languages = Array.from(new Set(snippets.map((s) => s.language)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-emerald-50 p-4 md:p-8">
      {/* Navigation */}
      <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">📚 Snippet Library</h1>
          <p className="text-gray-600 mt-2 font-medium">Manage and organize your saved code snippets</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link href="/editor">
            <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-primary-500/30 flex items-center justify-center gap-2 font-medium">
              <Plus size={20} />
              New Snippet
            </button>
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("auth_token");
              router.push("/login");
            }}
            className="flex-1 md:flex-none px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="🔍 Search snippets by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500 transition-all font-medium"
        />
        <select
          value={filterLanguage}
          onChange={(e) => setFilterLanguage(e.target.value)}
          title="Filter snippets by programming language"
          className="px-4 py-3 bg-white border-2 border-gray-200 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
        >
          <option value="all">All Languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Snippets Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block relative w-12 h-12 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-emerald-600 rounded-full animate-spin" style={{ animation: "spin 2s linear infinite" }} />
              <div className="absolute inset-1 bg-white rounded-full" />
            </div>
            <p className="text-gray-900 font-semibold">Loading snippets...</p>
            <p className="text-gray-600 text-sm mt-2">Please wait</p>
          </div>
        </div>
      ) : filteredSnippets.length === 0 ? (
        <div className="text-center py-16 bg-gradient-light rounded-xl border-2 border-gray-200">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-900 mb-4 font-bold text-lg">
            {snippets.length === 0
              ? "No snippets yet. Create one to get started!"
              : "No snippets match your search."}
          </p>
          {snippets.length === 0 && (
            <Link href="/editor" className="inline-block">
              <button className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-primary-500/30 font-medium">
                Create Your First Snippet
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {filteredSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              id={snippet.id}
              title={snippet.title}
              code={snippet.code}
              language={snippet.language}
              createdAt={new Date(snippet.createdAt)}
              isFavorite={snippet.favorites && snippet.favorites.length > 0}
              onFavorite={handleFavorite}
              onShare={handleShare}
              onEdit={(id) => router.push(`/dashboard/snippet/${id}/edit`)}
              onDelete={handleDelete}
              shareToken={snippet.shareToken}
            />
          ))}
        </div>
      )}
    </div>
  );
}
