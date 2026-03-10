"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CharacterCount from "@tiptap/extension-character-count";
import { Toolbar } from "./toolbar";

interface Props {
  content: string;
  onChange?: (content: string) => void;
  editable?: boolean;
}

export function TiptapEditor({ content, onChange, editable = true }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, HTMLAttributes: { class: "text-primary underline" } }),
      Image.configure({ inline: false, allowBase64: true }),
      Underline,
      Placeholder.configure({ placeholder: "Start writing..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CharacterCount,
    ],
    content: content ? (() => { try { return JSON.parse(content); } catch { return content; } })() : undefined,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(JSON.stringify(editor.getJSON()));
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap outline-none min-h-[200px] sm:min-h-[300px] p-3 sm:p-4 text-base sm:text-base",
      },
    },
  });

  if (!editor) return null;

  const charCount = editor.storage.characterCount;

  return (
    <div className="border border-border rounded-lg sm:rounded-xl overflow-hidden bg-bg">
      {editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
      {editable && (
        <div className="border-t border-border px-3 py-1.5 text-xs text-text-secondary flex items-center gap-3">
          <span>{charCount.characters()} ký tự</span>
          <span>{charCount.words()} từ</span>
        </div>
      )}
    </div>
  );
}
