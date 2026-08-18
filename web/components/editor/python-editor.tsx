"use client";

import { useEffect, useRef } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, indentOnInput, syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { oneDark } from "@codemirror/theme-one-dark";
import { tags } from "@lezer/highlight";
import { useIsDark } from "@/hooks/use-is-dark";

const lightTheme = EditorView.theme({
  "&": {
    backgroundColor: "#ffffff",
    color: "#1e293b",
  },
  ".cm-gutters": {
    backgroundColor: "#f8fafc",
    color: "#94a3b8",
    borderRight: "1px solid #e2e8f0",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#f1f5f9",
  },
  ".cm-activeLine": {
    backgroundColor: "#f8fafc",
  },
  ".cm-selectionBackground": {
    backgroundColor: "#dbeafe !important",
  },
  ".cm-cursor": {
    borderLeftColor: "#1e293b",
  },
  ".cm-matchingBracket": {
    backgroundColor: "#e0e7ff",
    outline: "1px solid #a5b4fc",
  },
}, { dark: false });

const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#7c3aed" },
  { tag: tags.function(tags.variableName), color: "#2563eb" },
  { tag: tags.definition(tags.variableName), color: "#0d9488" },
  { tag: tags.string, color: "#059669" },
  { tag: tags.number, color: "#d97706" },
  { tag: tags.bool, color: "#d97706" },
  { tag: tags.comment, color: "#94a3b8", fontStyle: "italic" },
  { tag: tags.operator, color: "#be185d" },
  { tag: tags.className, color: "#7c3aed" },
  { tag: tags.typeName, color: "#7c3aed" },
  { tag: tags.propertyName, color: "#0369a1" },
  { tag: tags.punctuation, color: "#64748b" },
]);

interface PythonEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function PythonEditor({ value, onChange, readOnly = false, className = "" }: PythonEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isDark = useIsDark();

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        bracketMatching(),
        closeBrackets(),
        indentOnInput(),
        python(),
        isDark ? oneDark : [lightTheme, syntaxHighlighting(lightHighlightStyle)],
        syntaxHighlighting(HighlightStyle.define([]), { fallback: true }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...closeBracketsKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorState.readOnly.of(readOnly),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "13px",
          },
          ".cm-scroller": {
            fontFamily: "var(--font-jetbrains-mono), monospace",
            overflow: "auto",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Recreate editor when theme changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  // Update editor content when value prop changes externally
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-hidden ${className}`}
    />
  );
}
