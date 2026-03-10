"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Plus, Search } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((d) => {
        setNotes(d.notes || []);
        setLoading(false);
      });
  }, []);

  const createNote = async () => {
    const res = await fetch("/api/notes", { method: "POST" });
    if (res.ok) {
      const { note } = await res.json();
      router.push(`/notes/${note.id}`);
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  const getPreview = (content: string) => {
    try {
      const json = JSON.parse(content);
      const texts: string[] = [];
      const extract = (node: { text?: string; content?: unknown[] }) => {
        if (node.text) texts.push(node.text);
        if (node.content)
          node.content.forEach((c: unknown) =>
            extract(c as { text?: string; content?: unknown[] })
          );
      };
      extract(json);
      return texts.join(" ").slice(0, 120) || "Empty note";
    } catch {
      return content?.slice(0, 120) || "Empty note";
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-3 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-bold">My Notes</h1>
        <button
          onClick={createNote}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="relative mb-3 sm:mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-lg border border-border bg-bg-secondary text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-text-secondary">
          <FileText className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 opacity-50" />
          <p className="text-base sm:text-lg">
            {notes.length === 0
              ? "No notes yet. Create one!"
              : "No matching notes"}
          </p>
          {notes.length === 0 && (
            <button
              onClick={createNote}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Create First Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-2 sm:gap-3">
          {filtered.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              className="group p-3 sm:p-4 bg-bg-secondary border border-border rounded-xl hover:border-primary/50 cursor-pointer transition-colors active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-sm sm:text-base">
                    {note.title || "Untitled"}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1 line-clamp-2">
                    {getPreview(note.content)}
                  </p>
                  <p className="text-xs text-text-secondary mt-1.5 sm:mt-2">
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteNote(note.id, e)}
                  className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-bg-tertiary opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all shrink-0 touch-manipulation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile FAB - floating action button */}
      <button
        onClick={createNote}
        className="sm:hidden fixed bottom-6 right-4 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover active:scale-95 flex items-center justify-center z-20 touch-manipulation"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
