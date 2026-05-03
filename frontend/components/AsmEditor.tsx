"use client";

import { useEffect, useRef } from "react";
import {
    EditorView,
    keymap,
    lineNumbers,
    highlightActiveLine,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, historyKeymap, history } from "@codemirror/commands";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { asmLanguage } from "@/lib/asm-language";

const asmTheme = EditorView.theme(
    {
        "&": {
            height: "100%",
            backgroundColor: "transparent",
            fontSize: "12px",
            fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        },
        ".cm-content": { padding: "8px 0", caretColor: "#a5b4fc" },
        ".cm-line": { padding: "0 12px" },
        ".cm-cursor": { borderLeftColor: "#a5b4fc" },
        ".cm-activeLine": { backgroundColor: "rgba(165,180,252,0.05)" },
        ".cm-gutters": {
            backgroundColor: "#0f1117",
            borderRight: "1px solid #1f2937",
            color: "#4b5563",
        },
        ".cm-activeLineGutter": { backgroundColor: "rgba(165,180,252,0.05)" },
        ".cm-selectionBackground, ::selection": {
            backgroundColor: "rgba(165,180,252,0.15) !important",
        },
    },
    { dark: true },
);

const asmHighlight = HighlightStyle.define([
    { tag: tags.keyword, color: "#a5b4fc", fontWeight: "600" },
    { tag: tags.variableName, color: "#34d399" },
    { tag: tags.number, color: "#fb923c" },
    { tag: tags.comment, color: "#4b5563", fontStyle: "italic" },
    { tag: tags.labelName, color: "#f472b6" },
]);

interface AsmEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function AsmEditor({ value, onChange }: AsmEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!containerRef.current) return;

        const view = new EditorView({
            state: EditorState.create({
                doc: value,
                extensions: [
                    history(),
                    lineNumbers(),
                    highlightActiveLine(),
                    keymap.of([...defaultKeymap, ...historyKeymap]),
                    asmLanguage,
                    syntaxHighlighting(asmHighlight),
                    asmTheme,
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            onChangeRef.current(update.state.doc.toString());
                        }
                    }),
                    EditorView.lineWrapping,
                ],
            }),
            parent: containerRef.current,
        });

        viewRef.current = view;
        return () => {
            view.destroy();
            viewRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;
        const current = view.state.doc.toString();
        if (current !== value) {
            view.dispatch({
                changes: { from: 0, to: current.length, insert: value },
            });
        }
    }, [value]);

    return <div ref={containerRef} className="h-full overflow-auto" />;
}
