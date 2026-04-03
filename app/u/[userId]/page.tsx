"use client";

import { useEffect, useState } from "react";
import { getUserProfile, forkSnippet } from "@/app/actions";
import { SnippetCard } from "@/components/SnippetCard";
import Link from "next/link";
import { User, GitFork } from "lucide-react";
import { useParams } from "next/navigation";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [profile, setProfile] = useState<any>(null);
  const [snippets, setSnippets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userId) return;
      const res = await getUserProfile(userId);
      if (res.user) {
        setProfile(res.user);
        setSnippets(res.snippets || []);
      }
      setIsLoading(false);
    }
    load();
  }, [userId]);

  async function handleFork(id: string) {
    const res = await forkSnippet(id);
    if (res.success) {
      alert("Snippet forked to your dashboard!");
    } else {
      alert(res.error || "Failed to fork snippet");
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <nav className="mb-12">
        <Link href="/discover" className="text-cyan-400 hover:text-cyan-300 font-semibold">
          &larr; Back to Discover
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-12 flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/30">
            <User size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{profile.name || profile.email.split('@')[0]}</h1>
            <p className="text-slate-400">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
            <p className="text-sm text-cyan-400 mt-2">{snippets.length} Public Snippets</p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6 border-b border-slate-800 pb-2">Public Snippets</h2>
        
        {snippets.length === 0 ? (
          <p className="text-slate-500">This user hasn't published any snippets yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((snippet) => (
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
    </div>
  );
}
