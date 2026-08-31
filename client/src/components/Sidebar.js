"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, selectIsAdmin, logout } from "@/redux/slice/authSlice";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  FileText,
  Plus,
  Users,
  Settings,
  ChevronRight,
  Sparkles,
  LogOut,
  CreditCard,
  Star,
  Shield
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Forms", href: "/forms", icon: FileText },
    { label: "New Form", href: "/forms/new", icon: Plus },
  ];

  const adminItems = [
    { label: "Manage Users", href: "/admin/users", icon: Users },
    { label: "System Forms", href: "/admin/forms", icon: Shield },
    { label: "Transactions", href: "/admin/transactions", icon: CreditCard },
    { label: "Manage Plans", href: "/admin/plans", icon: Star },
  ];

  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  // Get user initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <aside
      style={{
        width: 272,
        minHeight: "calc(100vh - 76px)",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        padding: "28px 16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        borderRight: "1px solid rgba(255,255,255,0.04)",
        position: "sticky",
        top: 76,
        overflowY: "auto",
      }}
    >
      {/* User Profile Card */}
      <div
        style={{
          padding: "16px",
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: "0.02em",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ overflow: "hidden" }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#f1f5f9",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {user?.name || "User"}
          </p>
        </div>
      </div>

      {/* Navigation Label */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#475569",
          padding: "0 14px",
          marginBottom: 8,
        }}
      >
        Main Menu
      </p>

      {/* Nav Items */}
      {allItems.map((item, index) => {
        const isActive =
          pathname === item.href ||
          (item.href === "/forms" &&
            pathname.startsWith("/forms") &&
            pathname !== "/forms/new");
        const Icon = item.icon;

        const isFirstAdmin = isAdmin && index === navItems.length;

        return (
          <div key={item.href}>
            {isFirstAdmin && (
              <div style={{ margin: "16px 0 8px" }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#475569",
                    padding: "0 14px",
                  }}
                >
                  Admin
                </p>
              </div>
            )}
            <Link
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#ffffff" : "#94a3b8",
                background: isActive
                  ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))"
                  : "transparent",
                textDecoration: "none",
                transition: "all 0.2s ease",
                position: "relative",
                border: isActive
                  ? "1px solid rgba(59,130,246,0.2)"
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "#e2e8f0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 20,
                    borderRadius: "0 4px 4px 0",
                    background: "linear-gradient(180deg, #3b82f6, #8b5cf6)",
                  }}
                />
              )}
              <Icon size={18} />
              {item.label}
              {isActive && (
                <ChevronRight
                  size={14}
                  style={{ marginLeft: "auto", opacity: 0.5 }}
                />
              )}
            </Link>
          </div>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Upgrade Card */}
      {user?.planStatus !== "ACTIVE" && !isAdmin && (
        <div
          style={{
            padding: "20px",
            borderRadius: 16,
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))",
            border: "1px solid rgba(59,130,246,0.15)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 4px 15px rgba(59,130,246,0.3)",
            }}
          >
            <Sparkles size={18} color="white" />
          </div>
          <h4
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#f1f5f9",
              marginBottom: 6,
            }}
          >
            Upgrade to Pro
          </h4>
          <p
            style={{
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            Unlock unlimited forms & analytics
          </p>
          <Link
            href="/subscription"
            style={{
              display: "block",
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 700,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white",
              borderRadius: 10,
              textDecoration: "none",
              textAlign: "center",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
            }}
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Settings Link */}
      <Link
        href="/settings"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 14px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 500,
          color: "#64748b",
          textDecoration: "none",
          transition: "all 0.2s ease",
          marginTop: 8,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "#e2e8f0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#64748b";
        }}
      >
        <Settings size={18} />
        Settings
      </Link>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 14px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 500,
          color: "#ef4444",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
