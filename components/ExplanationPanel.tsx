"use client";

import type { ExplanationResponse } from "@/lib/ai";
import { Bot, Check, Copy, Share2, Zap } from "lucide-react";
import { useState } from "react";

interface ExplanationPanelProps {
  explanation: ExplanationResponse | null;
  isLoading?: boolean;
  onExplain?: () => void;
  onCopyExplanation?: () => void;
  onShareInsight?: () => void;
  canExplain?: boolean;
  hasExplanation?: boolean;
}

function getComplexityClass(complexity: string): string {
  if (complexity === "Simple") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }

  if (complexity === "Moderate") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }

  return "border-rose-400/30 bg-rose-400/10 text-rose-200";
}

function ActionBar({
  onExplain,
  onCopyExplanation,
  onShareInsight,
  canExplain,
  hasExplanation,
}: Pick<
  ExplanationPanelProps,
  "onExplain" | "onCopyExplanation" | "onShareInsight" | "canExplain" | "hasExplanation"
>) {
  if (!onExplain && !onCopyExplanation && !onShareInsight) return null;

  return (
    <div className="p-3 border-t border-cyan-500/10 bg-slate-950/85 flex flex-wrap gap-2">
      {onExplain && (
        <button
          type="button"
          onClick={onExplain}
          disabled={!canExplain}
          className="px-4 py-2.5 rounded-lg bg-linear-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(99,102,241,0.42)] hover:from-indigo-400 hover:to-violet-400 transition-all"
        >
          <Zap size={15} />
          Explain Code
        </button>
      )}

      {onCopyExplanation && (
        <button
          type="button"
          onClick={onCopyExplanation}
          disabled={!hasExplanation}
          className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
        >
          <Copy size={15} />
          Copy Explanation
        </button>
      )}

      {onShareInsight && (
        <button
          type="button"
          onClick={onShareInsight}
          disabled={!hasExplanation}
          className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
        >
          <Share2 size={15} />
          Share Insight
        </button>
      )}
    </div>
  );
}

export function ExplanationPanel({
  explanation,
  isLoading = false,
  onExplain,
  onCopyExplanation,
  onShareInsight,
  canExplain = false,
  hasExplanation = false,
}: ExplanationPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="h-full rounded-xl border border-cyan-500/10 bg-[#040f28] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block relative w-10 h-10 mb-4">
            <div className="absolute inset-0 bg-cyan-500 rounded-full animate-spin" />
            <div className="absolute inset-1 bg-[#040f28] rounded-full" />
          </div>
          <p className="text-slate-100 font-semibold">Analyzing code</p>
          <p className="text-slate-400 text-sm mt-1">Extracting insights from structure, context, and complexity</p>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="h-full rounded-xl border border-cyan-500/10 bg-[#040f28] overflow-hidden flex flex-col">
        <div className="p-5 md:p-6 space-y-5 flex-1 overflow-auto">
          <div className="flex items-center justify-between pb-4 border-b border-cyan-500/10">
            <h2 className="text-2xl font-bold text-slate-100 inline-flex items-center gap-2">
              <Bot size={20} className="text-cyan-300" />
              AI Insights
            </h2>
            <span className="px-3 py-1 rounded-full text-[11px] uppercase tracking-wide font-semibold border border-slate-600 bg-slate-800 text-slate-300">
              Waiting for analysis
            </span>
          </div>

          <div className="rounded-xl border border-cyan-500/10 bg-slate-900/70 p-4">
            <p className="text-slate-300 leading-relaxed text-sm">
              Run analysis to generate semantic insights, line-level explanations, and optimization recommendations.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-cyan-500/10 bg-slate-900/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">L1-2</p>
              <h3 className="text-slate-100 font-semibold mt-1 text-sm">Asynchronous Entry</h3>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">Defines a high-level orchestration flow. The use of async indicates non-blocking operations.</p>
            </div>
            <div className="rounded-xl border border-cyan-500/10 bg-slate-900/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">L4-7</p>
              <div className="h-3 rounded bg-slate-800 mb-2" />
              <div className="h-3 rounded bg-slate-800 w-2/3" />
            </div>
            <div className="rounded-xl border border-cyan-500/10 bg-slate-900/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">L13-17</p>
              <h3 className="text-slate-100 font-semibold mt-1 text-sm">Data Transformation</h3>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">Maps the AI response into a normalized structure for UI rendering and scoring.</p>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/10 bg-slate-900/65 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300 mb-3">Optimization Tips</h3>
            <ul className="space-y-2">
              <li className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-cyan-300 mt-0.5">◦</span>
                <span>Add a retry mechanism for transient AI service errors.</span>
              </li>
              <li className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-cyan-300 mt-0.5">◦</span>
                <span>Use a circuit breaker pattern for frequently called analysis paths.</span>
              </li>
            </ul>
          </div>
        </div>

        <ActionBar
          onExplain={onExplain}
          onCopyExplanation={onCopyExplanation}
          onShareInsight={onShareInsight}
          canExplain={canExplain}
          hasExplanation={hasExplanation}
        />
      </div>
    );
  }

  return (
    <div className="h-full rounded-xl border border-cyan-500/10 bg-[#040f28] overflow-hidden flex flex-col">
      <div className="p-5 md:p-6 space-y-5 flex-1 overflow-auto">
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/10">
          <h2 className="text-2xl font-bold text-slate-100 inline-flex items-center gap-2">
            <Bot size={20} className="text-cyan-300" />
            AI Insights
          </h2>
          <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wide font-semibold border ${getComplexityClass(explanation.complexity)}`}>
            {explanation.complexity} Complexity
          </span>
        </div>

        <div className="rounded-xl border border-cyan-500/10 bg-slate-900/70 p-4">
          <p className="text-slate-300 leading-relaxed text-sm">{explanation.summary}</p>
        </div>

        <div className="space-y-3">
          {explanation.lineExplanations.map((item) => (
            <div key={`${item.line}-${item.code}`} className="rounded-xl border border-cyan-500/10 bg-slate-900/65 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">L{item.line}</p>
                <button
                  onClick={() => copyToClipboard(item.explanation)}
                  className="p-1 rounded hover:bg-slate-800 transition-colors"
                  title="Copy explanation"
                  type="button"
                >
                  {copied ? <Check size={14} className="text-cyan-300" /> : <Copy size={14} className="text-slate-400" />}
                </button>
              </div>

              <h3 className="text-slate-100 font-semibold mt-1 text-sm">{item.code?.trim() ? item.code.trim() : "Code Insight"}</h3>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">{item.explanation}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-cyan-500/10 bg-slate-900/65 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300 mb-3">Optimization Tips</h3>
          <ul className="space-y-2">
            {explanation.improvements.map((improvement) => (
              <li key={improvement} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-cyan-300 mt-0.5">◦</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ActionBar
        onExplain={onExplain}
        onCopyExplanation={onCopyExplanation}
        onShareInsight={onShareInsight}
        canExplain={canExplain}
        hasExplanation={hasExplanation}
      />
    </div>
  );
}
