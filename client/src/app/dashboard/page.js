"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import {
  useGetDashboardStatsQuery,
  useGetUsersQuery,
  useGetAdminTransactionsQuery,
  useUpdateAnnouncementMutation,
} from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  FileText,
  Database,
  Activity,
  Users,
  Clock,
  ArrowUpRight,
  CalendarDays,
  Shield,
  CreditCard,
  AlertTriangle,
  Download,
  Megaphone,
  IndianRupee,
  X,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];

export default function DashboardPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();

  const { data, isLoading, isError, refetch: refetchStats } = useGetDashboardStatsQuery(undefined, {
    skip: !user,
  });

  const { data: usersData } = useGetUsersQuery("", { skip: !user || user.role !== "ADMIN" });
  const { data: txnsData } = useGetAdminTransactionsQuery(undefined, { skip: !user || user.role !== "ADMIN" });
  const [updateAnnouncement, { isLoading: isUpdatingAnn }] = useUpdateAnnouncementMutation();

  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annMessage, setAnnMessage] = useState("");
  const [annActive, setAnnActive] = useState(false);

  const stats = data?.data;
  const loading = authLoading || isLoading;
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ADMIN" && user.planStatus !== "ACTIVE") {
        router.push("/subscription");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (stats?.announcement) {
      setAnnMessage(stats.announcement.message || "");
      setAnnActive(Boolean(stats.announcement.isActive));
    }
  }, [stats?.announcement]);

  if (authLoading || !user) return null;

  // Current date info
  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good Morning"
      : today.getHours() < 17
      ? "Good Afternoon"
      : "Good Evening";

  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // CSV Export Helpers
  const exportUsersCSV = () => {
    const rawUsers = usersData?.data || [];
    if (!rawUsers.length) {
      toast.error("No users found to export");
      return;
    }

    const headers = ["ID", "Name", "Email", "Mobile", "Role", "Plan ID", "Plan Status", "Expires At", "Joined Date"];
    const rows = rawUsers.map((u) => [
      u.id,
      `"${u.name || ""}"`,
      `"${u.email || ""}"`,
      `"${u.mobile || ""}"`,
      u.role,
      u.planId || "None",
      u.planStatus || "INACTIVE",
      u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleDateString("en-IN") : "Lifetime",
      new Date(u.createdAt).toLocaleDateString("en-IN"),
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `DataVault_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Users CSV exported successfully!");
  };

  const exportTransactionsCSV = () => {
    const rawTxns = txnsData?.data || [];
    if (!rawTxns.length) {
      toast.error("No transactions found to export");
      return;
    }

    const headers = ["ID", "Txn ID", "User Name", "User Email", "Plan Name", "Amount", "Status", "Date"];
    const rows = rawTxns.map((t) => [
      t.id,
      `"${t.txnid || ""}"`,
      `"${t.user?.name || "N/A"}"`,
      `"${t.user?.email || "N/A"}"`,
      `"${t.plan?.name || "N/A"}"`,
      t.amount,
      t.status,
      new Date(t.createdAt).toLocaleDateString("en-IN"),
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `DataVault_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions CSV exported successfully!");
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await updateAnnouncement({
        message: annMessage.trim(),
        isActive: annActive,
      }).unwrap();
      toast.success("Broadcast announcement updated!");
      setIsAnnModalOpen(false);
      refetchStats();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update announcement");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: "32px 36px",
          overflowY: "auto",
          maxHeight: "100vh",
        }}
      >
        {/* Global Announcement Banner */}
        {stats?.announcement?.isActive && stats.announcement.message && (
          <div
            className="animate-fade-in-up"
            style={{
              background: "linear-gradient(135deg, #eff6ff, #f0fdf4)",
              border: "1px solid #bfdbfe",
              borderRadius: 16,
              padding: "16px 20px",
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 10px rgba(59,130,246,0.06)",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                <Megaphone size={18} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#2563eb",
                  }}
                >
                  Platform Announcement
                </span>
                <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                  {stats.announcement.message}
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsAnnModalOpen(true)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Edit Notice
              </button>
            )}
          </div>
        )}

        {/* Header Section */}
        <div
          style={{
            marginBottom: 32,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                marginBottom: 6,
              }}
            >
              {greeting},{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {user.name?.split(" ")[0]}
              </span>
              ! 👋
            </h1>
            <p
              style={{
                color: "#94a3b8",
                fontSize: 14,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <CalendarDays size={14} />
              {dateStr}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {isAdmin ? (
              <>
                <button
                  onClick={() => setIsAnnModalOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    padding: "8px 14px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#2563eb",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.08)")}
                >
                  <Megaphone size={14} />
                  Broadcast Notice
                </button>

                <button
                  onClick={exportUsersCSV}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    padding: "8px 14px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <Download size={14} />
                  Export Users
                </button>

                <button
                  onClick={exportTransactionsCSV}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    padding: "8px 14px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <Download size={14} />
                  Export Txns
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))",
                    border: "1px solid rgba(59,130,246,0.25)",
                    padding: "8px 16px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#2563eb",
                  }}
                >
                  <Shield size={16} color="#2563eb" />
                  Super Admin (Owner)
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.05)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: user.planStatus === "ACTIVE" ? "#10b981" : "#f59e0b",
                    boxShadow:
                      user.planStatus === "ACTIVE"
                        ? "0 0 8px rgba(16,185,129,0.5)"
                        : "0 0 8px rgba(245,158,11,0.5)",
                  }}
                />
                Plan: {user.planStatus === "ACTIVE" ? "Active" : "Inactive"}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          /* Skeleton Loading */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 140,
                  borderRadius: 20,
                  background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Top Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 20,
                marginBottom: 28,
              }}
            >
              {isAdmin ? (
                <>
                  <StatsCard
                    title="Total Revenue"
                    value={`₹${Math.round(stats?.totalRevenue || 0).toLocaleString("en-IN")}`}
                    icon={IndianRupee}
                    color="indigo"
                    subtitle={`₹${Math.round(stats?.monthlyRevenue || 0).toLocaleString("en-IN")} this month`}
                  />
                  <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    color="violet"
                    subtitle={`${stats?.activeUsersCount || 0} active · ${stats?.expiredUsersCount || 0} expired`}
                  />
                  <StatsCard
                    title="System Forms"
                    value={stats?.totalForms || 0}
                    icon={FileText}
                    color="emerald"
                    subtitle="Forms created across system"
                  />
                  <StatsCard
                    title="Total Entries"
                    value={stats?.totalEntries || 0}
                    icon={Database}
                    color="amber"
                    subtitle={`${
                      stats?.dailyActivity?.find(
                        (d) => d.date === new Date().toISOString().split("T")[0]
                      )?.entries || 0
                    } added today`}
                  />
                </>
              ) : (
                <>
                  <StatsCard
                    title="Total Forms"
                    value={stats?.totalForms || 0}
                    icon={FileText}
                    color="indigo"
                    subtitle="Custom forms created"
                  />
                  <StatsCard
                    title="Total Entries"
                    value={stats?.totalEntries || 0}
                    icon={Database}
                    color="violet"
                    subtitle="Data entries recorded"
                  />
                  <StatsCard
                    title="Active Today"
                    value={
                      stats?.dailyActivity?.find(
                        (d) => d.date === new Date().toISOString().split("T")[0]
                      )?.entries || 0
                    }
                    icon={Activity}
                    color="emerald"
                    subtitle="Entries added today"
                  />
                </>
              )}
            </div>

            {/* Expiring Soon Alert for Admin */}
            {isAdmin && stats?.expiringSoonUsers && stats.expiringSoonUsers.length > 0 && (
              <div
                className="animate-fade-in-up"
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fef3c7",
                  borderRadius: 18,
                  padding: "20px 24px",
                  marginBottom: 28,
                  boxShadow: "0 2px 8px rgba(245,158,11,0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#92400e", margin: 0 }}>
                        Expiring Soon Subscriptions ({stats.expiringSoonUsers.length})
                      </h3>
                      <p style={{ fontSize: 13, color: "#b45309", margin: 0 }}>
                        These users have active subscriptions expiring within the next 7 days.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin/users"
                    style={{ fontSize: 13, fontWeight: 600, color: "#d97706", textDecoration: "none" }}
                  >
                    View All Users →
                  </Link>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                  {stats.expiringSoonUsers.map((u) => (
                    <div
                      key={u.id}
                      style={{
                        background: "#ffffff",
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: "1px solid #fde68a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>{u.name}</p>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                          {u.plan?.name || "Plan"} · {new Date(u.planExpiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <Link
                        href={`/admin/users/${u.id}`}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#2563eb",
                          background: "#eff6ff",
                          padding: "6px 12px",
                          borderRadius: 8,
                          textDecoration: "none",
                        }}
                      >
                        Renew/Edit
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr",
                gap: 20,
                marginBottom: 28,
              }}
            >
              {/* Daily Activity Area Chart */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px 24px 16px",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: 4,
                      }}
                    >
                      {isAdmin ? "System Activity Trend" : "Activity Overview"}
                    </h3>
                    <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
                      Submissions in the last 7 days
                    </p>
                  </div>
                  <div
                    style={{
                      background: "rgba(59,130,246,0.08)",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#3b82f6",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <ArrowUpRight size={14} />
                    Entries
                  </div>
                </div>
                {stats?.dailyActivity && stats.dailyActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={stats.dailyActivity}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(d) => new Date(d).toLocaleDateString("en", { weekday: "short" })}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        dx={-8}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "none",
                          borderRadius: 12,
                          color: "#f1f5f9",
                          fontSize: 13,
                          fontWeight: 600,
                          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                          padding: "10px 16px",
                        }}
                        itemStyle={{ color: "#38bdf8" }}
                        labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                        labelFormatter={(d) =>
                          new Date(d).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="entries"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="url(#areaGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: "#94a3b8" }}>
                    No activity data available
                  </div>
                )}
              </div>

              {/* Right Chart: Plan Distribution (Admin) OR Forms Distribution (User) */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                  {isAdmin ? "User Plan Distribution" : "Entries per Form"}
                </h3>
                <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginBottom: 16 }}>
                  {isAdmin ? "Subscribers across plan tiers" : "Distribution overview"}
                </p>

                {isAdmin ? (
                  stats?.planDistribution && stats.planDistribution.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={stats.planDistribution}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={65}
                            innerRadius={45}
                            paddingAngle={4}
                            stroke="none"
                          >
                            {stats.planDistribution.map((_, idx) => (
                              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "#0f172a",
                              border: "none",
                              borderRadius: 12,
                              color: "#f1f5f9",
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                        {stats.planDistribution.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 3, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span style={{ color: "#475569", fontWeight: 500 }}>{item.name}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: "#0f172a" }}>{item.count} users</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#94a3b8" }}>
                      No plan distribution data
                    </div>
                  )
                ) : stats?.formsWithCount && stats.formsWithCount.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={stats.formsWithCount}
                          dataKey="entries"
                          nameKey="title"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          innerRadius={45}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {stats.formsWithCount.map((_, idx) => (
                            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#0f172a",
                            border: "none",
                            borderRadius: 12,
                            color: "#f1f5f9",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                      {stats.formsWithCount.slice(0, 4).map((form, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span style={{ color: "#475569", fontWeight: 500, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {form.title}
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>{form.entries}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#94a3b8" }}>
                    No forms created yet
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Grid: For Admin (Recent Txns + Top Forms Leaderboard) | For User (Recent Entries) */}
            {isAdmin ? (
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
                {/* Recent Transactions Widget */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 20,
                    padding: "24px",
                    border: "1px solid rgba(0,0,0,0.04)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                        Recent Transactions
                      </h3>
                      <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>
                        Latest payments across the platform
                      </p>
                    </div>
                    <Link
                      href="/admin/transactions"
                      style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}
                    >
                      View All →
                    </Link>
                  </div>

                  {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {stats.recentTransactions.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 14px",
                            background: "#f8fafc",
                            borderRadius: 12,
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: t.status === "SUCCESS" ? "#dcfce7" : "#fee2e2",
                                color: t.status === "SUCCESS" ? "#16a34a" : "#dc2626",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <CreditCard size={16} />
                            </div>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                                {t.user?.name || "Customer"}
                              </p>
                              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                                {t.plan?.name || "Subscription"} · {new Date(t.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                              </p>
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                              ₹{t.amount}
                            </p>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: t.status === "SUCCESS" ? "#16a34a" : "#dc2626",
                              }}
                            >
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8" }}>
                      No recent transactions recorded
                    </div>
                  )}
                </div>

                {/* Top Performing Forms Leaderboard */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 20,
                    padding: "24px",
                    border: "1px solid rgba(0,0,0,0.04)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                        Top Forms Leaderboard
                      </h3>
                      <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>
                        Most active forms by entries count
                      </p>
                    </div>
                    <Link
                      href="/admin/forms"
                      style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}
                    >
                      View All →
                    </Link>
                  </div>

                  {stats?.topForms && stats.topForms.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {stats.topForms.map((tf, index) => (
                        <div
                          key={tf.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 14px",
                            background: "#f8fafc",
                            borderRadius: 12,
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: index === 0 ? "#fef3c7" : "#e2e8f0",
                                color: index === 0 ? "#d97706" : "#475569",
                                fontSize: 12,
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              #{index + 1}
                            </span>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                                {tf.title}
                              </p>
                              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                                Created by {tf.owner}
                              </p>
                            </div>
                          </div>

                          <div
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              padding: "4px 10px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {tf.entriesCount} entries
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8" }}>
                      No forms recorded yet
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Recent Entries for Normal User */
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                      Recent Entries
                    </h3>
                    <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
                      Latest data submissions
                    </p>
                  </div>
                  <Clock size={18} style={{ color: "#94a3b8" }} />
                </div>

                {stats?.recentEntries && stats.recentEntries.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {stats.recentEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 16px",
                          background: "#fafbfc",
                          borderRadius: 14,
                          border: "1px solid rgba(0,0,0,0.03)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <span
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: `${CHART_COLORS[index % CHART_COLORS.length]}12`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              fontWeight: 800,
                              color: CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          >
                            #{entry.id}
                          </span>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                              {entry.form?.title || "Unknown Form"}
                            </p>
                            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>
                              {Object.values(entry.data || {}).slice(0, 3).join(" · ")}
                            </p>
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap", fontWeight: 600 }}>
                          {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                    <FileText size={40} style={{ color: "#e2e8f0", marginBottom: 12, margin: "0 auto 12px", display: "block" }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
                      No entries yet
                    </p>
                    <p style={{ fontSize: 13 }}>Create a form and start adding data!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Broadcast Notice Modal */}
      {isAnnModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: "32px",
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    Broadcast Platform Notice
                  </h3>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                    Visible at the top of all user dashboards
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAnnModalOpen(false)}
                style={{ background: "#f1f5f9", border: "none", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                  Announcement Message
                </label>
                <textarea
                  rows={3}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="e.g., Scheduled maintenance tonight at 12:00 AM IST. All services will remain online."
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    fontSize: 14,
                    color: "#0f172a",
                    resize: "vertical",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#f8fafc",
                  borderRadius: 12,
                  marginBottom: 24,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    Show Banner
                  </p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                    Toggle off to hide without deleting message
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={annActive}
                  onChange={(e) => setAnnActive(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#2563eb" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setAnnMessage("");
                    setAnnActive(false);
                  }}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#64748b",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Clear Notice
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAnn}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                  }}
                >
                  {isUpdatingAnn ? "Saving..." : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
