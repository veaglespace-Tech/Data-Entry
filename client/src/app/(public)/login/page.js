"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "@/redux/api/apiSlice";
import { setCredentials } from "@/redux/slice/authSlice";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn, Database } from "lucide-react";

export default function LoginPage() {
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
      dispatch(setCredentials({ user: userData, token }));
      toast.success("Login successful!");
      router.push("/dashboard");
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
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/veagle-logo.webp" 
              alt="Main Brand Logo" 
              className="animate-flip-y"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
            DataVault
          </span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Welcome back
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, marginBottom: 40 }}>
          Log in to your account to continue
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label className="form-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52 }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52 }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: 6, marginBottom: 4 }}>
            <Link href="/forgot-password" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', fontSize: 13 }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 8, padding: '16px', fontSize: 16 }}
          >
            {loading ? "Signing in..." : <><LogIn size={18} /> Sign In to Dashboard</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 15, color: '#64748b' }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
            Sign up for free
          </Link>
        </p>
        </div>
      </div>
    </>
  );
}
