"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import {
  Eye,
  Edit3,
  Loader2,
  Check,
  Sun,
  Moon,
  FileText,
  ArrowRight,
} from "lucide-react";

interface NoteData {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function SharedNotePage() {
  const params = useParams();
  const token = params.token as string;

  const [note, setNote] = useState<NoteData | null>(null);
  const [mode, setMode] = useState<string>("readonly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [entered, setEntered] = useState(false);
  const [dark, setDark] = useState(false);

  const titleRef = useRef("");
  const contentRef = useRef("");
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setNote(d.note);
        setMode(d.mode);
        titleRef.current = d.note.title;
        contentRef.current = d.note.content;
        setLoading(false);
      })
      .catch(() => {
        setError("Share link not found or expired");
        setLoading(false);
      });
  }, [token]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const save = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/share/${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleRef.current,
        content: contentRef.current,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [token]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (!note) return null;

  const editable = mode === "editable";

  // Landing page before entering
  if (!entered) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Shared Note</h1>
            <p className="text-text-secondary">
              Someone shared a note with you
            </p>
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-4 space-y-3 text-left">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Title</p>
              <p className="font-semibold">{note.title || "Untitled"}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Permission</p>
              <div className="flex items-center gap-2">
                {editable ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs">
                    <Edit3 className="w-3 h-3" />
                    Can Edit
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                    <Eye className="w-3 h-3" />
                    Read Only
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setEntered(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors font-medium text-base"
          >
            View Note
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    );
  }

  // Note view
  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {editable ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs">
                <Edit3 className="w-3 h-3" />
                Editable
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                <Eye className="w-3 h-3" />
                Read Only
              </span>
            )}
            <span className="text-text-secondary hidden sm:inline">Shared note</span>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1 text-xs sm:text-sm text-text-secondary">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </span>
            )}
            {saved && (
              <span className="flex items-center gap-1 text-xs sm:text-sm text-success">
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-secondary transition-colors"
              title={dark ? "Light Mode" : "Dark Mode"}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        {editable ? (
          <input
            type="text"
            value={note.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-xl sm:text-3xl font-bold bg-transparent border-none outline-none mb-3 sm:mb-4"
            placeholder="Note title..."
          />
        ) : (
          <h1 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">{note.title}</h1>
        )}

        <TiptapEditor
          content={note.content}
          onChange={handleContentChange}
          editable={editable}
        />
      </div>
    </div>
  );
}
