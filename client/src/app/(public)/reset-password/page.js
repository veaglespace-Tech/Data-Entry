"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "#ef4444", fontSize: 16 }}>❌ Invalid or missing reset token. Please request a new reset link.</p>
        <Link href="/forgot-password" style={{ color: "#2563eb", fontWeight: 700 }}>Request new link →</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "#f8fafc" }}>
      <div className="bg-mesh"></div>
      <Navbar />

      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
        <div className="glass-card animate-fade-in-up" style={{ width: "100%", maxWidth: 460, padding: 48 }}>

          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Password Reset!</h1>
              <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7 }}>
                Your password has been successfully updated. Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, boxShadow: "0 8px 24px rgba(16,185,129,0.25)" }}>
                  🔒
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>Set New Password</h1>
                <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>Enter your new password below.</p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#dc2626", fontSize: 14 }}>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">New Password</label>
                  <input
                    id="reset-password"
                    type="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 28 }}>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    className="form-control"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg, #10b981, #059669)", color: "white", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(16,185,129,0.25)" }}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 24, color: "#64748b", fontSize: 14 }}>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "100px" }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
