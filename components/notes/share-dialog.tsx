"use client";

import { useState, useEffect } from "react";
import { X, Copy, Trash2, Check, Link as LinkIcon } from "lucide-react";

interface Share {
  id: string;
  token: string;
  mode: string;
  createdAt: string;
}

interface Props {
  noteId: string;
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ noteId, open, onClose }: Props) {
  const [shares, setShares] = useState<Share[]>([]);
  const [mode, setMode] = useState<"readonly" | "editable">("readonly");
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetch(`/api/notes/${noteId}/share`)
        .then((r) => r.json())
        .then((d) => setShares(d.shares || []));
    }
  }, [open, noteId]);

  const createShare = async () => {
    setLoading(true);
    const res = await fetch(`/api/notes/${noteId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    if (res.ok) {
      const { share } = await res.json();
      setShares((prev) => [...prev, share]);
    }
    setLoading(false);
  };

  const deleteShare = async (shareId: string) => {
    await fetch(`/api/notes/${noteId}/share?shareId=${shareId}`, {
      method: "DELETE",
    });
    setShares((prev) => prev.filter((s) => s.id !== shareId));
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg rounded-xl border border-border w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Share Note
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-bg-tertiary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "readonly" | "editable")}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm"
            >
              <option value="readonly">Read Only</option>
              <option value="editable">Can Edit</option>
            </select>
            <button
              onClick={createShare}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover text-sm font-medium disabled:opacity-50"
            >
              Create Link
            </button>
          </div>

          {shares.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                Active Links
              </p>
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center gap-2 p-3 bg-bg-secondary rounded-lg"
                >
                  <span className="flex-1 text-sm truncate font-mono">
                    /share/{share.token}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      share.mode === "editable"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    }`}
                  >
                    {share.mode}
                  </span>
                  <button
                    onClick={() => copyLink(share.token)}
                    className="p-1.5 hover:bg-bg-tertiary rounded-md"
                    title="Copy link"
                  >
                    {copied === share.token ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteShare(share.id)}
                    className="p-1.5 hover:bg-bg-tertiary rounded-md text-danger"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
