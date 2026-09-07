"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, selectIsAdmin, logout } from "@/redux/slice/authSlice";
import { useGetRegistrationRequestsQuery } from "@/redux/api/apiSlice";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ChevronRight,
  LogOut,
  Star,
  Shield,
  Menu,
  X,
  ClipboardList,
  Layers,
  Download,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data: reqData } = useGetRegistrationRequestsQuery({ status: "PENDING" }, { skip: !isAdmin });
  const pendingCount = reqData?.data?.length || 0;

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/");
  };

  const userNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Field Entry", href: "/field-entry", icon: FileText },
    { label: "My Entries", href: "/my-entries", icon: ClipboardList },
  ];

  const adminNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Registration Requests", href: "/admin/registration-requests", icon: ClipboardList, badge: pendingCount },
    { label: "Manage Users", href: "/admin/users", icon: Users },
    { label: "Field Templates", href: "/admin/field-templates", icon: Layers },
    { label: "System Forms", href: "/admin/forms", icon: Shield },
    { label: "Manage Plans", href: "/admin/plans", icon: Star },
  ];

  const allItems = isAdmin ? adminNavItems : userNavItems;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleNavClick = () => setIsOpen(false);

  const isActive = (item) => {
    return (
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 right-6 z-[60] p-2 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-200 text-slate-800 transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col flex-shrink-0 hide-scrollbar ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          width: 272,
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          padding: "28px 16px 20px",
          gap: 4,
          borderRight: "1px solid rgba(15,23,42,0.06)",
          overflowY: "auto",
        }}
      >
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* Brand Logo */}
        <div style={{ padding: "0 12px", marginBottom: 26, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img src="/veagle-logo.webp" alt="Logo" className="animate-flip-y" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.02em" }}>DataVault</span>
        </div>

        {/* User Profile Card */}
        <div style={{ padding: "16px", borderRadius: 16, background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #f43f5e, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", margin: 0 }}>
              {user?.name || "User"}
            </p>
            <span style={{ fontSize: 11, fontWeight: 600, color: isAdmin ? "var(--primary)" : "#64748b", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              {isAdmin ? "Super Admin" : `${user?.planStatus === "ACTIVE" ? "Active" : "No"} Plan`}
            </span>
          </div>
        </div>

        {/* Navigation Label */}
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#475569", padding: "0 14px", marginBottom: 8 }}>
          {isAdmin ? "Admin Console" : "Main Menu"}
        </p>

        {/* Nav Items */}
        {allItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <div key={item.href + item.label}>
              <Link
                href={item.href}
                onClick={handleNavClick}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12,
                  fontSize: 14, fontWeight: active ? 600 : 500,
                  color: active ? "white" : "var(--foreground)",
                  background: active ? "linear-gradient(135deg, #f43f5e, #8b5cf6)" : "transparent",
                  textDecoration: "none", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative", border: "none",
                  boxShadow: active ? "0 8px 20px rgba(139, 92, 246, 0.3)" : "none",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(139, 92, 246, 0.08)"; e.currentTarget.style.color = "#4f46e5"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--foreground)"; } }}
              >
                {active && (
                  <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: "0 4px 4px 0", background: "linear-gradient(180deg, #f43f5e, #8b5cf6)" }} />
                )}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <Icon size={18} />
                    <span style={{ fontSize: 14, fontWeight: active ? 700 : 600 }}>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      background: "#ef4444", color: "white", fontSize: 11, fontWeight: 800,
                      padding: "2px 8px", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <ChevronRight size={16} className="ml-auto opacity-70" />
                  )}
                </Link>
            </div>
          );
        })}

        <div style={{ flex: 1, minHeight: 20 }} />

        {/* Settings Link */}
        <Link
          href="/settings"
          onClick={handleNavClick}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#64748b", textDecoration: "none", transition: "all 0.2s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
        >
          <Settings size={18} />
          Settings
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={18} />
          Logout
        </button>

        {/* Footer */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(15,23,42,0.06)", textAlign: "center" }}>
          <p style={{ fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>
            Designed & Developed by<br />
            <strong style={{ color: "#94a3b8" }}>Veagle Space Technology Pvt. Ltd.</strong><br />
            © 2026 All Rights Reserved.
          </p>
        </div>
      </aside>
    </>
  );
}
