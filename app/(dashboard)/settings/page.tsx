"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    email: "",
    name: "",
    defaultTitle: "Untitled",
    signature: "",
    defaultContent: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const body: Record<string, string> = {
      name: settings.name,
      defaultTitle: settings.defaultTitle,
      signature: settings.signature,
      defaultContent: settings.defaultContent,
    };

    if (newPassword) {
      body.newPassword = newPassword;
      body.confirmPassword = confirmPassword;
    }

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSaved(true);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Settings className="w-5 h-5 text-primary" />
        <h1 className="text-lg sm:text-2xl font-bold">Cài đặt</h1>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-danger text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Account info */}
        <div className="bg-bg-secondary border border-border rounded-xl p-4 sm:p-6 space-y-4">
          <h2 className="font-semibold text-base">Thông tin tài khoản</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={settings.email}
              disabled
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-border bg-bg-tertiary text-text-secondary text-base sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tên</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) =>
                setSettings((s) => ({ ...s, name: e.target.value }))
              }
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-border bg-bg text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Note defaults */}
        <div className="bg-bg-secondary border border-border rounded-xl p-4 sm:p-6 space-y-4">
          <h2 className="font-semibold text-base">Cài đặt ghi chú</h2>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tiêu đề mặc định mỗi khi tạo note mới
            </label>
            <input
              type="text"
              value={settings.defaultTitle}
              onChange={(e) =>
                setSettings((s) => ({ ...s, defaultTitle: e.target.value }))
              }
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-border bg-bg text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Chữ ký sẽ hiển thị bên dưới nội dung note
            </label>
            <textarea
              value={settings.signature}
              onChange={(e) =>
                setSettings((s) => ({ ...s, signature: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-border bg-bg text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <p className="text-xs text-text-secondary mt-1">
              {settings.signature.length} chữ
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nội dung mặc định mỗi khi tạo note mới
            </label>
            <textarea
              value={settings.defaultContent}
              onChange={(e) =>
                setSettings((s) => ({ ...s, defaultContent: e.target.value }))
              }
              rows={4}
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-border bg-bg text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <p className="text-xs text-text-secondary mt-1">
              {settings.defaultContent.length} chữ
            </p>
          </div>
        </div>

        {/* Password change */}
        <div className="bg-bg-secondary border border-border rounded-xl p-4 sm:p-6 space-y-4">
          <h2 className="font-semibold text-base">Đổi mật khẩu</h2>
          <p className="text-sm text-text-secondary">
            Nhập mật khẩu mới nếu muốn đổi, nếu không thì bỏ trống
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 ký tự"
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-border bg-bg text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-border bg-bg text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 active:scale-[0.98] touch-manipulation"
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Đã lưu!
            </>
          ) : saving ? (
            "Đang lưu..."
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu cài đặt
            </>
          )}
        </button>
      </div>
    </div>
  );
}
