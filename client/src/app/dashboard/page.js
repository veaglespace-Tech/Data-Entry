"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import {
  useGetDashboardStatsQuery,
  useGetMyTemplatesQuery,
  useGetAdminPlansQuery,
  useGetRegistrationRequestsQuery,
  useUpdateAnnouncementMutation,
} from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import toast from "react-hot-toast";
import {
  Database, Activity, ClipboardList, Layers, CheckCircle,
  CalendarDays, Megaphone, X,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];

export default function DashboardPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();

  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annMessage, setAnnMessage] = useState("");
  const [annActive, setAnnActive] = useState(false);

  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery(undefined, { skip: !user });
  const { data: templatesData } = useGetMyTemplatesQuery(undefined, { skip: !user || user?.role === "ADMIN" });
  
  // Queries mostly to cache or quick prefetch admin info
  useGetAdminPlansQuery(undefined, { skip: !user || user?.role !== "ADMIN" });
  useGetRegistrationRequestsQuery({ status: "PENDING" }, { skip: !user || user?.role !== "ADMIN" });

  const [updateAnnouncement, { isLoading: isUpdatingAnn }] = useUpdateAnnouncementMutation();

  const stats = statsData?.data;
  const templates = templatesData?.data || [];
  const isAdmin = user?.role === "ADMIN";
  const loading = authLoading || statsLoading;

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (stats?.announcement) {
      setAnnMessage(stats.announcement.message || "");
      setAnnActive(Boolean(stats.announcement.isActive));
    }
  }, [stats?.announcement]);

  if (authLoading || !user) return null;

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good Morning" : today.getHours() < 17 ? "Good Afternoon" : "Good Evening";

  const handleSaveAnnouncement = async () => {
    try {
      await updateAnnouncement({ message: annMessage, isActive: annActive }).unwrap();
      toast.success("Announcement updated!");
      setIsAnnModalOpen(false);
    } catch {
      toast.error("Failed to update announcement");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 28px", overflowY: "auto" }}>

        {/* Announcement Banner */}
        {stats?.announcement?.isActive && stats.announcement.message && (
          <div style={{ background: "linear-gradient(135deg, #fef9c3, #fef3c7)", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <Megaphone size={18} style={{ color: "#d97706", flexShrink: 0 }} />
            <p style={{ fontSize: 14, color: "#92400e", margin: 0, flex: 1 }}>{stats.announcement.message}</p>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>
              {greeting}, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
              {isAdmin ? "Admin Dashboard" : "Your Data Entry Dashboard"} · {today.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsAnnModalOpen(true)}
              style={{ padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              <Megaphone size={16} /> Announcement
            </button>
          )}
        </div>

        {/* ══ ADMIN DASHBOARD ══════════════════════════════════════ */}
        {isAdmin && (
          <>
            {/* Stats Row 1: Core Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 24 }}>
              <StatsCard icon={ClipboardList} label="Pending Requests" value={stats?.pendingRequestsCount || 0} color="#f59e0b"
                onClick={() => router.push("/admin/registration-requests")} />
              <StatsCard icon={Layers} label="Field Templates" value={stats?.totalFieldTemplates || 0} color="#8b5cf6" 
                onClick={() => router.push("/admin/field-templates")} />
              <StatsCard icon={CheckCircle} label="Assigned Templates" value={stats?.totalAssignedTemplates || 0} color="#ec4899" />
              <StatsCard icon={Database} label="Total Entries" value={stats?.totalEntries || 0} color="#06b6d4" />
            </div>

            {/* Content Row: Pending Requests + Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              
              {/* Pending Requests List */}
              <div style={{ background: "white", borderRadius: 20, padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent Pending Requests</h3>
                  <button onClick={() => router.push("/admin/registration-requests")} style={{ background: "none", border: "none", color: "#2563eb", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>View All</button>
                </div>
                {stats?.recentRegistrationRequests?.length === 0 ? (
                  <p style={{ color: "#94a3b8", textAlign: "center", padding: 20, margin: 0 }}>No pending requests.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {(stats?.recentRegistrationRequests || []).map((req) => (
                      <div key={req.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>{req.name}</p>
                          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{req.email}</p>
                        </div>
                        <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "#fef9c3", color: "#854d0e", fontWeight: 700 }}>
                          PENDING
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Plan Distribution Chart */}
              <div style={{ background: "white", borderRadius: 20, padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Plan Allocations</h3>
                {stats?.planDistribution?.length > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 24, height: "100%" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={stats.planDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                            {stats.planDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, width: 140 }}>
                      {stats.planDistribution.slice(0, 5).map((p, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span style={{ color: "#475569", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", marginTop: 40 }}>No data</p>}
              </div>

            </div>

            {/* Bottom Row: Activity Chart & Recent Entries */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
              
              <div style={{ background: "white", borderRadius: 20, padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Daily Entry Activity (7 days)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats?.dailyActivity || []}>
                    <defs>
                      <linearGradient id="entryGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="entries" stroke="#2563eb" fill="url(#entryGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "white", borderRadius: 20, padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Recent Entries</h3>
                {stats?.recentEntries?.length === 0 ? (
                  <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No entries yet</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1px solid #e2e8f0", borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>Form</th>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>By</th>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1px solid #e2e8f0", borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.recentEntries || []).map((entry) => (
                        <tr key={entry.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 14px", color: "#0f172a", fontWeight: 600 }}>{entry.form?.title || "—"}</td>
                          <td style={{ padding: "12px 14px", color: "#64748b" }}>{entry.form?.user?.name || "—"}</td>
                          <td style={{ padding: "12px 14px", color: "#94a3b8", fontSize: 12 }}>{new Date(entry.createdAt).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          </>
        )}

        {/* ══ USER DASHBOARD ════════════════════════════════════════ */}
        {!isAdmin && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 28 }}>
              <StatsCard icon={Layers} label="Assigned Templates" value={templates.length} color="#8b5cf6" />
              <StatsCard icon={Database} label="Total Entries" value={stats?.totalEntries || 0} color="#10b981" />
              <StatsCard icon={CalendarDays} label="Forms Used" value={stats?.totalForms || 0} color="#2563eb" />
            </div>
            <div style={{ background: "white", borderRadius: 20, padding: "28px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Entry Activity (7 days)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats?.dailyActivity || []}>
                  <defs>
                    <linearGradient id="userEntryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="entries" stroke="#2563eb" fill="url(#userEntryGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {/* Announcement Modal */}
      {isAnnModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "36px", width: "100%", maxWidth: 480, boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>System Announcement</h2>
              <button onClick={() => setIsAnnModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
            </div>
            <textarea
              value={annMessage} onChange={(e) => setAnnMessage(e.target.value)}
              placeholder="Announcement message..."
              rows={4}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 16 }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, cursor: "pointer" }}>
              <input type="checkbox" checked={annActive} onChange={(e) => setAnnActive(e.target.checked)} style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 14, color: "#334155", fontWeight: 600 }}>Show announcement to all users</span>
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setIsAnnModalOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveAnnouncement} disabled={isUpdatingAnn} style={{ flex: 2, padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {isUpdatingAnn ? "Saving..." : "Save Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
