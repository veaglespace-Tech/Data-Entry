"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegisterMutation } from "@/redux/api/apiSlice";
import toast from "react-hot-toast";
import { User, Mail, Lock, Send, Phone, MapPin, Globe, Map, Users, CheckCircle, Clock, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [gender, setGender] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [register, { isLoading: loading }] = useRegisterMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (mobile && mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      const result = await register({ name, email, password, mobile, address, country, state, gender }).unwrap();
      if (result.success) {
        setSubmitted(true);
        toast.success("Registration request submitted!");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Registration failed. Please try again.");
    }
  };

  // Success state - pending approval screen
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative" }}>
        <div className="bg-mesh" />
        <div className="bg-blob-accent" style={{ top: "10%", right: "10%" }} />
        <div
          className="glass-card animate-fade-in-up"
          style={{ width: "100%", maxWidth: 520, padding: "56px 48px", textAlign: "center", position: "relative", zIndex: 10, borderRadius: 24 }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px", boxShadow: "0 12px 32px rgba(16,185,129,0.3)"
          }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Request Submitted!</h1>
          <p style={{ color: "#64748b", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            Your registration request has been submitted successfully.<br />
            <strong style={{ color: "#0f172a" }}>Admin will review and approve your account.</strong><br />
            You will be able to login once your request is approved.
          </p>
          <div style={{
            background: "#fef9c3", border: "1px solid #fde047", borderRadius: 12,
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
            marginBottom: 32, textAlign: "left"
          }}>
            <Clock size={20} style={{ color: "#ca8a04", flexShrink: 0 }} />
            <p style={{ fontSize: 14, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
              Approval typically takes <strong>24–48 hours</strong>. Please check back after some time.
            </p>
          </div>
          <Link
            href="/login"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 36px", borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              color: "white", textDecoration: "none",
              boxShadow: "0 4px 14px rgba(37,99,235,0.25)"
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative" }}>
        <div className="bg-mesh" />
        <div className="bg-blob-accent" style={{ top: "10%", right: "10%" }} />

        <div
          className="glass-card animate-fade-in-up"
          style={{
            width: "100%", maxWidth: 720, padding: "36px 40px", margin: "auto",
            position: "relative", zIndex: 10, background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(20px)", borderRadius: 24,
            boxShadow: "0 20px 50px -12px rgba(15,23,42,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          {/* Logo & Title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img src="/veagle-logo.webp" alt="Logo" className="animate-flip-y" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a" }}>DataVault</span>
          </div>

          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Create Account Request</h1>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
              Fill in your details. Admin will review and activate your account.
            </p>
          </div>

          {/* Info Banner */}
          <div style={{
            background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
            padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10,
            marginBottom: 22
          }}>
            <Clock size={16} style={{ color: "#2563eb", marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: "#1e40af", margin: 0, lineHeight: 1.5 }}>
              <strong>No payment required.</strong> After submitting, admin will review your request and assign your plan. You'll be notified once approved.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px 18px" }}>
              {/* Full Name */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>Full Name *</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type="text" className="form-input" placeholder="John Doe"
                    value={name} onChange={(e) => setName(e.target.value)} required
                    style={{ padding: "0 16px 0 38px", height: 48, fontSize: 14, borderRadius: 10 }} />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>Email Address *</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type="email" className="form-input" placeholder="name@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                    style={{ padding: "0 16px 0 38px", height: 48, fontSize: 14, borderRadius: 10 }} />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>Mobile Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type="tel" className="form-input" placeholder="10-digit mobile number"
                    value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10}
                    style={{ padding: "0 16px 0 38px", height: 48, fontSize: 14, borderRadius: 10 }} />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>Gender</label>
                <div style={{ position: "relative" }}>
                  <Users size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)}
                    style={{ padding: "0 16px 0 38px", height: 48, fontSize: 14, borderRadius: 10, color: gender ? "#0f172a" : "#94a3b8" }}>
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Address - full width */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>Address</label>
                <div style={{ position: "relative" }}>
                  <MapPin size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type="text" className="form-input" placeholder="Street address, building, or area"
                    value={address} onChange={(e) => setAddress(e.target.value)}
                    style={{ padding: "0 16px 0 38px", height: 48, fontSize: 14, borderRadius: 10 }} />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>Country</label>
                <div style={{ position: "relative" }}>
                  <Globe size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type="text" className="form-input" placeholder="e.g. India"
                    value={country} onChange={(e) => setCountry(e.target.value)}
                    style={{ padding: "0 16px 0 38px", height: 48, fontSize: 14, borderRadius: 10 }} />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>State</label>
                <div style={{ position: "relative" }}>
                  <Map size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type="text" className="form-input" placeholder="e.g. Maharashtra"
                    value={state} onChange={(e) => setState(e.target.value)}
                    style={{ padding: "0 16px 0 38px", height: 48, fontSize: 14, borderRadius: 10 }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>Password *</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type={showPassword ? "text" : "password"} className="form-input" placeholder="Min 6 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    style={{ padding: "0 40px 0 38px", height: 48, fontSize: 14, borderRadius: 10 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>Confirm Password *</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type={showConfirmPassword ? "text" : "password"} className="form-input" placeholder="Repeat password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    style={{ padding: "0 40px 0 38px", height: 48, fontSize: 14, borderRadius: 10 }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 }}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit" disabled={loading}
              className="btn-primary"
              style={{
                width: "100%", marginTop: 10, padding: "13px", fontSize: 15, fontWeight: 700,
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                boxShadow: "0 4px 14px rgba(37,99,235,0.25)", cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Submitting Request..." : (<><Send size={17} /> Submit Registration Request</>)}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 22, marginBottom: 0, fontSize: 14, color: "#64748b" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
          </p>
        </div>
      </div>
    </>
  );
}
