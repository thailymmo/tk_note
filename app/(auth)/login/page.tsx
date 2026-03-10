"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/notes");
  };

  return (
    <div className="w-full max-w-sm px-4 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">NOTES</h1>
        <p className="text-text-secondary mt-2 text-sm">Đăng nhập tài khoản</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-bg-secondary border border-border rounded-xl p-4 sm:p-6 space-y-4"
      >
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-danger text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-border bg-bg text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Nhập email của bạn"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 sm:py-2 pr-10 rounded-lg border border-border bg-bg text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <label className="flex items-center gap-2 mt-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded"
            />
            Hiện mật khẩu
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 sm:py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="text-center text-sm text-text-secondary">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-primary hover:underline">
            Đăng ký
          </a>
        </p>
      </form>
    </div>
  );
}
