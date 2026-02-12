"use client";

import { useRef, useEffect, useState } from "react";
import { PROGRAMMING_LANGUAGES, getLanguageName } from "@/lib/utils";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onExplain: () => void;
  isLoading?: boolean;
}

export function Editor({
  value,
  onChange,
  language,
  onExplain,
  isLoading = false,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const [monacoLoaded, setMonacoLoaded] = useState(false);

  useEffect(() => {
    const loadMonaco = async () => {
      // Check if Monaco is already loaded
      // @ts-expect-error - Monaco editor is loaded dynamically
      if (window.monaco) {
        setMonacoLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs/loader.min.js";
      script.onload = () => {
        // `require` is injected by the Monaco loader script at runtime
        const require = (window as any).require;
        require.config({
          paths: {
            vs: "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs",
          },
        });
        // call the loader registered by Monaco's loader script
        require(["vs/editor/editor.main"], () => {
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

    // @ts-expect-error - Monaco editor is loaded dynamically
    const editor = window.monaco.editor.create(editorRef.current, {
      value: value,
      language: language === "auto" ? "javascript" : language,
      theme: "vs",
      automaticLayout: true,
      minimap: { enabled: true },
      lineNumbers: "on",
      fontSize: 15,
      fontFamily: '"Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace',
      fontLigatures: true,
      lineHeight: 24,
      letterSpacing: 0.5,
      scrollBeyondLastLine: false,
      wordWrap: "on",
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      renderLineHighlight: "all",
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
  }, [monacoLoaded]);

  // Update language when it changes
  useEffect(() => {
    if (!editorInstanceRef.current) return;
    // @ts-expect-error - Monaco editor is loaded dynamically
    const monaco = window.monaco;
    const model = editorInstanceRef.current.getModel();
    if (model && language !== "auto") {
      monaco.editor.setModelLanguage(model, language);
    }
  }, [language]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            Language:
          </span>
          <span className="px-3 py-1.5 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 text-sm font-medium">
            {language === "auto" ? "Auto-detect" : getLanguageName(language)}
          </span>
        </div>
        <button
          onClick={onExplain}
          disabled={isLoading || !value.trim()}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent" />
              Analyzing...
            </>
          ) : (
            "Explain Code"
          )}
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="flex-1 bg-white min-h-96"
      />
    </div>
  );
}
