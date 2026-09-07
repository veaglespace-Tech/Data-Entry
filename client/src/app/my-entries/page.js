"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import { useGetMyEntriesQuery } from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import { ClipboardList, Download, Database, FileText, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";

export default function MyEntriesPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();

  const [entriesPage, setEntriesPage] = useState(1);
  const isAdmin = user?.role === "ADMIN";

  const { data: entriesData, isLoading: entriesLoading } = useGetMyEntriesQuery({ page: entriesPage }, { skip: !user || isAdmin });
  const entries = entriesData?.data || [];
  const entryPagination = entriesData?.pagination;

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && isAdmin) router.push("/dashboard");
  }, [user, authLoading, isAdmin, router]);

  const handleExport = () => {
    const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("persist:auth") || "{}")?.token?.replace(/"/g, "") : "";
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/dashboard/my-entries/export`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_entries.xlsx";
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => toast.error("Export failed"));
  };

  if (authLoading || !user || isAdmin) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 28px", overflowY: "auto" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(16,185,129,0.3)" }}>
              <ClipboardList size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>My Entries</h1>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>View and export your submitted records</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            style={{ padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg, #10b981, #059669)", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            <Download size={16} /> Export Excel (.xlsx)
          </button>
        </div>

        {entriesLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <Database size={48} style={{ color: "#cbd5e1", margin: "0 auto 16px" }} />
            <p style={{ color: "#64748b", fontSize: 16 }}>No entries yet. Start by filling a form in Field Entry!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {entries.map((entry) => (
              <div key={entry.id} style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={16} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>{entry.form?.title}</p>
                      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{new Date(entry.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#f0fdf4", color: "#166534", fontWeight: 700 }}>
                    #{entry.id}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                  {(entry.form?.fields || []).map((field) => {
                    const key = field.name || field.id;
                    const val = entry.data?.[key] || entry.data?.[field.label] || "—";
                    return (
                      <div key={field.name} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px", fontWeight: 600 }}>{field.label}</p>
                        <p style={{ fontSize: 13, color: "#0f172a", fontWeight: 500, margin: 0 }}>{String(val)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {entryPagination && entryPagination.totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setEntriesPage((p) => Math.max(1, p - 1))}
                  disabled={entriesPage === 1}
                  style={{ padding: "8px 16px", borderRadius: 10, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 13, cursor: "pointer" }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 13, color: "#64748b" }}>Page {entriesPage} of {entryPagination.totalPages}</span>
                <button
                  onClick={() => setEntriesPage((p) => Math.min(entryPagination.totalPages, p + 1))}
                  disabled={entriesPage === entryPagination.totalPages}
                  style={{ padding: "8px 16px", borderRadius: 10, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 13, cursor: "pointer" }}
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
