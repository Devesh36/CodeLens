"use client";

import { useEffect, useState } from "react";
import { getDiscoverSnippets, forkSnippet } from "@/app/actions";
import { SnippetCard } from "@/components/SnippetCard";
import Link from "next/link";
import { Search, Compass, GitFork } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DiscoverPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      const res = await getDiscoverSnippets();
      if (res.snippets) {
        setSnippets(res.snippets);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredSnippets = snippets.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleFork(id: string) {
    const res = await forkSnippet(id);
    if ("success" in res && res.success) {
      alert("Snippet forked to your dashboard!");
      return;
    }

    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }

    alert("Failed to fork snippet");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <nav className="mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 font-semibold">
          &larr; Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Compass className="text-indigo-400" />
          <h1 className="text-2xl font-bold">Discover</h1>
        </div>
      </nav>

      <div className="relative max-w-xl mx-auto mb-10">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search public snippets by title or language..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400">Loading amazing snippets...</div>
      ) : filteredSnippets.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No snippets found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredSnippets.map((snippet) => (
            <div key={snippet.id} className="relative group">
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleFork(snippet.id)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md flex items-center gap-1 shadow-lg"
                  title="Fork to your dashboard"
                >
                  <GitFork size={14} /> Fork
                </button>
              </div>
              <div className="mb-2 px-2 flex items-center justify-between text-xs text-slate-400">
                <Link href={`/u/${snippet.userId}`} className="hover:text-cyan-400 transition-colors">
                  By: {snippet.user?.name || snippet.user?.email?.split('@')[0] || "Anonymous"}
                </Link>
                <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
              </div>
              <SnippetCard
                id={snippet.id}
                title={snippet.title}
                code={snippet.code}
                language={snippet.language}
                createdAt={new Date(snippet.createdAt)}
                isFavorite={false}
                isPublic={snippet.isPublic}
                shareToken={snippet.shareToken}
                onShare={(id) => {
                  const s = snippets.find(x => x.id === id);
                  if (s?.shareToken) {
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                    navigator.clipboard.writeText(`${baseUrl}/shared/${s.shareToken}`);
                    alert("Share link copied!");
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
