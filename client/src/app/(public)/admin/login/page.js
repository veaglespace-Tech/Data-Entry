"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "@/redux/api/apiSlice";
import { setCredentials } from "@/redux/slice/authSlice";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading: loading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      const { token, ...userData } = res.data;

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
        <div className="bg-blob" style={{ bottom: '10%', left: '10%', background: 'linear-gradient(135deg, #3b82f6 0%, transparent 100%)' }}></div>

        <div className="glass-card animate-fade-in-up" style={{ 
          width: '100%', 
          maxWidth: 480, 
          padding: '48px 40px', 
          position: 'relative', 
          zIndex: 10, 
          background: 'rgba(255,255,255,0.85)', 
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.1)'
        }}>
          {/* Logo / Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 36 }}>
            <div style={{ 
              width: 72, 
              height: 72, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'white',
              borderRadius: 20,
              boxShadow: '0 8px 24px rgba(37,99,235,0.12)',
              padding: 12
            }}>
              <img 
                src="/veagle-logo.webp" 
                alt="Main Brand Logo" 
                className="animate-flip-y"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 12, border: '1px solid #bfdbfe' }}>
                <ShieldCheck size={16} /> Official Admin Access
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                DataVault Admin Portal
              </h1>
              <p style={{ color: '#64748b', fontSize: 15, margin: '8px 0 0 0', fontWeight: 500 }}>Secure control center for administrators</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="form-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 2 }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ 
                    paddingLeft: 46, 
                    paddingTop: 14, 
                    paddingBottom: 14,
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: 14,
                    fontSize: 15,
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                  placeholder="admin@datavault.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 2 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  style={{ 
                    paddingLeft: 46, 
                    paddingRight: 46,
                    paddingTop: 14, 
                    paddingBottom: 14,
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: 14,
                    fontSize: 15,
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8', zIndex: 2 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 16,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(37,99,235,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.3)';
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
