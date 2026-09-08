"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/slice/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Database, FileText, BarChart3, Download,
  Shield, Zap, ArrowRight, Search, Layers, CheckCircle,
} from "lucide-react";

const features = [
  { icon: FileText, title: "Custom Field Forms", desc: "Admin creates tailored field sets with up to 12 custom fields per form for structured data collection.", color: "#2563eb" },
  { icon: Database, title: "Instant Data Entry", desc: "Fill in your assigned form fields, submit instantly, and fields reset for the next entry automatically.", color: "#14b8a6" },
  { icon: Search, title: "Search & Filter", desc: "Powerful search and filtering to find exactly the data you need instantly from your entries.", color: "#f97316" },
  { icon: Layers, title: "Multi-Template Support", desc: "Get multiple field templates assigned by admin — handle different data sets from one dashboard.", color: "#8b5cf6" },
  { icon: Download, title: "Export to Excel", desc: "Download all your data entries as a formatted Excel (.xlsx) file with a single click.", color: "#06b6d4" },
  { icon: BarChart3, title: "Dashboard & Charts", desc: "Beautiful dashboard with real-time statistics and activity charts for admins and users.", color: "#ec4899" },
];

const steps = [
  { step: "1", title: "Submit Request", desc: "Fill in your details and submit a registration request.", color: "#2563eb" },
  { step: "2", title: "Admin Approves", desc: "Admin reviews your request, assigns a plan and field templates.", color: "#8b5cf6" },
  { step: "3", title: "Login & Enter Data", desc: "Login to your dashboard and start filling your assigned field forms.", color: "#ec4899" },
];

export default function LandingPage() {
  const user = useSelector(selectCurrentUser);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      router.push("/dashboard");
    }
  }, [user, mounted, router]);

  // Don't render until client-side hydration is done
  if (!mounted) return null;

  return (
    <>
      <div className="bg-pattern" />
      <div className="bg-mesh" />
      <div className="bg-blob-accent" />

      {/* Hero Section */}
      <section style={{ padding: "40px 24px 100px", textAlign: "center", position: "relative", maxWidth: 1100, margin: "0 auto" }}>
        <div className="animate-fade-in-up">
          <div className="badge badge-primary" style={{ marginBottom: 36, padding: "10px 20px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", boxShadow: "0 4px 14px rgba(37,99,235,0.1)" }}>
            <Zap size={16} style={{ marginRight: 8 }} />
            Admin-Managed Data Entry Platform
          </div>

          <h1 style={{ fontSize: "clamp(44px, 8vw, 84px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.04em", color: "var(--foreground)" }}>
            Structured Data Entry.<br />
            <span className="gradient-text-primary" style={{ display: "inline-block", marginTop: 12 }}>Managed by Admin.</span>
          </h1>

          <p style={{ fontSize: "clamp(18px, 2.5vw, 22px)", color: "var(--text-muted)", maxWidth: 760, margin: "0 auto 48px", lineHeight: 1.7, fontWeight: 400 }}>
            Register your account, get approved by admin, and start entering data through your assigned field templates — all from one clean dashboard. Export to Excel anytime.
          </p>

          <div style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-primary" style={{ padding: "18px 42px", fontSize: 17 }}>
              Request Access <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="btn-secondary" style={{ padding: "18px 42px", fontSize: 17 }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "60px 24px 80px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, marginBottom: 16, color: "var(--foreground)", letterSpacing: "-0.02em" }}>How It Works</h2>
          <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto" }}>Get started in three simple steps.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {steps.map((s) => (
            <div key={s.step} className="glass-card animate-fade-in-up" style={{ padding: 24, textAlign: "center" }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: `${s.color}18`, border: `2px solid ${s.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", fontSize: 22, fontWeight: 900, color: s.color
              }}>
                {s.step}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: "var(--foreground)" }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "40px 24px 140px", maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 800, marginBottom: 20, color: "var(--foreground)", letterSpacing: "-0.02em" }}>Everything You Need</h2>
          <p style={{ fontSize: 20, color: "var(--text-muted)", maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
            Powerful tools designed to streamline your data entry workflow.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="glass-card animate-fade-in-up" style={{ padding: 36, animationDelay: `${index * 0.1}s`, display: "flex", flexDirection: "column" }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: `${feature.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, border: `1px solid ${feature.color}30`, boxShadow: `0 8px 20px ${feature.color}15` }}>
                  <Icon size={32} style={{ color: feature.color }} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: "var(--foreground)" }}>{feature.title}</h3>
                <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.7 }}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "60px 24px 120px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <div className="glass-card animate-fade-in-up" style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 40px", background: "linear-gradient(135deg, #ffffff, #eff6ff)", border: "1px solid #bfdbfe", boxShadow: "0 30px 60px rgba(37,99,235,0.12)" }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 20, color: "var(--foreground)", letterSpacing: "-0.02em" }}>Ready to get started?</h2>
          <p style={{ fontSize: 20, color: "var(--text-muted)", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            Submit your registration request today. No payment required — admin will set everything up for you.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-primary" style={{ padding: "18px 48px", fontSize: 18 }}>
              Request Access <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="btn-secondary" style={{ padding: "18px 48px", fontSize: 18 }}>
              Already approved? Sign In
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
