"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, Save, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  maxNotes: number;
  noteCount: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    maxNotes?: number;
    role?: string;
  }>({});

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setLoading(false);
      });
  }, []);

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditValues({ maxNotes: user.maxNotes, role: user.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...editValues } : u))
    );
    setEditingId(null);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user and all their notes?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-3 sm:mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h1 className="text-lg sm:text-2xl font-bold">Users</h1>
        <span className="text-xs sm:text-sm text-text-secondary">
          ({users.length})
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-secondary border-b border-border">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="text-left p-3 font-medium">Max</th>
              <th className="text-left p-3 font-medium">Joined</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border last:border-0 hover:bg-bg-secondary"
              >
                <td className="p-3">{user.name}</td>
                <td className="p-3 text-text-secondary">{user.email}</td>
                <td className="p-3">
                  {editingId === user.id ? (
                    <select
                      value={editValues.role}
                      onChange={(e) =>
                        setEditValues((v) => ({ ...v, role: e.target.value }))
                      }
                      className="px-2 py-1 rounded border border-border bg-bg text-sm"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="p-3">{user.noteCount}</td>
                <td className="p-3">
                  {editingId === user.id ? (
                    <input
                      type="number"
                      value={editValues.maxNotes}
                      onChange={(e) =>
                        setEditValues((v) => ({
                          ...v,
                          maxNotes: parseInt(e.target.value),
                        }))
                      }
                      className="w-20 px-2 py-1 rounded border border-border bg-bg text-sm"
                    />
                  ) : (
                    user.maxNotes
                  )}
                </td>
                <td className="p-3 text-text-secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    {editingId === user.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(user.id)}
                          className="p-1.5 rounded-lg hover:bg-bg-tertiary text-success"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-secondary"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(user)}
                        className="px-2 py-1 rounded-lg hover:bg-bg-tertiary text-text-secondary text-xs"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-1.5 rounded-lg hover:bg-bg-tertiary text-danger"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile + tablet card layout */}
      <div className="lg:hidden space-y-2 sm:space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-bg-secondary border border-border rounded-xl p-3 sm:p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">{user.name}</p>
                <p className="text-xs sm:text-sm text-text-secondary truncate">{user.email}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {user.role}
              </span>
            </div>

            {editingId === user.id ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-secondary w-12">Role</label>
                  <select
                    value={editValues.role}
                    onChange={(e) =>
                      setEditValues((v) => ({ ...v, role: e.target.value }))
                    }
                    className="flex-1 px-2 py-2 rounded-lg border border-border bg-bg text-sm"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-secondary w-12">Max</label>
                  <input
                    type="number"
                    value={editValues.maxNotes}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        maxNotes: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1 px-2 py-2 rounded-lg border border-border bg-bg text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(user.id)}
                    className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium active:scale-[0.98] touch-manipulation"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 py-2 rounded-lg border border-border text-sm touch-manipulation"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-text-secondary">
                  <span>
                    Notes: <span className="text-text font-medium">{user.noteCount}</span>/{user.maxNotes}
                  </span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(user)}
                    className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-bg-tertiary touch-manipulation"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="py-2 px-4 rounded-lg text-danger border border-border text-sm hover:bg-bg-tertiary touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
