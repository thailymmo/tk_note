"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Trash2,
  Plus,
  Search,
  Eye,
  Lock,
  ExternalLink,
  FolderPlus,
  Folder,
  X,
  Pencil,
  Pin,
  PinOff,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";

interface Note {
  id: string;
  title: string;
  slug: string;
  content: string;
  folderId: string | null;
  isPinned: boolean;
  viewCount: number;
  shareCount: number;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

interface FolderItem {
  id: string;
  name: string;
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1, total: 0 });
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchNotes = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeFolder) params.set("folderId", activeFolder);
    if (search) params.set("search", search);
    params.set("page", String(page));

    fetch(`/api/notes?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setNotes(d.notes || []);
        setPagination(d.pagination || { page: 1, totalPages: 1, total: 0 });
        setLoading(false);
      });
  }, [activeFolder, search, page]);

  const fetchFolders = () => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((d) => setFolders(d.folders || []));
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Clear selection when page/folder/search changes
  useEffect(() => {
    setSelected(new Set());
  }, [page, activeFolder, search]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const createNote = async () => {
    const body: Record<string, string> = {};
    if (activeFolder) body.folderId = activeFolder;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
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
    if (!confirm("Xóa ghi chú này?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Xóa ${ids.length} ghi chú đã chọn?`)) return;
    const res = await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      setSelected(new Set());
      fetchNotes();
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === notes.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notes.map((n) => n.id)));
    }
  };

  const togglePin = async (id: string, currentPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !currentPinned }),
    });
    if (res.ok) {
      fetchNotes();
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    if (res.ok) {
      const { folder } = await res.json();
      setFolders((prev) => [...prev, folder]);
      setNewFolderName("");
      setShowFolderInput(false);
    }
  };

  const updateFolder = async (id: string) => {
    if (!editFolderName.trim()) return;
    await fetch(`/api/folders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editFolderName.trim() }),
    });
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: editFolderName.trim() } : f))
    );
    setEditingFolder(null);
  };

  const deleteFolder = async (id: string) => {
    if (!confirm("Xóa thư mục này? Ghi chú sẽ chuyển về Tất cả.")) return;
    await fetch(`/api/folders/${id}`, { method: "DELETE" });
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (activeFolder === id) setActiveFolder(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const allSelected = notes.length > 0 && selected.size === notes.length;
  const someSelected = selected.size > 0 && selected.size < notes.length;

  if (loading && notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h1 className="text-lg sm:text-2xl font-bold">Quản lý ghi chú</h1>
        <button
          onClick={createNote}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Tạo ghi chú
        </button>
      </div>

      {/* Folder tabs */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => { setActiveFolder(null); setPage(1); }}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            !activeFolder
              ? "bg-primary text-white"
              : "bg-bg-secondary border border-border text-text-secondary hover:bg-bg-tertiary"
          }`}
        >
          Tất cả
        </button>
        {folders.map((f) => (
          <div key={f.id} className="shrink-0 flex items-center gap-0.5">
            {editingFolder === f.id ? (
              <div className="flex items-center gap-1">
                <input
                  value={editFolderName}
                  onChange={(e) => setEditFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && updateFolder(f.id)}
                  className="w-24 px-2 py-1 rounded border border-border bg-bg text-sm"
                  autoFocus
                />
                <button onClick={() => updateFolder(f.id)} className="text-success p-1">
                  <Plus className="w-3 h-3" />
                </button>
                <button onClick={() => setEditingFolder(null)} className="text-text-secondary p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setActiveFolder(f.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                  activeFolder === f.id
                    ? "bg-primary text-white"
                    : "bg-bg-secondary border border-border text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                <Folder className="w-3 h-3" />
                {f.name}
              </button>
            )}
            {activeFolder === f.id && editingFolder !== f.id && (
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setEditingFolder(f.id);
                    setEditFolderName(f.name);
                  }}
                  className="p-1 text-text-secondary hover:text-text"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteFolder(f.id)}
                  className="p-1 text-text-secondary hover:text-danger"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
        {showFolderInput ? (
          <div className="shrink-0 flex items-center gap-1">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createFolder()}
              placeholder="Tên thư mục"
              className="w-28 px-2 py-1.5 rounded-lg border border-border bg-bg text-sm"
              autoFocus
            />
            <button onClick={createFolder} className="p-1.5 text-success">
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowFolderInput(false);
                setNewFolderName("");
              }}
              className="p-1.5 text-text-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowFolderInput(true)}
            className="shrink-0 px-3 py-1.5 rounded-lg text-sm border border-dashed border-border text-text-secondary hover:bg-bg-tertiary flex items-center gap-1"
          >
            <FolderPlus className="w-3 h-3" />
            <span className="hidden sm:inline">Thư mục</span>
          </button>
        )}
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm kiếm ghi chú..."
          className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-lg border border-border bg-bg-secondary text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 p-2.5 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">
            Đã chọn {selected.size} ghi chú
          </span>
          <button
            onClick={bulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger text-white hover:bg-danger-hover text-sm font-medium active:scale-[0.98]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-text-secondary hover:text-text"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* Result count */}
      <div className="flex items-center justify-between mb-2 text-xs text-text-secondary">
        <span>{pagination.total} ghi chú</span>
        {loading && <span className="animate-pulse">Đang tải...</span>}
      </div>

      {notes.length === 0 && !loading ? (
        <div className="text-center py-12 text-text-secondary">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>
            {search
              ? "Không tìm thấy ghi chú nào"
              : "Chưa có ghi chú nào. Tạo mới!"}
          </p>
          {!search && (
            <button
              onClick={createNote}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover text-sm font-medium active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Tạo ghi chú đầu tiên
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary border-b border-border">
                  <th className="p-3 w-10">
                    <button onClick={toggleSelectAll} className="p-0.5 text-text-secondary hover:text-text">
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : someSelected ? (
                        <MinusSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium w-8"></th>
                  <th className="text-left p-3 font-medium">Liên kết</th>
                  <th className="text-left p-3 font-medium">Tiêu đề</th>
                  <th className="text-left p-3 font-medium">Lượt xem</th>
                  <th className="text-left p-3 font-medium">Mật khẩu</th>
                  <th className="text-left p-3 font-medium">Thư mục</th>
                  <th className="text-left p-3 font-medium">Ngày tạo</th>
                  <th className="text-left p-3 font-medium">Cập nhật</th>
                  <th className="text-right p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => {
                  const folder = folders.find((f) => f.id === note.folderId);
                  const isSelected = selected.has(note.id);
                  return (
                    <tr
                      key={note.id}
                      onClick={() => router.push(`/notes/${note.id}`)}
                      className={`group border-b border-border last:border-0 hover:bg-bg-secondary cursor-pointer ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="p-3">
                        <button
                          onClick={(e) => toggleSelect(note.id, e)}
                          className="p-0.5 text-text-secondary hover:text-text"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={(e) => togglePin(note.id, note.isPinned, e)}
                          className={`p-1 rounded-md hover:bg-bg-tertiary ${
                            note.isPinned ? "text-primary" : "text-text-secondary opacity-0 group-hover:opacity-100"
                          }`}
                          title={note.isPinned ? "Bỏ ghim" : "Ghim"}
                        >
                          {note.isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="p-3">
                        {note.slug && (
                          <span className="text-xs font-mono text-primary flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {note.slug}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-medium max-w-[200px] truncate">
                        {note.title || "Untitled"}
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-text-secondary">
                          <Eye className="w-3 h-3" />
                          {note.viewCount}
                        </span>
                      </td>
                      <td className="p-3">
                        {note.hasPassword && (
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </td>
                      <td className="p-3 text-text-secondary">
                        {folder && (
                          <span className="flex items-center gap-1 text-xs">
                            <Folder className="w-3 h-3" />
                            {folder.name}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-text-secondary text-xs">
                        {formatDate(note.createdAt)}
                      </td>
                      <td className="p-3 text-text-secondary text-xs">
                        {formatDate(note.updatedAt)}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={(e) => deleteNote(note.id, e)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-bg-tertiary opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden grid gap-2">
            {notes.map((note) => {
              const folder = folders.find((f) => f.id === note.folderId);
              const isSelected = selected.has(note.id);
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    if (selected.size > 0) {
                      // In selection mode, tap toggles selection
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(note.id)) next.delete(note.id);
                        else next.add(note.id);
                        return next;
                      });
                    } else {
                      router.push(`/notes/${note.id}`);
                    }
                  }}
                  className={`group p-3 border rounded-xl cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? "bg-primary/10 border-primary/30"
                      : "bg-bg-secondary border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        onClick={(e) => toggleSelect(note.id, e)}
                        className="p-0.5 mt-0.5 text-text-secondary shrink-0 touch-manipulation"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {note.isPinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                          <h3 className="font-semibold truncate text-sm">
                            {note.title || "Untitled"}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-text-secondary flex-wrap">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {note.viewCount}
                          </span>
                          {note.hasPassword && (
                            <Lock className="w-3 h-3 text-amber-500" />
                          )}
                          {note.slug && (
                            <span className="flex items-center gap-0.5 font-mono text-primary">
                              <ExternalLink className="w-3 h-3" />
                              {note.slug}
                            </span>
                          )}
                          {folder && (
                            <span className="flex items-center gap-0.5">
                              <Folder className="w-3 h-3" />
                              {folder.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={(e) => togglePin(note.id, note.isPinned, e)}
                        className={`p-2 rounded-lg touch-manipulation ${
                          note.isPinned ? "text-primary" : "text-text-secondary hover:text-primary"
                        }`}
                      >
                        {note.isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => deleteNote(note.id, e)}
                        className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-bg-tertiary shrink-0 touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-border hover:bg-bg-secondary disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1;
                  })
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-text-secondary">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-primary text-white"
                            : "hover:bg-bg-secondary text-text-secondary"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-2 rounded-lg border border-border hover:bg-bg-secondary disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <button
        onClick={createNote}
        className="sm:hidden fixed bottom-6 right-4 w-14 h-14 rounded-full bg-primary text-white shadow-lg active:scale-95 flex items-center justify-center z-20 touch-manipulation"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
