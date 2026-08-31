"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <div className="bg-mesh"></div>
      <div className="bg-blob-accent"></div>
      <Navbar />

      <main style={{ padding: '80px 24px 120px', maxWidth: 1000, margin: '0 auto' }}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 80 }}>
          <div className="badge badge-primary" style={{ marginBottom: 24, padding: '8px 16px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
            <Heart size={16} style={{ marginRight: 8 }} />
            Our Mission
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, color: '#0f172a', marginBottom: 24, letterSpacing: '-0.03em' }}>
            Making Data Entry <br />
            <span className="gradient-text-primary">Effortless</span> for Everyone.
          </h1>
          <p style={{ fontSize: 20, color: '#475569', maxWidth: 700, margin: '0 auto', lineHeight: 1.7 }}>
            DataVault was built with a simple premise: managing your data shouldn't require a Ph.D. in database administration. We provide the tools to build custom forms, collect data, and analyze results seamlessly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, marginBottom: 80 }}>
          <div className="glass-card animate-fade-in-up" style={{ padding: 40, animationDelay: '0.1s' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid #bfdbfe' }}>
              <Zap size={28} style={{ color: '#2563eb' }} />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Blazing Fast</h3>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6 }}>
              Built on modern architecture, our platform ensures your forms load instantly and your data is processed without delay, even at scale.
            </p>
          </div>

          <div className="glass-card animate-fade-in-up" style={{ padding: 40, animationDelay: '0.2s' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid #bbf7d0' }}>
              <Shield size={28} style={{ color: '#16a34a' }} />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Bank-Grade Security</h3>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6 }}>
              Your data is your most valuable asset. We employ state-of-the-art encryption and access controls to keep everything secure.
            </p>
          </div>

          <div className="glass-card animate-fade-in-up" style={{ padding: 40, animationDelay: '0.3s' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid #fde68a' }}>
              <Globe size={28} style={{ color: '#d97706' }} />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Global Reach</h3>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6 }}>
              Collect data from users all around the world with forms that are fully responsive and optimized for any device or network.
            </p>
          </div>
        </div>

        <div className="glass-card animate-fade-in-up" style={{ padding: 60, textAlign: 'center', background: 'linear-gradient(135deg, #ffffff, #f1f5f9)', animationDelay: '0.4s' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Ready to join us?</h2>
          <p style={{ fontSize: 18, color: '#475569', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
            Start building forms and collecting data in minutes. No credit card required to start.
          </p>
          <Link href="/register" className="btn-primary" style={{ padding: '16px 40px', fontSize: 18 }}>
            Create Your Account <ArrowRight size={18} />
          </Link>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.05)', padding: '40px 24px', textAlign: 'center', background: '#ffffff' }}>
        <p style={{ color: '#64748b', fontSize: 15, fontWeight: 500 }}>
          © 2024 DataVault SaaS. Built with ❤️ for speed and beauty.
        </p>
      </footer>
    </>
  );
}
