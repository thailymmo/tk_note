"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
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

  return (
    <div className="border border-border rounded-lg sm:rounded-xl overflow-hidden bg-bg">
      {editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
