"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import {
  Eye,
  EyeOff,
  Edit3,
  Loader2,
  Check,
  Sun,
  Moon,
  FileText,
  ArrowRight,
  Lock,
  ExternalLink,
  Rocket,
  AlertTriangle,
} from "lucide-react";

interface NoteData {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  viewCount: number;
}

interface LinkItem {
  url: string;
  title: string;
}

export default function SharedNotePage() {
  const params = useParams();
  const token = params.token as string;

  const [note, setNote] = useState<NoteData | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [mode, setMode] = useState<string>("readonly");
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [signature, setSignature] = useState("");
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
        setLinks(d.links || []);
        setMode(d.mode);
        setHasPassword(d.hasPassword);
        setSignature(d.signature || "");
        titleRef.current = d.note.title;
        contentRef.current = d.note.content;
        setLoading(false);
      })
      .catch(() => {
        setError("Liên kết không tồn tại hoặc đã hết hạn");
        setLoading(false);
      });
  }, [token]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleEnter = async () => {
    const res = await fetch(`/api/share/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password || null }),
    });

    if (!res.ok) {
      const data = await res.json();
      setPasswordError(data.error || "Sai mật khẩu");
      return;
    }

    const data = await res.json();
    setNote(data.note);
    setLinks(data.links || []);
    setSignature(data.signature || "");
    setEntered(true);
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

  const [popupBlocked, setPopupBlocked] = useState(false);

  const openAllLinks = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-text-secondary opacity-50" />
          <p className="text-xl text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (!note) return null;

  const editable = mode === "editable";

  // Landing page
  if (!entered) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Ghi chú được chia sẻ</h1>
            <p className="text-text-secondary">Ai đó đã chia sẻ ghi chú với bạn</p>
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-4 space-y-3 text-left">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Tiêu đề</p>
              <p className="font-semibold">{note.title || "Untitled"}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Quyền</p>
              {editable ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs">
                  <Edit3 className="w-3 h-3" />
                  Cho phép sửa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                  <Eye className="w-3 h-3" />
                  Chỉ đọc
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Eye className="w-3 h-3" />
              {note.viewCount} lượt xem
            </div>
          </div>

          {hasPassword && (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-bg text-text text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-danger">{passwordError}</p>
              )}
            </div>
          )}

          <button
            onClick={handleEnter}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors font-medium text-base active:scale-[0.98]"
          >
            Xem ghi chú
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
                Sửa
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                <Eye className="w-3 h-3" />
                Đọc
              </span>
            )}
            <span className="text-text-secondary text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {note.viewCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <Loader2 className="w-3 h-3 animate-spin" />
              </span>
            )}
            {saved && (
              <span className="flex items-center gap-1 text-xs text-success">
                <Check className="w-3 h-3" />
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-secondary"
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
            placeholder="Tiêu đề..."
          />
        ) : (
          <h1 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">{note.title}</h1>
        )}

        {/* Shared links */}
        {links.length > 0 && (
          <div className="border border-border rounded-xl bg-bg-secondary mb-4 overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                Liên kết nhanh
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                  {links.length}
                </span>
              </span>
              <button
                onClick={openAllLinks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium active:scale-[0.98] touch-manipulation"
              >
                <Rocket className="w-3.5 h-3.5" />
                Mở tất cả
              </button>
            </div>
            {popupBlocked && (
              <div className="flex items-start gap-2 px-3 sm:px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-300">Trình duyệt đã chặn popup</p>
                  <p className="text-amber-600 dark:text-amber-400 mt-0.5">
                    Cho phép popup cho trang này rồi bấm lại &quot;Mở tất cả&quot;.
                  </p>
                </div>
              </div>
            )}
            <div className="p-2 sm:p-3 space-y-1">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate">{link.title}</span>
                  <span className="hidden sm:block text-xs text-text-secondary truncate ml-auto max-w-[250px]">
                    {link.url}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        <TiptapEditor
          content={note.content}
          onChange={handleContentChange}
          editable={editable}
        />

        {signature && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{signature}</p>
          </div>
        )}
      </div>
    </div>
  );
}
