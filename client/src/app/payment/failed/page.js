"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

function FailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)' }}>
        <XCircle size={40} color="#dc2626" />
      </div>
      
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' }}>
        Payment Failed
      </h1>
      
      <p style={{ fontSize: 18, color: '#475569', marginBottom: 8 }}>
        Unfortunately, your transaction could not be completed.
      </p>

      {error && (
        <p style={{ fontSize: 14, color: '#ef4444', marginBottom: 32, padding: '8px 16px', background: '#fef2f2', borderRadius: 8 }}>
          Reason: {error}
        </p>
      )}

      <button
        onClick={() => router.push("/subscription")}
        className="btn-primary"
        style={{ padding: '16px 32px', fontSize: 16 }}
      >
        <ArrowLeft size={18} />
        Try Again
      </button>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <div style={{ minHeight: "100vh", position: 'relative' }}>
      <div className="bg-mesh"></div>
      <Navbar />

      <main style={{ padding: '120px 24px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <Suspense fallback={<div>Loading...</div>}>
          <FailedContent />
        </Suspense>
      </main>
    </div>
  );
}
