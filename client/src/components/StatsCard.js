"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, color, subtitle, trend }) {
  const colorMap = {
    indigo: {
      gradient: "linear-gradient(135deg, #4f46e5, #6366f1)",
      glow: "rgba(99, 102, 241, 0.2)",
      lightBg: "rgba(99, 102, 241, 0.08)",
      text: "#6366f1",
    },
    violet: {
      gradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
      glow: "rgba(139, 92, 246, 0.2)",
      lightBg: "rgba(139, 92, 246, 0.08)",
      text: "#8b5cf6",
    },
    emerald: {
      gradient: "linear-gradient(135deg, #059669, #10b981)",
      glow: "rgba(16, 185, 129, 0.2)",
      lightBg: "rgba(16, 185, 129, 0.08)",
      text: "#10b981",
    },
    amber: {
      gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
      glow: "rgba(245, 158, 11, 0.2)",
      lightBg: "rgba(245, 158, 11, 0.08)",
      text: "#f59e0b",
    },
    blue: {
      gradient: "linear-gradient(135deg, #2563eb, #3b82f6)",
      glow: "rgba(37, 99, 235, 0.2)",
      lightBg: "rgba(37, 99, 235, 0.08)",
      text: "#3b82f6",
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div
      style={{
        padding: "24px",
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 28px ${c.glow}, 0 4px 8px rgba(0,0,0,0.04)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      {/* Decorative gradient blob */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: c.lightBg,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: c.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 16px ${c.glow}`,
          }}
        >
          <Icon size={20} color="white" />
        </div>

        {trend !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 700,
              color: trend >= 0 ? "#10b981" : "#ef4444",
              background: trend >= 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
              padding: "4px 10px",
              borderRadius: 8,
            }}
          >
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <p
        style={{
          fontSize: 12,
          color: "#94a3b8",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: "#0f172a",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      {subtitle && (
        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            marginTop: 6,
            fontWeight: 500,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
