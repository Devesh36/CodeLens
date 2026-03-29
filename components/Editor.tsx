"use client";

import { useRef, useEffect, useState } from "react";
import { PROGRAMMING_LANGUAGES, getLanguageName } from "@/lib/utils";

interface EditorInstance {
  getValue: () => string;
  setValue: (value: string) => void;
  onDidChangeModelContent: (callback: () => void) => { dispose: () => void };
  dispose: () => void;
  getModel: () => unknown;
}

interface MonacoLike {
  editor: {
    create: (element: HTMLElement, options: Record<string, unknown>) => EditorInstance;
    defineTheme: (name: string, themeData: Record<string, unknown>) => void;
    setModelLanguage: (model: unknown, language: string) => void;
  };
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange?: (language: string) => void;
  insightLanguage?: string;
  insightLanguageOptions?: string[];
  onInsightLanguageChange?: (language: string) => void;
  onExplain: () => void;
  isLoading?: boolean;
}

export function Editor({
  value,
  onChange,
  language,
  onLanguageChange,
  insightLanguage,
  insightLanguageOptions = [],
  onInsightLanguageChange,
  onExplain,
  isLoading = false,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<EditorInstance | null>(null);
  const [monacoLoaded, setMonacoLoaded] = useState(false);

  useEffect(() => {
    const loadMonaco = async () => {
      // Check if Monaco is already loaded
      const runtimeWindow = window as unknown as Window & {
        monaco?: MonacoLike;
        require?: {
          config: (options: Record<string, unknown>) => void;
          (deps: string[], callback: () => void): void;
        };
      };

      if (runtimeWindow.monaco) {
        setMonacoLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs/loader.min.js";
      script.onload = () => {
        const loader = runtimeWindow.require;
        if (!loader) return;

        loader.config({
          paths: {
            vs: "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs",
          },
        });

        loader(["vs/editor/editor.main"], () => {
          setMonacoLoaded(true);
        });
      };
      document.head.appendChild(script);
    };

    loadMonaco();
  }, []);

  // Create editor only once
  useEffect(() => {
    if (!monacoLoaded || !editorRef.current || editorInstanceRef.current) return;

    const runtimeWindow = window as Window & { monaco?: MonacoLike };
    const monaco = runtimeWindow.monaco;
    if (!monaco) return;

    monaco.editor.defineTheme("codelens-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "5a6784" },
        { token: "keyword", foreground: "7dd3fc" },
        { token: "string", foreground: "86efac" },
        { token: "number", foreground: "c4b5fd" },
      ],
      colors: {
        "editor.background": "#020b1f",
        "editor.lineHighlightBackground": "#0b1732",
        "editorCursor.foreground": "#67e8f9",
        "editorLineNumber.foreground": "#3b4764",
        "editorLineNumber.activeForeground": "#7dd3fc",
        "editor.selectionBackground": "#1d3a73",
      },
    });

    const editor = monaco.editor.create(editorRef.current, {
      value: "",
      language: "javascript",
      theme: "codelens-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      lineNumbers: "on",
      fontSize: 14,
      fontFamily: '"Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace',
      fontLigatures: true,
      lineHeight: 22,
      letterSpacing: 0.3,
      scrollBeyondLastLine: false,
      wordWrap: "on",
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      renderLineHighlight: "line",
      padding: { top: 16, bottom: 16 },
      bracketPairColorization: {
        enabled: true,
      },
    });

    editorInstanceRef.current = editor;

    const subscription = editor.onDidChangeModelContent(() => {
      onChange(editor.getValue());
    });

    return () => {
      subscription.dispose();
      editor.dispose();
      editorInstanceRef.current = null;
    };
  }, [monacoLoaded, onChange]);

  // Keep model value in sync when parent updates programmatically.
  useEffect(() => {
    if (!editorInstanceRef.current) return;
    if (editorInstanceRef.current.getValue() === value) return;
    editorInstanceRef.current.setValue(value);
  }, [value]);

  // Update language when it changes
  useEffect(() => {
    if (!editorInstanceRef.current) return;
    const runtimeWindow = window as Window & { monaco?: MonacoLike };
    const monaco = runtimeWindow.monaco;
    if (!monaco) return;
    const model = editorInstanceRef.current.getModel();
    if (model && language !== "auto") {
      monaco.editor.setModelLanguage(model, language);
    }
  }, [language]);

  return (
    <div className="min-h-0 h-full flex flex-col overflow-hidden rounded-xl border border-cyan-500/10 bg-[#030d23] shadow-[inset_0_0_0_1px_rgba(125,211,252,0.04)]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-cyan-500/10 bg-slate-900/70">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 text-[11px] sm:text-xs text-slate-400 uppercase tracking-[0.12em] truncate">Code Workspace</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="language" className="text-xs text-slate-400 uppercase tracking-[0.12em]">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value)}
            className="h-8 min-w-30 px-2.5 rounded-md border border-slate-700 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
            title="Choose programming language"
          >
            <option value="auto">Auto Detect</option>
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {getLanguageName(lang)}
              </option>
            ))}
          </select>

          {onInsightLanguageChange && (
            <>
              <label htmlFor="insight-language" className="text-xs text-slate-400 uppercase tracking-[0.12em]">
                Insight
              </label>
              <select
                id="insight-language"
                value={insightLanguage}
                onChange={(e) => onInsightLanguageChange(e.target.value)}
                className="h-8 min-w-35 px-2.5 rounded-md border border-slate-700 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                title="Choose insight language"
              >
                {insightLanguageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </>
          )}

          <button
            type="button"
            onClick={onExplain}
            disabled={isLoading || !value.trim()}
            className="h-8 px-3 rounded-md bg-cyan-500/15 border border-cyan-400/25 text-cyan-100 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500/25 transition-colors"
          >
            {isLoading ? "Analyzing" : "Run"}
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="flex-1 min-h-80"
      />
    </div>
  );
}
