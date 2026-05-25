"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Textarea } from "@/components/ui/Textarea";

// Must be imported before dynamic import so CSS is available
// eslint-disable-next-line
import "react-quill/dist/quill.snow.css";

// Dynamically import react-quill to avoid SSR issues (uses document)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// ─── Toolbar Configuration ──────────────────────────────────

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["blockquote", "code-block"],
  [{ color: [] }, { background: [] }],
  ["clean"],
];

// ─── Markdown ↔ HTML Conversion ─────────────────────────────

// Lazy-load marked and turndown only when needed
let markedModule: any = null;
let turndownModule: any = null;
let turndownService: any = null;

async function ensureConverters() {
  if (!markedModule) {
    markedModule = await import("marked");
  }
  if (!turndownService) {
    turndownModule = await import("turndown");
    // Handle both ESM (.default) and CJS (direct) exports
    const TurndownConstructor = turndownModule.default || turndownModule;
    turndownService = new TurndownConstructor({
      headingStyle: "atx",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      emDelimiter: "*",
      strongDelimiter: "**",
      linkStyle: "inlined",
    });
  }
}

function markdownToHtmlSync(md: string): string {
  if (!md) return "";
  try {
    const marked = (markedModule as any)?.marked ?? markedModule;
    if (typeof marked?.parseSync === "function") {
      return marked.parseSync(md, { breaks: true, gfm: true });
    }
    if (typeof marked?.parse === "function") {
      // Some versions return a Promise, but with gfm option it may be sync
      const result = marked.parse(md, { breaks: true, gfm: true });
      return typeof result === "string" ? result : md;
    }
    return md;
  } catch {
    return md;
  }
}

function htmlToMarkdownSync(html: string): string {
  if (!html) return "";
  try {
    return turndownService?.turndown(html) ?? html;
  } catch {
    return html;
  }
}

// ─── Component ──────────────────────────────────────────────

interface WysiwygEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function WysiwygEditor({
  label,
  value,
  onChange,
  required = false,
}: WysiwygEditorProps) {
  const [mode, setMode] = useState<"visual" | "advanced">("visual");
  const [htmlContent, setHtmlContent] = useState("");
  const [convertersReady, setConvertersReady] = useState(false);
  const isInternalUpdate = useRef(false);

  // Initialize converters on mount
  useEffect(() => {
    ensureConverters().then(() => setConvertersReady(true));
  }, []);

  // Sync markdown → HTML when value changes externally
  // (e.g., data loads from API in the edit page)
  useEffect(() => {
    if (!convertersReady) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setHtmlContent(markdownToHtmlSync(value));
  }, [value, convertersReady]);

  const handleHtmlChange = useCallback(
    (html: string) => {
      setHtmlContent(html);
      if (!convertersReady) return;
      try {
        const md = htmlToMarkdownSync(html);
        isInternalUpdate.current = true;
        onChange(md);
      } catch {
        onChange(html);
      }
    },
    [onChange, convertersReady],
  );

  const handleMarkdownChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const switchToVisual = useCallback(() => {
    if (convertersReady) {
      setHtmlContent(markdownToHtmlSync(value));
    }
    setMode("visual");
  }, [value, convertersReady]);

  const switchToAdvanced = useCallback(() => {
    if (convertersReady) {
      try {
        const md = htmlToMarkdownSync(htmlContent);
        isInternalUpdate.current = true;
        onChange(md);
      } catch {
        // Keep current value if conversion fails
      }
    }
    setMode("advanced");
  }, [htmlContent, onChange, convertersReady]);

  const modules = { toolbar: TOOLBAR_OPTIONS };

  return (
    <div className="space-y-2">
      {/* Label + Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-charcoal-700">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
        <div className="flex items-center gap-1 bg-cream-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={switchToVisual}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "visual"
                ? "bg-white text-rose-600 shadow-sm"
                : "text-charcoal-500 hover:text-charcoal-700"
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={switchToAdvanced}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "advanced"
                ? "bg-white text-rose-600 shadow-sm"
                : "text-charcoal-500 hover:text-charcoal-700"
            }`}
          >
            Markdown
          </button>
        </div>
      </div>

      {/* Editor */}
      {mode === "visual" && convertersReady ? (
        <div className="quill-editor-wrapper rounded-xl border border-cream-300 bg-white overflow-hidden">
          <ReactQuill
            value={htmlContent}
            onChange={handleHtmlChange}
            modules={modules}
            theme="snow"
            placeholder="Write your post content here..."
          />
        </div>
      ) : mode === "visual" && !convertersReady ? (
        <div className="rounded-xl border border-cream-300 bg-cream-50 px-4 py-8 text-center font-body text-sm text-charcoal-400">
          Loading editor...
        </div>
      ) : (
        <Textarea
          label=""
          name="content-markdown"
          placeholder="Write your post content here using Markdown syntax..."
          value={value}
          onChange={handleMarkdownChange}
          rows={16}
          required={required}
        />
      )}

      <p className="font-body text-xs text-charcoal-400">
        {mode === "visual"
          ? "Use the toolbar to format your content. Switch to Markdown for raw editing."
          : "Supports Markdown: **bold**, *italic*, [links](url), - lists, etc."}
      </p>
    </div>
  );
}

export default WysiwygEditor;
