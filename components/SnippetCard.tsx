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
}: SnippetCardProps) {
  return (
    <div className="group bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-primary-400 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1 card-hover">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/snippet/${id}`}>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 truncate cursor-pointer transition-colors">
                {title}
              </h3>
            </Link>
            <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
              <span>📅</span>
              {formatDate(createdAt)}
            </p>
          </div>
          <span className="px-3 py-1.5 bg-gradient-to-r from-primary-100 to-emerald-100 text-primary-700 text-xs font-semibold rounded-full whitespace-nowrap border border-primary-300 flex-shrink-0">
            {getLanguageName(language)}
          </span>
        </div>
      </div>

      {/* Code Preview */}
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 group-hover:bg-primary-50 transition-colors">
        <pre className="text-xs text-gray-700 overflow-hidden font-mono leading-relaxed">
          <code>{truncateText(code, 200)}</code>
        </pre>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white flex items-center justify-end gap-2">
        {onFavorite && (
          <button
            onClick={() => onFavorite(id)}
            className={`p-2.5 rounded-lg transition-all duration-200 transform hover:scale-110 ${
              isFavorite
                ? "text-emerald-600 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300"
                : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-100 border border-transparent hover:border-emerald-300"
            }`}
            title="Add to favorites"
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
        {onShare && (
          <button
            onClick={() => onShare(id)}
            className="p-2.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-100 border border-transparent hover:border-primary-300 transition-all duration-200 transform hover:scale-110"
            title="Share snippet"
          >
            <Share2 size={18} />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(id)}
            className="p-2.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-100 border border-transparent hover:border-primary-300 transition-all duration-200 transform hover:scale-110"
            title="Edit snippet"
          >
            <Edit2 size={18} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => {
              if (confirm("Delete this snippet?")) {
                onDelete(id);
              }
            }}
            className="p-2.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-100 border border-transparent hover:border-red-300 transition-all duration-200 transform hover:scale-110"
            title="Delete snippet"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
            }}
            className="p-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/30 border border-transparent hover:border-red-700/50 transition-all duration-200 transform hover:scale-110"
            title="Delete snippet"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
