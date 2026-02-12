"use client";

import { ExplanationResponse } from "@/lib/ai";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ExplanationPanelProps {
  explanation: ExplanationResponse | null;
  isLoading?: boolean;
}

export function ExplanationPanel({
  explanation,
  isLoading = false,
}: ExplanationPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="text-center">
          <div className="inline-block relative w-10 h-10 mb-4">
            <div className="absolute inset-0 bg-teal-600 rounded-full animate-spin" style={{ animation: "spin 1s linear infinite" }} />
            <div className="absolute inset-1 bg-white rounded-full" />
          </div>
          <p className="text-gray-900 font-semibold">Analyzing code</p>
          <p className="text-gray-600 text-sm mt-1">This usually takes a few seconds</p>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-900 font-semibold text-lg">
            Ready to analyze
          </p>
          <p className="text-gray-600 text-sm mt-2">Write code and click "Explain" to see AI-powered analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-auto h-full border border-gray-200 shadow-sm">
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="pb-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Summary</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed text-sm">
              {explanation.summary}
            </p>
          </div>
        </div>

        {/* Complexity Badge */}
        <div className="flex items-center justify-between pb-5 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Complexity</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              explanation.complexity === "Simple"
                ? "bg-green-100 text-green-700"
                : explanation.complexity === "Moderate"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {explanation.complexity}
          </span>
        </div>

        {/* Line-by-line Explanations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Line-by-Line Analysis</h2>
            <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded">
              {explanation.lineExplanations.length} lines
            </span>
          </div>
          <div className="space-y-3">
            {explanation.lineExplanations.map((item, index) => (
              <div
                key={index}
                className="group bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-teal-600 text-white rounded text-xs font-semibold">
                      {item.line}
                    </span>
                    <span className="text-gray-600 text-xs font-medium">Line {item.line}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.explanation)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white rounded"
                    title="Copy explanation"
                    type = "button"
                  >
                    {copied ? (
                      <Check size={14} className="text-teal-600" />
                    ) : (
                      <Copy size={14} className="text-gray-500" />
                    )}
                  </button>
                </div>
                {item.code && (
                  <div className="mb-2 bg-white border border-gray-200 rounded px-3 py-2">
                    <code className="text-xs font-mono text-gray-800">{item.code}</code>
                  </div>
                )}
                <p className="text-gray-700 text-sm leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mt-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">Suggested Improvements</h2>
          <ul className="space-y-2">
            {explanation.improvements.map((improvement, index) => (
              <li
                key={improvement }
                className="flex items-start gap-2 text-gray-700 text-sm"
              >
                <span className="text-teal-600 font-bold mt-0.5 flex-shrink-0">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
