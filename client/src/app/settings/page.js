"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, setCredentials } from "@/redux/slice/authSlice";
import { useUpdateProfileMutation } from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Save, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setMobile(user.mobile || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (mobile && mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      const updateData = { name, mobile };
      if (password) {
        updateData.password = password;
      }

      const res = await updateProfile(updateData).unwrap();
      const { token, ...userData } = res.data;
      
      // Update local storage and redux state with new user info and token
      dispatch(setCredentials({ user: userData, token }));
      
      toast.success("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxHeight: "100vh" }}>
        
        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 16, letterSpacing: '-0.02em' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #64748b, #94a3b8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(100, 116, 139, 0.3)' }}>
              <SettingsIcon size={24} color="white" />
            </div>
            Settings
          </h1>
          <p style={{ color: "#64748b", marginTop: 8, fontSize: 15 }}>Manage your personal profile and account settings.</p>
        </div>

        {/* Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 32 }}>
            
            {/* Left Column: Profile Info */}
            <div className="glass-card" style={{ background: "white", borderRadius: 20, border: "1px solid rgba(15,23,42,0.06)", padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <User size={20} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>Profile Information</h2>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Full Name</label>
                    <div className="input-with-icon">
                      <User size={18} />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address</label>
                    <div className="input-with-icon">
                      <Mail size={18} />
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Your email address"
                        value={user.email}
                        disabled
                        style={{ background: "#f8fafc", color: "#64748b", cursor: 'not-allowed' }}
                      />
                    </div>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={12} /> Email cannot be changed
                    </p>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Mobile Number</label>
                  <div className="input-with-icon">
                    <Phone size={18} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Security & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              <div className="glass-card" style={{ background: "white", borderRadius: 20, border: "1px solid rgba(15,23,42,0.06)", padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                    <Lock size={20} />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>Security Settings</h2>
                </div>
                
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #8b5cf6' }}>
                  Leave these fields blank if you do not wish to change your password.
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">New Password</label>
                    <div className="input-with-icon">
                      <Lock size={18} />
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Confirm Password</label>
                    <div className="input-with-icon">
                      <Lock size={18} />
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Card */}
              <div className="glass-card" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 20, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 4 }}>Save all changes</h3>
                  <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Ensure your details are correct before saving.</p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    color: "white",
                    border: "none",
                    padding: "14px 32px",
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 8px 20px rgba(37,99,235,0.3)",
                    transition: "all 0.2s ease",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(37,99,235,0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(37,99,235,0.3)";
                    }
                  }}
                >
                  <Save size={20} />
                  {isLoading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>

          </form>
          
        </div>
      </main>
    </div>
  );
}
