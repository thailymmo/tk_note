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
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Table,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface Props {
  editor: Editor;
}

const COLORS = [
  "#000000", "#434343", "#666666", "#999999",
  "#e03131", "#c2255c", "#9c36b5", "#6741d9",
  "#3b5bdb", "#1971c2", "#0c8599", "#099268",
  "#2b8a3e", "#5c940d", "#e8590c", "#d9480f",
];

export function Toolbar({ editor }: Props) {
  const [showColors, setShowColors] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setShowColors(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { icon: Underline, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline") },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike") },
    { icon: Highlighter, action: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive("highlight") },
    null,
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    null,
    { icon: AlignLeft, action: () => editor.chain().focus().setTextAlign("left").run(), active: editor.isActive({ textAlign: "left" }) },
    { icon: AlignCenter, action: () => editor.chain().focus().setTextAlign("center").run(), active: editor.isActive({ textAlign: "center" }) },
    { icon: AlignRight, action: () => editor.chain().focus().setTextAlign("right").run(), active: editor.isActive({ textAlign: "right" }) },
    null,
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock") },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
    { icon: Table, action: insertTable, active: editor.isActive("table") },
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
      {/* Color picker */}
      <div className="relative" ref={colorRef}>
        <button
          type="button"
          onClick={() => setShowColors(!showColors)}
          className={cn(
            "p-1.5 sm:p-1.5 rounded-md hover:bg-bg-tertiary transition-colors touch-manipulation",
            showColors && "bg-bg-tertiary text-primary"
          )}
        >
          <Palette className="w-4 h-4" />
        </button>
        {showColors && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-bg border border-border rounded-lg shadow-lg z-20 grid grid-cols-4 gap-1 w-[140px]">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  editor.chain().focus().setColor(color).run();
                  setShowColors(false);
                }}
                className="w-7 h-7 rounded-md border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setShowColors(false);
              }}
              className="w-7 h-7 rounded-md border border-border hover:scale-110 transition-transform text-xs col-span-4 bg-bg-secondary"
            >
              Mặc định
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
