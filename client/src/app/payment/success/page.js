"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slice/authSlice";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const token = searchParams.get('token');

  useEffect(() => {
    const processLoginAndRedirect = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (data.success) {
            dispatch(setCredentials({ user: data.data, token }));
            sessionStorage.removeItem('tempUserData');
          }
        } catch (e) {
          console.error("Failed to fetch user with token", e);
        }
      }

      // Automatically redirect to dashboard after 3 seconds so state refreshes
      setTimeout(() => {
        // Reload is necessary to fetch new user state with updated planStatus
        window.location.href = "/dashboard";
      }, 3000);
    };

    processLoginAndRedirect();
  }, [token, dispatch]);

  return (
    <div style={{ minHeight: "100vh", position: 'relative' }}>
      <div className="bg-mesh"></div>
      <Navbar />

      <main style={{ padding: '120px 24px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <div className="glass-card animate-fade-in-up" style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 10px 25px rgba(34, 197, 94, 0.2)' }}>
            <CheckCircle size={40} color="#16a34a" />
          </div>
          
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' }}>
            Payment Successful!
          </h1>
          
          <p style={{ fontSize: 18, color: '#475569', marginBottom: 32 }}>
            Your transaction has been processed securely. Your premium plan is now active.
          </p>

          <p style={{ fontSize: 14, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="spinner" style={{ width: 16, height: 16, border: '2px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
            Redirecting to your dashboard...
          </p>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}>Loading payment status...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
