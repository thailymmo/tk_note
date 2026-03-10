"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Rocket,
  AlertTriangle,
} from "lucide-react";

export interface NoteLink {
  url: string;
  title: string;
}

interface Props {
  links: NoteLink[];
  slug: string | null;
  onChange: (links: NoteLink[]) => void;
}

export function LinkManager({ links, slug, onChange }: Props) {
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const addLink = () => {
    const url = newUrl.trim();
    if (!url) return;
    const title = newTitle.trim() || url;
    onChange([...links, { url, title }]);
    setNewUrl("");
    setNewTitle("");
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const goUrl = slug ? `${window.location.origin}/go/${slug}` : null;

  const copyGoUrl = () => {
    if (!goUrl) return;
    navigator.clipboard.writeText(goUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openAll = () => {
    setPopupBlocked(false);
    let blocked = false;
    for (const link of links) {
      const w = window.open(link.url, "_blank");
      if (!w) {
        blocked = true;
        break;
      }
    }
    if (blocked) setPopupBlocked(true);
  };

  return (
    <div className="border border-border rounded-xl bg-bg-secondary mb-4 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 text-sm font-medium hover:bg-bg-tertiary transition-colors"
      >
        <span className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-primary" />
          Liên kết nhanh
          {links.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              {links.length}
            </span>
          )}
        </span>
        {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {!collapsed && (
        <div className="px-3 sm:px-4 pb-3 space-y-2 border-t border-border pt-3">
          {/* Link list */}
          {links.length > 0 && (
            <div className="space-y-1.5">
              {links.map((link, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 group"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg hover:bg-bg-tertiary border border-border transition-colors text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3 text-primary shrink-0" />
                    <span className="truncate font-medium">{link.title}</span>
                    <span className="hidden sm:block truncate text-text-secondary text-xs ml-auto max-w-[200px]">
                      {link.url}
                    </span>
                  </a>
                  <button
                    onClick={() => removeLink(i)}
                    className="p-1.5 rounded-md text-text-secondary hover:text-danger hover:bg-bg-tertiary opacity-0 group-hover:opacity-100 sm:opacity-100 shrink-0 touch-manipulation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new link */}
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="URL (https://...)"
              className="flex-1 px-3 py-2 sm:py-1.5 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tiêu đề (tùy chọn)"
              className="sm:w-40 px-3 py-2 sm:py-1.5 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
            <button
              onClick={addLink}
              disabled={!newUrl.trim()}
              className="px-3 py-2 sm:py-1.5 rounded-lg bg-primary text-white hover:bg-primary-hover text-sm font-medium disabled:opacity-30 active:scale-[0.98] touch-manipulation flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm
            </button>
          </div>

          {/* Final URL + Open All */}
          {links.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {goUrl && (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-xs text-text-secondary shrink-0">Mở tất cả:</span>
                    <code className="text-xs font-mono text-primary truncate flex-1">{goUrl}</code>
                    <button
                      onClick={copyGoUrl}
                      className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-secondary shrink-0 touch-manipulation"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
                <button
                  onClick={openAll}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium active:scale-[0.98] touch-manipulation shrink-0"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  Mở tất cả ({links.length})
                </button>
              </div>
              {popupBlocked && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-300">Trình duyệt đã chặn popup</p>
                    <p className="text-amber-600 dark:text-amber-400 mt-0.5">
                      Cho phép popup cho trang này: bấm vào biểu tượng chặn popup trên thanh địa chỉ, chọn &quot;Luôn cho phép&quot;, rồi bấm lại nút &quot;Mở tất cả&quot;.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
