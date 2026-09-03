"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import { useGetDashboardStatsQuery } from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import {
  FileText,
  Database,
  Activity,
  Users,
  Clock,
  ArrowUpRight,
  CalendarDays,
  Shield,
} from "lucide-react";
import {
  BarChart,
  Bar,
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

  const { data, isLoading, isError } = useGetDashboardStatsQuery(undefined, {
    skip: !user,
  });

  const stats = data?.data;
  const loading = authLoading || isLoading;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ADMIN" && user.planStatus !== "ACTIVE") {
        router.push("/subscription");
      }
    }
  }, [user, loading, router]);

  if (authLoading || !user) return null;

  // Get current date info
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
        {/* Header Section */}
        <div
          style={{
            marginBottom: 36,
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

          {user.role === "ADMIN" ? (
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
                  background:
                    "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 20,
                marginBottom: 28,
              }}
            >
              <StatsCard
                title="Total Forms"
                value={stats?.totalForms || 0}
                icon={FileText}
                color="indigo"
                subtitle={stats?.isAdmin ? "All system forms created" : "Custom forms created"}
              />
              <StatsCard
                title="Total Entries"
                value={stats?.totalEntries || 0}
                icon={Database}
                color="violet"
                subtitle={stats?.isAdmin ? "All data entries recorded" : "Data entries recorded"}
              />
              <StatsCard
                title="Active Today"
                value={
                  stats?.dailyActivity?.find(
                    (d) =>
                      d.date === new Date().toISOString().split("T")[0]
                  )?.entries || 0
                }
                icon={Activity}
                color="emerald"
                subtitle="Entries added today"
              />
              {stats?.isAdmin && (
                <StatsCard
                  title="Total Users"
                  value={stats.totalUsers || 0}
                  icon={Users}
                  color="amber"
                  subtitle="Registered platform users"
                />
              )}
            </div>

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
                      Activity Overview
                    </h3>
                    <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
                      Last 7 days
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
                        <linearGradient
                          id="areaGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity={0.01}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,0,0,0.04)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        tickFormatter={(d) =>
                          new Date(d).toLocaleDateString("en", {
                            weekday: "short",
                          })
                        }
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        dx={-8}
                      />
                      <Tooltip
                        cursor={{
                          stroke: "#3b82f6",
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                        }}
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
                        itemStyle={{ color: "#f1f5f9" }}
                        labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="entries"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="url(#areaGrad)"
                        dot={{
                          r: 4,
                          fill: "#3b82f6",
                          stroke: "#ffffff",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          fill: "#3b82f6",
                          stroke: "#ffffff",
                          strokeWidth: 3,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 240,
                      color: "#94a3b8",
                      fontSize: 14,
                    }}
                  >
                    No activity data yet
                  </div>
                )}
              </div>

              {/* Entries per Form Donut */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: 4,
                  }}
                >
                  Entries per Form
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: 500,
                    marginBottom: 16,
                  }}
                >
                  Distribution overview
                </p>
                {stats?.formsWithCount && stats.formsWithCount.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={stats.formsWithCount}
                          dataKey="entries"
                          nameKey="title"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={55}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {stats.formsWithCount.map((_, index) => (
                            <Cell
                              key={index}
                              fill={
                                CHART_COLORS[index % CHART_COLORS.length]
                              }
                            />
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
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                            padding: "10px 16px",
                          }}
                          itemStyle={{ color: "#f1f5f9" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {stats.formsWithCount.slice(0, 4).map((form, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: 13,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 3,
                                background:
                                  CHART_COLORS[i % CHART_COLORS.length],
                              }}
                            />
                            <span
                              style={{
                                color: "#475569",
                                fontWeight: 500,
                                maxWidth: 140,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {form.title}
                            </span>
                          </div>
                          <span
                            style={{
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {form.entries}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 200,
                      color: "#94a3b8",
                      fontSize: 14,
                    }}
                  >
                    No forms created yet
                  </div>
                )}
              </div>
            </div>

            {/* Recent Entries */}
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
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 4,
                    }}
                  >
                    Recent Entries
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    Latest data submissions
                  </p>
                </div>
                <Clock size={18} style={{ color: "#94a3b8" }} />
              </div>

              {stats?.recentEntries && stats.recentEntries.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
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
                        transition: "all 0.2s ease",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f1f5f9";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fafbfc";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <span
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: `${
                              CHART_COLORS[index % CHART_COLORS.length]
                            }12`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 800,
                            color:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        >
                          #{entry.id}
                        </span>
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {entry.form?.title || "Unknown Form"}
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: "#94a3b8",
                              marginTop: 2,
                              fontWeight: 500,
                            }}
                          >
                            {Object.values(entry.data || {})
                              .slice(0, 3)
                              .join(" · ")}
                          </p>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}
                      >
                        {new Date(entry.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#94a3b8",
                  }}
                >
                  <FileText
                    size={40}
                    style={{
                      color: "#e2e8f0",
                      marginBottom: 12,
                      margin: "0 auto 12px",
                      display: "block",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: 4,
                    }}
                  >
                    No entries yet
                  </p>
                  <p style={{ fontSize: 13 }}>
                    Create a form and start adding data!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

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
