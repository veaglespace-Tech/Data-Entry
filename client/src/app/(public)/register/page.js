"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "@/redux/api/apiSlice";
import { setCredentials } from "@/redux/slice/authSlice";
import toast from "react-hot-toast";
import { User, Mail, Lock, UserPlus, Phone, MapPin, Globe, Map, Users } from "lucide-react";

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
  const router = useRouter();
  const dispatch = useDispatch();
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
    
    if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    
    try {
      // Save temp registration data to sessionStorage
      const tempUserData = { name, email, password, mobile, address, country, state, gender };
      sessionStorage.setItem("tempUserData", JSON.stringify(tempUserData));
      
      toast.success("Details saved! Please choose a plan.");
      router.push("/subscription");
    } catch (error) {
      toast.error("Failed to proceed");
    }
  };

  return (
    <>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative" }}>
        <div className="bg-mesh"></div>
        <div className="bg-blob-accent" style={{ top: "10%", right: "10%" }}></div>

        <div
          className="glass-card animate-fade-in-up"
          style={{
            width: "100%",
            maxWidth: 720,
            padding: "36px 40px",
            margin: "auto",
            position: "relative",
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(20px)",
            borderRadius: 24,
            boxShadow: "0 20px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Logo & Title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img 
                src="/veagle-logo.webp" 
                alt="Main Brand Logo" 
                className="animate-flip-y"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a" }}>
              DataVault
            </span>
          </div>

          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4, letterSpacing: "-0.02em" }}>
              Create your account
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
              Join DataVault and start managing your forms seamlessly
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 2-Column Responsive Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px 18px" }}>
              {/* Full Name */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ paddingLeft: 38, height: 44, fontSize: 14, borderRadius: 10 }}
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>
                  Work Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: 38, height: 44, fontSize: 14, borderRadius: 10 }}
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>
                  Mobile Number
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    style={{ paddingLeft: 38, height: 44, fontSize: 14, borderRadius: 10 }}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>
                  Gender
                </label>
                <div style={{ position: "relative" }}>
                  <Users size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <select
                    className="form-input"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    style={{ paddingLeft: 38, height: 44, fontSize: 14, borderRadius: 10, appearance: "none" }}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Address (Spans Full Width) */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>
                  Address
                </label>
                <div style={{ position: "relative" }}>
                  <MapPin size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Street address, building, or area"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    style={{ paddingLeft: 38, height: 44, fontSize: 14, borderRadius: 10 }}
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>
                  Country
                </label>
                <div style={{ position: "relative" }}>
                  <Globe size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    style={{ paddingLeft: 38, height: 44, fontSize: 14, borderRadius: 10 }}
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>
                  State
                </label>
                <div style={{ position: "relative" }}>
                  <Map size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    style={{ paddingLeft: 38, height: 44, fontSize: 14, borderRadius: 10 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingLeft: 38, height: 44, fontSize: 14, borderRadius: 10 }}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6, display: "block" }}>
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingLeft: 38, height: 44, fontSize: 14, borderRadius: 10 }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "13px",
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                cursor: "pointer",
              }}
            >
              {loading ? (
                "Saving Details..."
              ) : (
                <>
                  <UserPlus size={17} /> Continue to Choose Plan →
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p style={{ textAlign: "center", marginTop: 22, marginBottom: 0, fontSize: 14, color: "#64748b" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
