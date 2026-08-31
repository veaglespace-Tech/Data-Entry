"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "#f8fafc" }}>
      <div className="bg-mesh"></div>
      <Navbar />

      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
        <div className="glass-card animate-fade-in-up" style={{ width: "100%", maxWidth: 460, padding: 48 }}>
          
          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Check Your Email</h1>
              <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                If an account with <strong>{email}</strong> exists, we've sent a password reset link. Please check your inbox (and spam folder).
              </p>
              <Link
                href="/login"
                style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white", fontWeight: 700, textDecoration: "none" }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, boxShadow: "0 8px 24px rgba(37,99,235,0.25)" }}>
                  🔑
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>Forgot Password?</h1>
                <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>Enter your email and we'll send a reset link.</p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#dc2626", fontSize: 14 }}>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 24, color: "#64748b", fontSize: 14 }}>
                Remember your password?{" "}
                <Link href="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
