"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "@/redux/slice/authSlice";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { Database, LogOut, Menu, X, ChevronRight, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Pricing", path: "/subscription" },
  ];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "16px 24px",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href={user ? "/dashboard" : "/"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img 
                src="/veagle-logo.webp" 
                alt="Main Brand Logo" 
                className="animate-flip-y"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#0f172a",
              }}
            >
              DataVault
            </span>
          </Link>

          {/* Center: Desktop Nav Links in Floating Capsule */}
          <div
            className="desktop-nav-center"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(15, 23, 42, 0.04)",
              padding: "5px 6px",
              borderRadius: 100,
              border: "1px solid rgba(15, 23, 42, 0.05)",
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  style={{
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? "#2563eb" : "#64748b",
                    padding: "7px 18px",
                    borderRadius: 100,
                    background: isActive ? "#ffffff" : "transparent",
                    boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#0f172a";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#64748b";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="desktop-nav-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Link
                  href="/dashboard"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textDecoration: "none",
                    background: "rgba(15,23,42,0.04)",
                    padding: "7px 16px",
                    borderRadius: 100,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(15,23,42,0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(15,23,42,0.04)"}
                >
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 800 }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "7px 14px",
                    borderRadius: 100,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                    e.currentTarget.style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link
                  href="/login"
                  style={{
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#334155",
                    padding: "8px 18px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.color = "#0f172a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.color = "#334155";
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "white",
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    padding: "8px 18px",
                    borderRadius: 10,
                    boxShadow: "0 2px 10px rgba(37,99,235,0.25)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(37,99,235,0.25)";
                  }}
                >
                  Get Started <ChevronRight size={15} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              color: "#0f172a",
              cursor: "pointer",
              padding: 8,
              borderRadius: 8,
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Spacer so content doesn't jump underneath the fixed navbar */}
      <div style={{ height: 90 }} />

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: 70,
            left: 16,
            right: 16,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(15,23,42,0.06)",
            borderRadius: 20,
            padding: 24,
            zIndex: 99,
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              style={{
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600,
                color: "#0f172a",
                padding: "8px 0",
                borderBottom: "1px solid rgba(15,23,42,0.04)",
              }}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(15,23,42,0.03)', borderRadius: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 800 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{user.name}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{user.email}</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px",
                  background: "#f1f5f9",
                  color: "#0f172a",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px",
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "12px",
                  textAlign: "center",
                  background: "#f1f5f9",
                  color: "#0f172a",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "12px",
                  textAlign: "center",
                  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                  color: "white",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 820px) {
          .desktop-nav-center,
          .desktop-nav-right {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
