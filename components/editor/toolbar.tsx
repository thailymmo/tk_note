"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  ImageIcon,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  editor: Editor;
}

export function Toolbar({ editor }: Props) {
  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { icon: Underline, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline") },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike") },
    null,
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    null,
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock") },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
    null,
    { icon: Link, action: addLink, active: editor.isActive("link") },
    { icon: ImageIcon, action: addImage, active: false },
    null,
    { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5 sm:p-2 bg-bg-secondary overflow-x-auto">
      {buttons.map((btn, i) => {
        if (!btn) {
          return <div key={i} className="w-px h-5 sm:h-6 bg-border mx-0.5 sm:mx-1 hidden sm:block" />;
        }
        const Icon = btn.icon;
        return (
          <button
            key={i}
            type="button"
            onClick={btn.action}
            className={cn(
              "p-1.5 sm:p-1.5 rounded-md hover:bg-bg-tertiary transition-colors touch-manipulation",
              btn.active && "bg-bg-tertiary text-primary"
            )}
          >
            <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
          </button>
        );
      })}
    </div>
  );
}
