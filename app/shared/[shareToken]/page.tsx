"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicSnippet } from "@/app/actions";
import { ExplanationPanel } from "../../../components/ExplanationPanel";
import type { ExplanationResponse } from "@/lib/ai";
import { getLanguageName, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Copy, ArrowLeft, Check, CalendarDays, User, Code2 } from "lucide-react";

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
    const shareToken = params.shareToken as string | undefined;
    if (!shareToken) {
      setError("Snippet token is missing");
      setIsLoading(false);
      return;
    }

    const token = shareToken;

    async function loadSnippet() {
      try {
        const result = await getPublicSnippet(token);
      if (result.error) {
        setError(result.error);
      } else if (result.snippet) {
        setSnippet(result.snippet as PublicSnippet);
      }
      } catch {
        setError("Failed to load snippet");
      } finally {
        setIsLoading(false);
      }
    }

    loadSnippet();
  }, [params.shareToken]);

  function handleCopyCode() {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block relative w-12 h-12 mb-4">
            <div className="absolute inset-0 bg-cyan-500 rounded-full animate-spin" />
            <div className="absolute inset-1 bg-slate-950 rounded-full" />
          </div>
          <p className="text-slate-300 font-semibold">Loading shared snippet...</p>
        </div>
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center rounded-2xl border border-rose-500/25 bg-rose-500/10 px-8 py-8">
          <p className="text-rose-200 mb-5 font-semibold">{error || "Snippet not found"}</p>
          <Link href="/">
            <button type="button" className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg transition-colors">
              Back to CodeLens
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const codeLines = snippet.code.split("\n");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_82%_42%,rgba(79,70,229,0.2),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.35),rgba(2,6,23,0.9)_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 mb-4 text-sm font-semibold">
            <ArrowLeft size={16} />
            Back to CodeLens
          </Link>

          <div className="rounded-2xl border border-cyan-500/10 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{snippet.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/70 px-2.5 py-1.5">
                <User size={14} className="text-slate-400" />
                {snippet.user.name || "Anonymous"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/70 px-2.5 py-1.5">
                <CalendarDays size={14} className="text-slate-400" />
                {formatDate(new Date(snippet.createdAt))}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-400/30 bg-indigo-500/15 px-2.5 py-1.5 text-indigo-200 font-semibold">
                <Code2 size={14} />
                {getLanguageName(snippet.language)}
              </span>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,1fr)] gap-4">
          <article className="rounded-2xl border border-cyan-500/10 bg-slate-900/55 overflow-hidden">
            <header className="px-4 sm:px-5 py-3 border-b border-slate-800/90 bg-slate-950/70 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-200 uppercase tracking-[0.12em]">Source Code</p>
              <button
                onClick={handleCopyCode}
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-500/15 border border-cyan-400/25 text-cyan-100 text-xs font-semibold hover:bg-cyan-500/25 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </header>

            <div className="max-h-[72vh] overflow-auto bg-slate-950">
              <pre className="m-0 p-4 sm:p-5 text-sm font-mono text-slate-200 bg-slate-950">
                {codeLines.map((line, index) => (
                  <div key={`${index + 1}-${line}`} className="grid grid-cols-[36px_1fr] gap-3 leading-6">
                    <span className="text-right text-slate-600 select-none">{index + 1}</span>
                    <code className="whitespace-pre-wrap break-all bg-transparent text-inherit">{line || " "}</code>
                  </div>
                ))}
              </pre>
            </div>
          </article>

          <div className="min-h-140 xl:min-h-[72vh]">
            {snippet.explanationJson ? (
              <ExplanationPanel explanation={snippet.explanationJson as ExplanationResponse} />
            ) : (
              <div className="h-full flex items-center justify-center rounded-2xl border border-cyan-500/10 bg-slate-900/60 p-6">
                <p className="text-slate-400 font-semibold">No explanation available for this snippet.</p>
              </div>
            )}
          </div>
        </section>

        {snippet.tags.length > 0 && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/45 p-5">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-[0.12em] mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {snippet.tags.map((item) => (
                <span
                  key={item.tag.name}
                  className="px-3 py-1.5 text-xs rounded-full border border-cyan-400/25 bg-cyan-500/10 text-cyan-200 font-semibold"
                >
                  #{item.tag.name}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-8 text-center rounded-2xl border border-slate-800 bg-slate-900/45 px-6 py-6">
          <p className="text-slate-300 text-sm mb-4">Want to create your own code explanations?</p>
          <Link href="/signup">
            <button type="button" className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg transition-colors">
              Sign Up for CodeLens AI
            </button>
          </Link>
        </footer>
      </div>
    </div>
  );
}
