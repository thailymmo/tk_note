"use client";

import { useState, useEffect } from "react";
import { X, Copy, Trash2, Check, Link as LinkIcon, Lock, Eye, EyeOff } from "lucide-react";

interface Share {
  id: string;
  token: string;
  mode: string;
  password: string | null;
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
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      body: JSON.stringify({ mode, password: password || null }),
    });
    if (res.ok) {
      const { share } = await res.json();
      setShares((prev) => [...prev, share]);
      setPassword("");
    }
    setLoading(false);
  };

  const deleteShare = async (shareId: string) => {
    await fetch(`/api/notes/${noteId}/share?shareId=${shareId}`, { method: "DELETE" });
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
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-bg rounded-t-2xl sm:rounded-xl border border-border w-full sm:max-w-lg shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="sm:hidden flex justify-center pt-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Chia sẻ ghi chú
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg touch-manipulation">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "readonly" | "editable")}
              className="w-full sm:flex-1 px-3 py-2.5 sm:py-2 rounded-lg border border-border bg-bg text-text text-base sm:text-sm"
            >
              <option value="readonly">Chỉ đọc</option>
              <option value="editable">Cho phép sửa</option>
            </select>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu (tùy chọn)"
              className="w-full px-3 py-2.5 sm:py-2 pr-10 rounded-lg border border-border bg-bg text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={createShare}
            disabled={loading}
            className="w-full py-2.5 sm:py-2 rounded-lg bg-primary text-white hover:bg-primary-hover text-sm font-medium disabled:opacity-50 active:scale-[0.98] touch-manipulation"
          >
            Tạo liên kết
          </button>

          {shares.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-text-secondary">
                Liên kết đã tạo
              </p>
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="p-3 bg-bg-secondary rounded-lg"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm truncate font-mono flex-1 min-w-0">
                      /share/{share.token}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {share.password && (
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                          share.mode === "editable"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        }`}
                      >
                        {share.mode === "editable" ? "Sửa" : "Đọc"}
                      </span>
                      <button
                        onClick={() => copyLink(share.token)}
                        className="p-2 hover:bg-bg-tertiary rounded-md touch-manipulation"
                      >
                        {copied === share.token ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteShare(share.id)}
                        className="p-2 hover:bg-bg-tertiary rounded-md text-danger touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-[env(safe-area-inset-bottom)] sm:hidden" />
      </div>
    </div>
  );
}
