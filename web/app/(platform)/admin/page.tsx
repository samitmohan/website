"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/userStore";
import {
  useAdminStats,
  useAdminAccessCodes,
  useAdminUsers,
  useCreateAccessCode,
  useDeleteAccessCode,
} from "@/hooks/use-api";

const ADMIN_EMAILS = ["samitmohan@gmail.com"];

export default function AdminPage() {
  const { user } = useUserStore();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Access denied</p>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { data: stats } = useAdminStats();
  const { data: codesData } = useAdminAccessCodes();
  const { data: usersData } = useAdminUsers();
  const createCode = useCreateAccessCode();
  const deleteCode = useDeleteAccessCode();

  const [newCode, setNewCode] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [tab, setTab] = useState<"codes" | "users">("codes");

  const handleCreate = () => {
    if (!newCode.trim()) return;
    createCode.mutate(
      { code: newCode.trim(), maxUses: newMaxUses ? parseInt(newMaxUses) : undefined },
      { onSuccess: () => { setNewCode(""); setNewMaxUses(""); } }
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: stats?.totalUsers ?? "-" },
          { label: "Submissions", value: stats?.totalSubmissions ?? "-" },
          { label: "Active (7d)", value: stats?.activeUsersLast7d ?? "-" },
          { label: "Problems Solved", value: stats?.totalSolved ?? "-" },
        ].map((stat) => (
          <div key={stat.label} className="border border-border rounded-lg p-4">
            <div className="text-2xl font-bold font-mono">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6">
        {(["codes", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm capitalize ${
              tab === t ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "codes" ? "Access Codes" : "Users"}
          </button>
        ))}
      </div>

      {tab === "codes" && (
        <div>
          {/* Create form */}
          <div className="flex gap-2 mb-4">
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="NEW-CODE-HERE"
              className="flex-1 h-9 px-3 text-sm bg-transparent border border-border rounded-lg focus:outline-none focus:border-[#7F56D9]"
            />
            <input
              value={newMaxUses}
              onChange={(e) => setNewMaxUses(e.target.value)}
              placeholder="Max uses (optional)"
              type="number"
              className="w-40 h-9 px-3 text-sm bg-transparent border border-border rounded-lg focus:outline-none focus:border-[#7F56D9]"
            />
            <button
              onClick={handleCreate}
              disabled={createCode.isPending}
              className="h-9 px-4 text-sm font-medium bg-[#7F56D9] hover:bg-[#6941C6] text-white rounded-lg disabled:opacity-50"
            >
              {createCode.isPending ? "Creating..." : "Create"}
            </button>
          </div>

          {/* Codes table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-right px-4 py-3">Uses</th>
                  <th className="text-right px-4 py-3">Expires</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codesData?.codes.map((c) => (
                  <tr key={c.id} className="border-b border-border hover:bg-muted">
                    <td className="px-4 py-3 font-mono text-foreground">{c.code}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {c.currentUses}{c.maxUses ? `/${c.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteCode.mutate(c.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {(!codesData?.codes || codesData.codes.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-sm">
                      No access codes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-right px-4 py-3">Solved</th>
                <th className="text-right px-4 py-3">Last Active</th>
                <th className="text-right px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.users.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-muted">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.image ? (
                        <img src={u.image} alt="" className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#7F56D9]/20 flex items-center justify-center text-xs text-[#9E77ED]">
                          {(u.name || "?")[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground/80">{u.solved}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    {u.lastSubmission ? new Date(u.lastSubmission).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!usersData?.users || usersData.users.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-sm">
                    No users
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
