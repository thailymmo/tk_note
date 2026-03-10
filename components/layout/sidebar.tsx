"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  Plus,
  LogOut,
  Users,
  Shield,
  Sun,
  Moon,
  FolderOpen,
  Menu,
  X,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const createNote = async () => {
    const res = await fetch("/api/notes", { method: "POST" });
    if (res.ok) {
      const { note } = await res.json();
      router.push(`/notes/${note.id}`);
    }
  };

  const navigate = (href: string) => {
    router.push(href);
  };

  const navItems = [
    { label: "Quản lý ghi chú", icon: FileText, href: "/notes" },
    { label: "Thống kê", icon: BarChart3, href: "/stats" },
    { label: "Cài đặt", icon: Settings, href: "/settings" },
  ];

  const adminItems = [
    { label: "Users", icon: Users, href: "/admin/users" },
    { label: "All Notes", icon: FolderOpen, href: "/admin/notes" },
  ];

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">NOTES</h1>
          {user && (
            <p className="text-sm text-text-secondary mt-1 truncate max-w-[160px]">
              {user.email}
            </p>
          )}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-bg-tertiary touch-manipulation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={createNote}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium active:scale-[0.98] touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          Tạo ghi chú mới
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors touch-manipulation",
                active
                  ? "bg-bg-tertiary text-primary font-medium"
                  : "text-text-secondary hover:bg-bg-tertiary"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}

        {user?.role === "admin" && (
          <>
            <div className="pt-4 pb-1">
              <p className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin
              </p>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors touch-manipulation",
                    active
                      ? "bg-bg-tertiary text-primary font-medium"
                      : "text-text-secondary hover:bg-bg-tertiary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-bg-tertiary transition-colors touch-manipulation"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-bg-tertiary transition-colors touch-manipulation"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>

      <div className="h-[env(safe-area-inset-bottom)] lg:hidden" />
    </>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-bg-secondary/95 backdrop-blur-sm border-b border-border px-3 py-2.5 flex items-center justify-between">
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-bg-tertiary touch-manipulation">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-primary">NOTES</h1>
        <button onClick={createNote} className="p-2 rounded-lg hover:bg-bg-tertiary text-primary touch-manipulation">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-bg-secondary border-r border-border flex flex-col z-50 w-72 sm:w-64 transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
