"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SnippetCard } from "@/components/SnippetCard";
import {
  getUserSnippets,
  deleteSnippet,
  toggleFavorite,
  toggleSnippetVisibility,
  getCurrentUser,
  logoutUser,
  importSnippets,
} from "@/app/actions";
import Link from "next/link";
import { Plus, Search, Settings, Bell, LogOut, PanelLeftClose, PanelLeftOpen, Download, Upload, ChevronDown, Code } from "lucide-react";

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
  const [view, setView] = useState<"all" | "favorites" | "recent">("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const explanationLanguage = typeof window !== "undefined" 
    ? localStorage.getItem("preferredExplanationLanguage") || "English"
    : "English";

  const handleExport = () => {
    const dataToExport = snippets.map((s) => ({
      title: s.title,
      code: s.code,
      language: s.language,
      explanation: (s as any).explanation || "",
      explanationJson: (s as any).explanationJson || null,
    }));
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "codelens-snippets-backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  const handleVSCodeExport = () => {
    const vscodeFormat: Record<string, any> = {};
    
    snippets.forEach((s) => {
      // Create a sensible prefix, lowercased, spaces to dashes
      const prefix = s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      vscodeFormat[s.title] = {
        prefix,
        body: s.code.split('\n'),
        description: (s as any).explanation || s.title,
      };
    });

    const dataStr = JSON.stringify(vscodeFormat, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "codelens.code-snippets";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedSnippets = JSON.parse(text);

      if (!Array.isArray(importedSnippets)) {
        alert("Invalid file format. Expected a JSON array of snippets.");
        return;
      }

      const result = await importSnippets(importedSnippets);
      if (result.error) {
        alert("Failed to import: " + result.error);
      } else {
        alert(`Import successful!\n\nImported: ${result.imported} snippets.`);
        loadData();
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to parse the JSON file.");
    } finally {
      setIsDropdownOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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

      const result = await getUserSnippets();
      if (result.snippets) {
        setSnippets(result.snippets as unknown as Snippet[]);
      }
    } catch (error) {
      console.error("Failed to load snippets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  async function handleToggleVisibility(snippetId: string) {
    const snippet = snippets.find((s) => s.id === snippetId);
    if (!snippet) return;

    const result = await toggleSnippetVisibility(snippetId, !snippet.isPublic);
    if (result.snippet) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const shareLink = result.snippet.shareToken
        ? `${baseUrl}/shared/${result.snippet.shareToken}`
        : "";
      if (shareLink && !snippet.isPublic) {
        await copyShareLink(shareLink);
      }
    }
    loadData();
  }

  const filteredSnippets = useMemo(
    () =>
      snippets.filter((s) => {
        const matchesSearch =
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLanguage = filterLanguage === "all" || s.language === filterLanguage;
        
        let matchesView = true;
        if (view === "favorites") {
          matchesView = s.favorites && s.favorites.length > 0;
        } else if (view === "recent") {
          // For recent, we could filter by date - for now show all as recent
          matchesView = true;
        }
        
        return matchesSearch && matchesLanguage && matchesView;
      }),
    [snippets, searchQuery, filterLanguage, view]
  );

  const languages = useMemo(() => Array.from(new Set(snippets.map((s) => s.language))), [snippets]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSnippets = snippets.length;
    const totalLines = snippets.reduce((sum, s) => sum + (s.code.split("\n").length || 0), 0);
    const totalFavorites = snippets.reduce((sum, s) => sum + (s.favorites?.length || 0), 0);
    
    // Find most used language
    const languageCounts = snippets.reduce(
      (acc, s) => {
        acc[s.language] = (acc[s.language] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    
    const mostUsedLanguage = Object.entries(languageCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";
    
    return { totalSnippets, totalLines, totalFavorites, mostUsedLanguage };
  }, [snippets]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation Bar */}
      <nav className="border-b border-cyan-500/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-8 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="w-8 h-8 rounded-md border border-slate-700 bg-slate-900 text-slate-300 hover:text-slate-100 hover:border-slate-600 inline-flex items-center justify-center transition-colors"
              title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
              aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
            <Link href="/" className="text-sm font-bold text-cyan-400 hover:text-cyan-300">
              CodeLens AI
            </Link>
          
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button type="button" title="Notifications" className="text-slate-400 hover:text-slate-200 transition-colors">
              <Bell size={18} />
            </button>
            <button type="button" title="Settings" className="text-slate-400 hover:text-slate-200 transition-colors">
              <Settings size={18} />
            </button>
            <button type="button" className="hidden sm:inline-flex px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition-colors">
              Deploy
            </button>
            <button 
              type="button" 
              title="Logout"
              onClick={() => {
                logoutUser().finally(() => {
                  router.push("/login");
                  router.refresh();
                });
              }}
              className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-600 flex items-center justify-center text-slate-300 hover:text-slate-100 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row md:h-[calc(100vh-60px)]">
        {/* Left Sidebar */}
        <aside className={`${isSidebarOpen ? "block" : "hidden"} w-full md:w-56 border-b md:border-b-0 md:border-r border-cyan-500/10 bg-slate-900/40 backdrop-blur-xl md:overflow-y-auto p-3 md:p-4`}>
          <div className="mb-4 md:mb-8">
          </div>

          <Link href={`/editor?insightLanguage=${encodeURIComponent(explanationLanguage)}`} className="w-full">
            <button type="button" className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mb-4">
              <Plus size={16} />
              New Snippet
            </button>
          </Link>

          <Link href="/discover" className="w-full">
            <button type="button" className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mb-6">
              <Search size={16} />
              Discover Public
            </button>
          </Link>

          <div className="space-y-1">
            <button 
              type="button" 
              onClick={() => setView("all")}
              className={`w-full px-3 py-2 text-left text-sm font-semibold rounded-lg transition-colors uppercase tracking-[0.08em] ${
                view === "all"
                  ? "text-cyan-300 bg-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              ✓ All Snippets
            </button>
            <button 
              type="button" 
              onClick={() => setView("favorites")}
              className={`w-full px-3 py-2 text-left text-xs font-semibold rounded-lg transition-colors uppercase tracking-[0.08em] ${
                view === "favorites"
                  ? "text-cyan-300 bg-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              ★ Favorites
            </button>
            <button 
              type="button" 
              onClick={() => setView("recent")}
              className={`w-full px-3 py-2 text-left text-xs font-semibold rounded-lg transition-colors uppercase tracking-[0.08em] ${
                view === "recent"
                  ? "text-cyan-300 bg-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              ⏱ Recent
            </button>
          </div>

          <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between px-3 mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-[0.08em] font-semibold">Languages</p>
              {filterLanguage !== "all" && (
                <button
                  type="button"
                  onClick={() => setFilterLanguage("all")}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold uppercase tracking-[0.08em]"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setFilterLanguage("all")}
                className={`w-full px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                  filterLanguage === "all"
                    ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                All Languages
              </button>
              {languages.slice(0, 5).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setFilterLanguage(lang)}
                  className={`w-full px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                    filterLanguage === lang
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 uppercase tracking-[0.08em] font-semibold px-3 mb-4">📊 Your Stats</p>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3 px-3">
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-[0.08em]">Total Snippets</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.totalSnippets}</p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-[0.08em]">Total Lines</p>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{stats.totalLines}</p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-[0.08em]">Favorites</p>
                <p className="text-2xl font-bold text-rose-400 mt-1">{stats.totalFavorites}</p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-[0.08em]">Most Used</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">{stats.mostUsedLanguage}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {/* Header Section */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Snippet Dashboard</h1>
            <p className="text-slate-400 text-sm">
              {view === "favorites" 
                ? `Managing ${snippets.filter(s => s.favorites && s.favorites.length > 0).length} favorites`
                : view === "recent"
                ? "Recent snippets"
                : `Managing ${snippets.length} active code functions`
              }
            </p>
          </div>

          {/* Search and Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="relative w-full sm:flex-1 sm:max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search snippets, tags, or keys"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full sm:w-auto px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold rounded-lg transition-colors text-sm uppercase tracking-[0.08em] flex items-center justify-between sm:justify-center gap-2"
              >
                ⚡ Quick Action
                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Upload size={16} className="text-cyan-400" />
                      Import JSON
                    </button>
                    <button
                      type="button"
                      onClick={handleExport}
                      className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Download size={16} className="text-cyan-400" />
                      Export Snippets
                    </button>
                    <button
                      type="button"
                      onClick={handleVSCodeExport}
                      className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Code size={16} className="text-cyan-400" />
                      Export for VS Code
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
          </div>

          {/* Snippets Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block relative w-12 h-12 mb-4">
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-indigo-500 rounded-full animate-spin" />
                  <div className="absolute inset-1 bg-slate-950 rounded-full" />
                </div>
                <p className="text-slate-300 font-semibold">Loading snippets...</p>
              </div>
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-300 mb-2 font-bold text-xl">
                {snippets.length === 0 ? "No snippets yet" : "No results found"}
              </p>
              <p className="text-slate-500 mb-6">
                {snippets.length === 0
                  ? "Create your first snippet and start building your library."
                  : "Try changing search text or filters."}
              </p>
              {snippets.length === 0 && (
                <Link href="/editor" className="inline-block">
                  <button type="button" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                    Create First Snippet
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  id={snippet.id}
                  title={snippet.title}
                  code={snippet.code}
                  language={snippet.language}
                  createdAt={new Date(snippet.createdAt)}
                  isFavorite={snippet.favorites && snippet.favorites.length > 0}
                  isPublic={snippet.isPublic}
                  onFavorite={handleFavorite}
                  onToggleVisibility={handleToggleVisibility}
                  onShare={(id) => {
                    const s = snippets.find(x => x.id === id);
                    if (s?.isPublic && s?.shareToken) {
                      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                      copyShareLink(`${baseUrl}/shared/${s.shareToken}`);
                    } else {
                      alert("Please make the snippet public first to share it.");
                    }
                  }}
                  onEdit={(id) => router.push(`/dashboard/snippet/${id}/edit`)}
                  onDelete={handleDelete}
                  shareToken={snippet.shareToken}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
