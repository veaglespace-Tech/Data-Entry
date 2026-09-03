"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "@/redux/api/apiSlice";
import { setCredentials } from "@/redux/slice/authSlice";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading: loading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      const { token, ...userData } = res.data;

      // Ensure that only admins can login through this portal
      if (userData.role !== "ADMIN") {
        toast.error("Access denied: Admin privileges required.");
        return;
      }

      dispatch(setCredentials({ user: userData, token }));
      toast.success("Admin login successful!");
      router.push("/admin/users");
    } catch (error) {
      toast.error(error.data?.message || "Login failed");
    }
  };

  return (
    <>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 24px', position: 'relative' }}>
        <div className="bg-mesh"></div>
        <div className="bg-blob-accent" style={{ top: '10%', right: '10%' }}></div>

        <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 460, padding: 48, position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
          {/* Logo / Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src="/veagle-logo.webp" 
                alt="Main Brand Logo" 
                className="animate-flip-y"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                <ShieldCheck size={14} /> Official Admin Access
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                DataVault Admin Portal
              </h1>
              <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0 0' }}>Secure control center for administrators</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label className="form-label">Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: 46 }}
                  placeholder="admin@datavault.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: 46 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 12,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              {loading ? 'Authenticating...' : (
                <>
                  <LogIn size={20} /> Access Portal
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
