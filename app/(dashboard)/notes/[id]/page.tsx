"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { ShareDialog } from "@/components/notes/share-dialog";
import { LinkManager, type NoteLink } from "@/components/notes/link-manager";
import { ArrowLeft, Share2, Check, Loader2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  links: string;
  slug: string | null;
  updatedAt: string;
}

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<NoteLink[]>([]);

  const titleRef = useRef<string>("");
  const contentRef = useRef<string>("");
  const linksRef = useRef<NoteLink[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        setNote(d.note);
        titleRef.current = d.note.title;
        contentRef.current = d.note.content;
        const parsedLinks = (() => {
          try { return JSON.parse(d.note.links || "[]"); } catch { return []; }
        })();
        setLinks(parsedLinks);
        linksRef.current = parsedLinks;
        setLoading(false);
      })
      .catch(() => router.push("/notes"));
  }, [id, router]);

  const save = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleRef.current,
        content: contentRef.current,
        links: linksRef.current,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [id]);

  const debounceSave = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, 1500);
  }, [save]);

  const handleTitleChange = (value: string) => {
    titleRef.current = value;
    setNote((prev) => (prev ? { ...prev, title: value } : prev));
    debounceSave();
  };

  const handleContentChange = (value: string) => {
    contentRef.current = value;
    debounceSave();
  };

  const handleLinksChange = (newLinks: NoteLink[]) => {
    setLinks(newLinks);
    linksRef.current = newLinks;
    debounceSave();
  };

  // Ctrl+S to save immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        clearTimeout(timeoutRef.current);
        save();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [save]);

  if (loading || !note) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sticky top bar for editor */}
      <div className="sticky top-[52px] lg:top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-border px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/notes")}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text transition-colors touch-manipulation p-1 -ml-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </span>
            )}
            {saved && (
              <span className="flex items-center gap-1 text-xs text-success">
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            )}
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-border hover:bg-bg-secondary transition-colors text-sm touch-manipulation"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6">
        <input
          type="text"
          value={note.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full text-xl sm:text-3xl font-bold bg-transparent border-none outline-none mb-3 sm:mb-4 placeholder-text-secondary"
          placeholder="Note title..."
        />

        {/* Link manager */}
        <LinkManager
          links={links}
          slug={note.slug}
          onChange={handleLinksChange}
        />

        <TiptapEditor
          content={note.content}
          onChange={handleContentChange}
          editable={true}
        />
      </div>

      <ShareDialog
        noteId={id}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
