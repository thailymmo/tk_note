"use client";

import { useEffect, useState } from "react";
import { FolderOpen, ExternalLink } from "lucide-react";

interface AdminNote {
  id: string;
  title: string;
  ownerEmail: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  shareCount: number;
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/notes")
      .then((r) => r.json())
      .then((d) => {
        setNotes(d.notes || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <FolderOpen className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold">All Notes</h1>
        <span className="text-sm text-text-secondary ml-1 sm:ml-2">
          ({notes.length})
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-secondary border-b border-border">
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium">Owner</th>
              <th className="text-left p-3 font-medium">Shares</th>
              <th className="text-left p-3 font-medium">Created</th>
              <th className="text-left p-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr
                key={note.id}
                className="border-b border-border last:border-0 hover:bg-bg-secondary"
              >
                <td className="p-3 font-medium">
                  {note.title || "Untitled"}
                </td>
                <td className="p-3 text-text-secondary">
                  <div>{note.ownerName}</div>
                  <div className="text-xs">{note.ownerEmail}</div>
                </td>
                <td className="p-3">
                  {note.shareCount > 0 && (
                    <span className="flex items-center gap-1 text-primary">
                      <ExternalLink className="w-3 h-3" />
                      {note.shareCount}
                    </span>
                  )}
                </td>
                <td className="p-3 text-text-secondary">
                  {new Date(note.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-text-secondary">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-bg-secondary border border-border rounded-xl p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm">
                {note.title || "Untitled"}
              </h3>
              {note.shareCount > 0 && (
                <span className="flex items-center gap-1 text-primary text-xs shrink-0">
                  <ExternalLink className="w-3 h-3" />
                  {note.shareCount}
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">
              {note.ownerName} &middot; {note.ownerEmail}
            </p>
            <div className="flex gap-3 text-xs text-text-secondary">
              <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
