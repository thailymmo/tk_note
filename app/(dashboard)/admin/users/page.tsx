"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, Save } from "lucide-react";

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

  const saveEdit = async (id: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues),
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, ...editValues } : u
      )
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">User Management</h1>
        <span className="text-sm text-text-secondary ml-2">
          ({users.length} users)
        </span>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-secondary border-b border-border">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="text-left p-3 font-medium">Max Notes</th>
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
                      <button
                        onClick={() => saveEdit(user.id)}
                        className="p-1.5 rounded-lg hover:bg-bg-tertiary text-success"
                        title="Save"
                      >
                        <Save className="w-4 h-4" />
                      </button>
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
    </div>
  );
}
