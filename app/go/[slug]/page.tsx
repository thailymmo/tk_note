"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Rocket, ExternalLink, FileText, Loader2, AlertTriangle } from "lucide-react";

interface LinkItem {
  url: string;
  title: string;
}

export default function GoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popupBlocked, setPopupBlocked] = useState(false);

  useEffect(() => {
    fetch(`/api/go/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setLinks(d.links || []);
        setNoteTitle(d.title || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Liên kết không tồn tại");
        setLoading(false);
      });
  }, [slug]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Rocket className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">{noteTitle || "Links"}</h1>
          <p className="text-text-secondary">{links.length} liên kết</p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-xl p-3 space-y-1.5 text-left">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-tertiary transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium truncate">{link.title}</span>
            </a>
          ))}
        </div>

        <button
          onClick={openAll}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-base active:scale-[0.98] transition-colors"
        >
          <Rocket className="w-5 h-5" />
          Mở tất cả {links.length} liên kết
        </button>

        {popupBlocked && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-left text-xs">
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
    </div>
  );
}
