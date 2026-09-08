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
  useGetAnalyticsQuery,
  useSubmitUpgradeRequestMutation,
  useGetUpgradeRequestsQuery,
  useDismissUpgradeRequestMutation,
  useGetDashboardPlansQuery,
} from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import toast from "react-hot-toast";
import {
  Database, Activity, ClipboardList, Layers, CheckCircle,
  CalendarDays, Megaphone, X, TrendingUp, IndianRupee,
  Users, Star, BarChart2, CreditCard, ArrowUpCircle, Clock,
  ShieldCheck, Send, ChevronRight, AlertCircle,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7", "#ef4444", "#84cc16", "#0ea5e9"];

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
const fmtCurrency = (n) => `₹${fmt(n)}`;

// ─────────────────────────────────────────────────────────────────
// Admin Analytics Tab
// ─────────────────────────────────────────────────────────────────
function AdminAnalyticsTab({ isAdmin }) {
  const { data: analyticsData, isLoading } = useGetAnalyticsQuery(undefined, { skip: !isAdmin });
  const [dismissRequest] = useDismissUpgradeRequestMutation();
  const analytics = analyticsData?.data;

  const handleDismiss = async (id) => {
    try {
      await dismissRequest(id).unwrap();
      toast.success("Request dismissed");
    } catch {
      toast.error("Failed to dismiss");
    }
  };

  if (isLoading) return <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading analytics...</div>;

  return (
    <div>
      {/* Revenue Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 28 }}>
        <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IndianRupee size={22} style={{ color: "#10b981" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Total Revenue</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{fmtCurrency(analytics?.totalRevenue)}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>From all plan subscriptions</div>
        </div>

        <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={22} style={{ color: "#2563eb" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Active Subscriptions</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{analytics?.totalActiveSubscriptions || 0}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Currently active users</div>
        </div>

        <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={22} style={{ color: "#ef4444" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Expired Subscriptions</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{analytics?.totalExpiredSubscriptions || 0}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Plans that have lapsed</div>

        </div>

        <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={22} style={{ color: "#8b5cf6" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Avg Plan Value</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{fmtCurrency(analytics?.avgPlanValue)}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Average per subscribed user</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        {/* Revenue Bar Chart */}
        <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Plan-wise Revenue (₹)</h3>
          {analytics?.planBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.planBreakdown} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${fmt(v)}`, "Revenue"]} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {analytics.planBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No subscription data yet</p>}
        </div>

        {/* Plan Distribution Pie */}
        <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Users per Plan</h3>
          {analytics?.planBreakdown?.length > 0 ? (
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={analytics.planBreakdown} dataKey="totalUsers" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={42}>
                      {analytics.planBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, width: 130 }}>
                {analytics.planBreakdown.slice(0, 6).map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                    <span style={{ color: "#475569", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.totalUsers}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No data yet</p>}
        </div>
      </div>

      {/* Plan Breakdown Table */}
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Full Plan Breakdown</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Plan", "Price", "Period", "Total Users", "Active", "Revenue"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(analytics?.allPlanBreakdown || []).map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      {p.name}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>{fmtCurrency(p.price)}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{p.period}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontWeight: 700, color: p.totalUsers > 0 ? "#0f172a" : "#94a3b8" }}>{p.totalUsers}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: p.activeUsers > 0 ? "#dcfce7" : "#f1f5f9", color: p.activeUsers > 0 ? "#166534" : "#94a3b8" }}>
                      {p.activeUsers}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: p.revenue > 0 ? "#10b981" : "#94a3b8" }}>
                    {fmtCurrency(p.revenue)}
                  </td>
                </tr>
              ))}
              <tr style={{ background: "#f0fdf4", borderTop: "2px solid #10b981" }}>
                <td colSpan={3} style={{ padding: "12px 16px", fontWeight: 800, color: "#0f172a" }}>TOTAL</td>
                <td style={{ padding: "12px 16px", fontWeight: 800, color: "#0f172a" }}>{analytics?.totalUsersWithPlan || 0}</td>
                <td style={{ padding: "12px 16px", fontWeight: 800, color: "#0f172a" }}>{analytics?.totalActiveSubscriptions || 0}</td>
                <td style={{ padding: "12px 16px", fontWeight: 800, color: "#10b981", fontSize: 15 }}>{fmtCurrency(analytics?.totalRevenue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Requests */}
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <ArrowUpCircle size={18} style={{ color: "#8b5cf6" }} /> Plan Upgrade Requests
          {analytics?.upgradeRequests?.length > 0 && (
            <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, border: "1px solid #fde68a" }}>
              {analytics.upgradeRequests.filter(r => r.status === "PENDING").length} pending
            </span>
          )}
        </h3>
        {!analytics?.upgradeRequests?.length ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: 30 }}>No upgrade requests yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {analytics.upgradeRequests.map((req) => (
              <div key={req.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#fafafa", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{req.userName}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{req.userEmail}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569" }}>
                    <span style={{ color: "#94a3b8" }}>{req.currentPlanName}</span>
                    <ChevronRight size={12} style={{ display: "inline", margin: "0 4px", color: "#94a3b8" }} />
                    <span style={{ fontWeight: 700, color: "#8b5cf6" }}>{req.desiredPlanName}</span>
                    <span style={{ color: "#64748b" }}> ({fmtCurrency(req.desiredPlanPrice)})</span>
                    {req.message && <span style={{ color: "#64748b" }}> — "{req.message}"</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{new Date(req.createdAt).toLocaleString("en-IN")}</div>
                </div>
                <button
                  onClick={() => handleDismiss(req.id)}
                  style={{ padding: "6px 14px", borderRadius: 8, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", marginLeft: 16 }}
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// User Subscription Tab
// ─────────────────────────────────────────────────────────────────
function UserSubscriptionTab({ user }) {
  const { data: plansData } = useGetDashboardPlansQuery();
  const plans = plansData?.data || [];

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [submitUpgrade, { isLoading: submitting }] = useSubmitUpgradeRequestMutation();

  const currentPlan = user?.plan || plans.find((p) => p.id === user?.planId);
  const planStatus = user?.planStatus || "INACTIVE";
  const expiresAt = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const now = new Date();
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))) : null;
  const totalDays = currentPlan?.period ? (() => {
    const match = currentPlan.period.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  })() : null;
  const progressPct = (totalDays && daysLeft !== null) ? Math.max(0, Math.min(100, (daysLeft / totalDays) * 100)) : 0;

  const statusColor = { ACTIVE: "#10b981", INACTIVE: "#94a3b8", EXPIRED: "#ef4444" }[planStatus] || "#94a3b8";
  const statusBg = { ACTIVE: "#dcfce7", INACTIVE: "#f1f5f9", EXPIRED: "#fee2e2" }[planStatus] || "#f1f5f9";

  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) { toast.error("Please select a plan"); return; }
    try {
      const res = await submitUpgrade({ desiredPlanId: parseInt(selectedPlanId), message: upgradeMessage }).unwrap();
      toast.success(res.message || "Upgrade request sent!");
      setSelectedPlanId("");
      setUpgradeMessage("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit request");
    }
  };

  const upgradeablePlans = plans.filter((p) => p.id !== user?.planId && p.isActive !== false);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Current Plan Card */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={22} style={{ color: "#2563eb" }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>Your Subscription</h3>
          </div>

          {currentPlan ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{currentPlan.name}</span>
                <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: statusBg, color: statusColor }}>
                  {planStatus}
                </span>
              </div>

              <div style={{ fontSize: 28, fontWeight: 900, color: "#10b981", marginBottom: 4 }}>
                ₹{fmt(currentPlan.price)}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>for {currentPlan.period} · {currentPlan.entryLimit === -1 ? "Unlimited" : fmt(currentPlan.entryLimit)} entries</div>

              {/* Progress bar */}
              {planStatus === "ACTIVE" && daysLeft !== null && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                    <span>Time remaining</span>
                    <span style={{ fontWeight: 700, color: daysLeft <= 3 ? "#ef4444" : "#0f172a" }}>{daysLeft} days left</span>
                  </div>
                  <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progressPct}%`, background: daysLeft <= 3 ? "#ef4444" : "linear-gradient(90deg, #2563eb, #10b981)", borderRadius: 99, transition: "width 0.5s" }} />
                  </div>
                </div>
              )}

              {/* Date info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {user?.planStartsAt && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Starts on</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{new Date(user.planStartsAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                )}
                {expiresAt && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Expires on</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                )}
                {planStatus === "EXPIRED" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fee2e2", borderRadius: 10, border: "1px solid #fca5a5" }}>
                    <AlertCircle size={16} style={{ color: "#ef4444" }} />
                    <span style={{ fontSize: 13, color: "#b91c1c", fontWeight: 600 }}>Your plan has expired. Request an upgrade to continue.</span>
                  </div>
                )}
              </div>

              {/* Features */}
              {Array.isArray(currentPlan.features) && currentPlan.features.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Plan Features</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {currentPlan.features.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                        <CheckCircle size={14} style={{ color: "#10b981", flexShrink: 0 }} />
                        <span style={{ color: "#334155" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 30 }}>
              <ShieldCheck size={40} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
              <p style={{ color: "#64748b", fontSize: 14 }}>No plan assigned yet. Admin will assign you a plan once your account is reviewed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Request Form */}
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "fit-content" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowUpCircle size={22} style={{ color: "#8b5cf6" }} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>Request Plan Upgrade</h3>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Admin will review and apply the upgrade</p>
          </div>
        </div>

        <form onSubmit={handleUpgradeSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Select Plan *</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              required
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "white", color: selectedPlanId ? "#0f172a" : "#94a3b8", boxSizing: "border-box" }}
            >
              <option value="">— Choose desired plan —</option>
              {upgradeablePlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{fmt(p.price)} / {p.period} ({p.entryLimit === -1 ? "Unlimited" : fmt(p.entryLimit)} entries)
                </option>
              ))}
            </select>
          </div>

          {selectedPlanId && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px" }}>
              {(() => {
                const p = upgradeablePlans.find((pl) => pl.id === parseInt(selectedPlanId));
                return p ? (
                  <div style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 700, color: "#166534", marginBottom: 6 }}>{p.name}</div>
                    <div style={{ color: "#065f46" }}>₹{fmt(p.price)} · {p.period} · {p.entryLimit === -1 ? "Unlimited" : fmt(p.entryLimit)} entries</div>
                    {Array.isArray(p.features) && p.features.map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                        <CheckCircle size={12} style={{ color: "#10b981" }} />
                        <span style={{ color: "#065f46" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Message to Admin <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={upgradeMessage}
              onChange={(e) => setUpgradeMessage(e.target.value)}
              placeholder="Any specific reason or details for the upgrade..."
              rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedPlanId}
            style={{
              padding: "12px", borderRadius: 10,
              background: submitting || !selectedPlanId ? "#e2e8f0" : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              color: submitting || !selectedPlanId ? "#94a3b8" : "white",
              border: "none", fontSize: 14, fontWeight: 700,
              cursor: submitting || !selectedPlanId ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <Send size={16} />
            {submitting ? "Submitting..." : "Submit Upgrade Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annMessage, setAnnMessage] = useState("");
  const [annActive, setAnnActive] = useState(false);

  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery(undefined, { skip: !user });
  const { data: templatesData } = useGetMyTemplatesQuery(undefined, { skip: !user || user?.role === "ADMIN" });

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

  // Tab configs
  const adminTabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
  ];
  const userTabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "subscription", label: "Subscription", icon: CreditCard },
  ];
  const tabs = isAdmin ? adminTabs : userTabs;

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
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

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "white", borderRadius: 14, padding: 4, border: "1px solid #e2e8f0", width: "fit-content", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: "9px 20px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s",
                background: activeTab === id ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "transparent",
                color: activeTab === id ? "white" : "#64748b",
                boxShadow: activeTab === id ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            {/* ── ADMIN OVERVIEW ── */}
            {isAdmin && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 24 }}>
                  <StatsCard icon={ClipboardList} label="Pending Requests" value={stats?.pendingRequestsCount || 0} color="#f59e0b"
                    onClick={() => router.push("/admin/registration-requests")} />
                  <StatsCard icon={Layers} label="Field Templates" value={stats?.totalFieldTemplates || 0} color="#8b5cf6"
                    onClick={() => router.push("/admin/field-templates")} />
                  <StatsCard icon={CheckCircle} label="Assigned Templates" value={stats?.totalAssignedTemplates || 0} color="#ec4899" />
                  <StatsCard icon={Database} label="Total Entries" value={stats?.totalEntries || 0} color="#06b6d4" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                  <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
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
                            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "#fef9c3", color: "#854d0e", fontWeight: 700 }}>PENDING</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Plan Allocations</h3>
                    {stats?.planDistribution?.length > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                  <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
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

                  <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Recent Entries</h3>
                    {stats?.recentEntries?.length === 0 ? (
                      <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No entries yet</p>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Form</th>
                            <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>By</th>
                            <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Time</th>
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

            {/* ── USER OVERVIEW ── */}
            {!isAdmin && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 28 }}>
                  <StatsCard icon={Layers} label="Assigned Templates" value={templates.length} color="#8b5cf6" />
                  <StatsCard icon={Database} label="Total Entries" value={stats?.totalEntries || 0} color="#10b981" />
                  <StatsCard icon={CalendarDays} label="Forms Used" value={stats?.totalForms || 0} color="#2563eb" />
                </div>
                <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0" }}>
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
          </>
        )}

        {/* ── ANALYTICS TAB (Admin only) ── */}
        {activeTab === "analytics" && isAdmin && <AdminAnalyticsTab isAdmin={isAdmin} />}

        {/* ── SUBSCRIPTION TAB (User only) ── */}
        {activeTab === "subscription" && !isAdmin && <UserSubscriptionTab user={user} />}

      </main>

      {/* Announcement Modal */}
      {isAnnModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, width: "100%", maxWidth: 480, boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
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
              <button onClick={() => setIsAnnModalOpen(false)} style={{ flex: 1, padding: 12, borderRadius: 10, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveAnnouncement} disabled={isUpdatingAnn} style={{ flex: 2, padding: 12, borderRadius: 10, background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {isUpdatingAnn ? "Saving..." : "Save Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
