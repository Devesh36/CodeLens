"use client";

import { formatDate, truncateText, getLanguageName } from "@/lib/utils";
import Link from "next/link";
import { Heart, Share2, Edit2, Trash2 } from "lucide-react";

interface SnippetCardProps {
  id: string;
  title: string;
  code: string;
  language: string;
  createdAt: Date;
  isFavorite?: boolean;
  onFavorite?: (snippetId: string) => void;
  onEdit?: (snippetId: string) => void;
  onDelete?: (snippetId: string) => void;
  onShare?: (snippetId: string) => void;
  shareToken?: string | null;
}

export function SnippetCard({
  id,
  title,
  code,
  language,
  createdAt,
  isFavorite = false,
  onFavorite,
  onEdit,
  onDelete,
  onShare,
  shareToken,
}: SnippetCardProps) {
  return (
    <article className="group rounded-xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/40">
      <div className="h-1 bg-linear-to-r from-cyan-500 via-indigo-500 to-purple-500" />
      
      {/* Header */}
      <div className="p-4 border-b border-slate-700/30 bg-slate-950/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/snippet/${id}`}>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 truncate cursor-pointer transition-colors">
                {title}
              </h3>
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-xs text-slate-400">
                📅 {formatDate(createdAt)}
              </p>
              {shareToken && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                  Public
                </span>
              )}
            </div>
          </div>
          <span className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-lg whitespace-nowrap border border-indigo-500/30 shrink-0">
            {getLanguageName(language)}
          </span>
        </div>
      </div>

      {/* Code Preview */}
      <div className="px-4 py-3 bg-black border-b border-slate-700/30">
        <pre className="text-xs text-slate-500 overflow-hidden font-mono leading-relaxed">
          <code>{truncateText(code, 200)}</code>
        </pre>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-slate-950/80 flex items-center justify-end gap-2">
        {onFavorite && (
          <button
            type="button"
            onClick={() => onFavorite(id)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isFavorite
                ? "text-rose-400 bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30"
                : "text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30"
            }`}
            title="Add to favorites"
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
        {onShare && (
          <button
            type="button"
            onClick={() => onShare(id)}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/30 transition-all duration-200"
            title="Share snippet"
          >
            <Share2 size={16} />
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(id)}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/30 transition-all duration-200"
            title="Edit snippet"
          >
            <Edit2 size={16} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete this snippet?")) {
                onDelete(id);
              }
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 transition-all duration-200"
            title="Delete snippet"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </article>
  );
}
