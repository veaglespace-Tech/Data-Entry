"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading, selectIsAdmin } from "@/redux/slice/authSlice";
import { useGetAdminTransactionsQuery } from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import { CreditCard, Shield, TrendingUp, CheckCircle2, Clock } from "lucide-react";

export default function AdminTransactionsPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const router = useRouter();
  
  const { data, isLoading } = useGetAdminTransactionsQuery(undefined, { skip: !isAdmin });

  const transactions = data?.data || [];
  const loading = authLoading || isLoading;

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Access denied. Admin only.");
      router.push("/dashboard");
    }
  }, [user, isAdmin, authLoading, router]);

  if (authLoading || !isAdmin) return null;

  // Compute Revenue
  const successfulTransactions = transactions.filter(t => t.status === 'success');
  const totalRevenue = successfulTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', maxHeight: '100vh' }}>
          {/* Header */}
          <div className="animate-fade-in-up" style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 16, letterSpacing: '-0.02em' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}>
                <CreditCard size={24} color="white" />
              </div>
              Transactions & Revenue
            </h1>
            <p style={{ color: "#64748b", fontSize: 16, marginTop: 12 }}>
              Monitor system payments, subscriptions, and total revenue.
            </p>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40, animationDelay: '0.1s' }}>
            
            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid rgba(15,23,42,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, color: '#64748b', fontWeight: 600, margin: 0 }}>Total Revenue</h3>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>₹{totalRevenue.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid rgba(15,23,42,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, color: '#64748b', fontWeight: 600, margin: 0 }}>Total Transactions</h3>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{transactions.length}</div>
                </div>
              </div>
            </div>
            
          </div>

          <div className="glass-card animate-fade-in-up" style={{ padding: 32, animationDelay: "0.2s" }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CreditCard size={20} color="#8b5cf6" /> Transaction History
              </h2>
            </div>

            {/* Table */}
            {loading ? (
              <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
            ) : (
              <div style={{ overflow: "auto", borderRadius: 16, border: "1px solid rgba(0, 0, 0, 0.05)", background: '#ffffff' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TXN ID / Ref</th>
                      <th>User</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: 60, color: "#64748b", fontSize: 15 }}>
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <p style={{ fontWeight: 600, color: "#0f172a", fontFamily: 'monospace', fontSize: 13 }}>{t.txnid}</p>
                            {t.payuId && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>PayU: {t.payuId}</p>}
                          </td>
                          <td>
                            <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{t.user?.name || "Unknown"}</p>
                            <p style={{ fontSize: 12, color: "#64748b" }}>{t.user?.email}</p>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#475569' }}>
                              {t.plan?.name || `Plan ID: ${t.planId}`}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            ₹{t.amount?.toLocaleString()}
                          </td>
                          <td>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: 6, 
                              padding: '6px 12px', 
                              borderRadius: 100, 
                              fontSize: 12, 
                              fontWeight: 700,
                              background: t.status === 'success' ? 'rgba(16,185,129,0.1)' : t.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', 
                              color: t.status === 'success' ? '#10b981' : t.status === 'failed' ? '#ef4444' : '#f59e0b',
                            }}>
                              {t.status === 'success' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>
                            {new Date(t.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </main>
    </div>
  );
}
