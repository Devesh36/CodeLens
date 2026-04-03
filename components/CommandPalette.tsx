"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, User, Compass } from "lucide-react";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!isOpen) return null;

  const actions = [
    { id: "new", name: "Create New Snippet", icon: Plus, action: () => router.push("/editor") },
    { id: "discover", name: "Discover Public Snippets", icon: Compass, action: () => router.push("/discover") },
    { id: "dashboard", name: "Go to Dashboard", icon: User, action: () => router.push("/dashboard") },
  ];

  const filtered = actions.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-slate-800">
          <Search className="text-slate-500" size={20} />
          <input
            autoFocus
            className="w-full bg-transparent border-none px-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-slate-500 text-sm">No results found.</p>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors"
              >
                <item.icon size={18} />
                {item.name}
              </button>
            ))
          )}
        </div>
        <div className="bg-slate-950 p-2 text-xs text-slate-500 text-center border-t border-slate-800">
          Press <kbd className="bg-slate-800 px-1 rounded text-slate-400 font-mono">esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
