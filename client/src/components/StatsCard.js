"use client";

import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export default function StatsCard({ title, label, value, icon: Icon, color, subtitle, trend, onClick }) {
  // Use label if title is not provided
  const displayTitle = title || label;

  // Since we might receive a hex string like "#2563eb" or a color name
  const isHex = color?.startsWith("#");
  
  // Create a gradient based on the hex color if provided
  // We'll use the provided color as the primary, and a slightly darker version for the gradient
  const primaryColor = isHex ? color : "#6366f1"; // default indigo
  
  // Extract RGB for rgba calculations (basic hex to rgb)
  const hex2rgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = "0x" + hex[1] + hex[1];
      g = "0x" + hex[2] + hex[2];
      b = "0x" + hex[3] + hex[3];
    } else if (hex.length === 7) {
      r = "0x" + hex[1] + hex[2];
      g = "0x" + hex[3] + hex[4];
      b = "0x" + hex[5] + hex[6];
    }
    return `${+r},${+g},${+b}`;
  };

  const rgb = hex2rgb(primaryColor);
  const gradient = `linear-gradient(135deg, ${primaryColor}, rgba(${rgb}, 0.8))`;
  const glow = `rgba(${rgb}, 0.25)`;
  const lightBg = `rgba(${rgb}, 0.1)`;

  return (
    <div
      onClick={onClick}
      style={{
        padding: "24px",
        background: "white",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 28px ${glow}, 0 4px 8px rgba(0,0,0,0.05)`;
        e.currentTarget.style.borderColor = `rgba(${rgb}, 0.3)`;
        const arrow = e.currentTarget.querySelector('.arrow-icon');
        if (arrow) arrow.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.02)";
        e.currentTarget.style.borderColor = "#e2e8f0";
        const arrow = e.currentTarget.querySelector('.arrow-icon');
        if (arrow) arrow.style.transform = 'translateX(0)';
      }}
    >
      {/* Decorative background circle */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: lightBg,
          filter: "blur(24px)",
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
            width: 48,
            height: 48,
            borderRadius: 14,
            background: gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 16px ${glow}`,
          }}
        >
          {Icon && <Icon size={24} color="white" />}
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
              background: trend >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              padding: "4px 10px",
              borderRadius: 8,
            }}
          >
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 13,
            color: "#64748b",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          {displayTitle}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <p
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {value}
          </p>
          {onClick && (
            <ArrowRight size={18} color={primaryColor} className="arrow-icon" style={{ transition: "transform 0.2s", opacity: 0.8 }} />
          )}
        </div>
      </div>
      
      {subtitle && (
        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            marginTop: 12,
            fontWeight: 500,
            margin: "12px 0 0 0",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
