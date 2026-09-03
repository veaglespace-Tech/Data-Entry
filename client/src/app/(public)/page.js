"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Database,
  FileText,
  BarChart3,
  Download,
  Shield,
  Zap,
  ArrowRight,
  Search,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Custom Forms",
    desc: "Create dynamic forms with text, number, email, dropdown, date and more field types.",
    color: "#2563eb"
  },
  {
    icon: Database,
    title: "CRUD Operations",
    desc: "Full Create, Read, Update, Delete operations on all your data entries.",
    color: "#14b8a6"
  },
  {
    icon: Search,
    title: "Search & Filter",
    desc: "Powerful search and filtering to find exactly the data you need instantly.",
    color: "#f97316"
  },
  {
    icon: Layers,
    title: "Pagination",
    desc: "Smart pagination to handle thousands of entries without performance issues.",
    color: "#8b5cf6"
  },
  {
    icon: Download,
    title: "Export to CSV",
    desc: "Export your data entries to CSV files with one click for external use.",
    color: "#06b6d4"
  },
  {
    icon: BarChart3,
    title: "Dashboard & Charts",
    desc: "Beautiful dashboard with real-time statistics and interactive charts.",
    color: "#ec4899"
  },
];

export default function LandingPage() {
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <>
      <div className="bg-pattern"></div>
      <div className="bg-mesh"></div>
      <div className="bg-blob-accent"></div>
      


      {/* Hero Section */}
      <section style={{ padding: '120px 24px 100px', textAlign: 'center', position: 'relative', maxWidth: 1100, margin: '0 auto' }}>
        <div className="animate-fade-in-up">
          <div className="badge badge-primary" style={{ marginBottom: 36, padding: '10px 20px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', boxShadow: '0 4px 14px rgba(37,99,235,0.1)' }}>
            <Zap size={16} style={{ marginRight: 8 }} />
            The Next Generation Data Entry Platform
          </div>

          <h1 style={{ fontSize: 'clamp(44px, 8vw, 84px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.04em', color: '#0f172a' }}>
            Create Custom Forms.<br />
            <span className="gradient-text-primary" style={{ display: 'inline-block', marginTop: 12 }}>Collect Data Instantly.</span>
          </h1>

          <p style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', color: '#475569', maxWidth: 760, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 400 }}>
            No coding required. Build dynamic forms, share them with your team, and manage all your entries in one beautiful dashboard. Search, filter, and export your data in seconds.
          </p>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '18px 42px', fontSize: 17 }}>
              Start for free <ArrowRight size={20} />
            </Link>
            <Link href="/subscription" className="btn-secondary" style={{ padding: '18px 42px', fontSize: 17, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 24px 140px', maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 800, marginBottom: 20, color: '#0f172a', letterSpacing: '-0.02em' }}>Everything You Need</h2>
          <p style={{ fontSize: 20, color: '#64748b', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>Powerful tools designed to streamline your workflow and boost your productivity effortlessly.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass-card animate-fade-in-up"
                style={{ padding: 48, animationDelay: `${index * 0.1}s`, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ width: 64, height: 64, borderRadius: 20, background: `${feature.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, border: `1px solid ${feature.color}30`, boxShadow: `0 8px 20px ${feature.color}15` }}>
                  <Icon size={32} style={{ color: feature.color }} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: '#0f172a' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7 }}>
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '60px 24px 120px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="glass-card animate-fade-in-up" style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 40px', background: 'linear-gradient(135deg, #ffffff, #eff6ff)', border: '1px solid #bfdbfe', boxShadow: '0 30px 60px rgba(37,99,235,0.12)' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 20, color: '#0f172a', letterSpacing: '-0.02em' }}>Ready to get started?</h2>
          <p style={{ fontSize: 20, color: '#475569', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>Join thousands of users who are organizing their business data effortlessly.</p>
          <Link href="/register" className="btn-primary" style={{ padding: '18px 48px', fontSize: 18 }}>
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(15, 23, 42, 0.06)', padding: '16px 20px', textAlign: 'center', background: '#ffffff', position: 'relative', zIndex: 10 }}>
        <p style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, margin: 0 }}>
          Designed & Developed by Veagle Space Technology Pvt. Ltd. | © 2026 All Rights Reserved.
        </p>
      </footer>
    </>
  );
}
