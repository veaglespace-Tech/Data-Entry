"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading, selectIsAdmin } from "@/redux/slice/authSlice";
import { useGetUserDetailsQuery, useUpdateUserDetailsMutation, useGetPlansQuery } from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import { ArrowLeft, User, Mail, Phone, Calendar, Star, FileText, CheckCircle2, XCircle, Clock, Shield, Edit2, X, Users } from "lucide-react";
import Link from "next/link";

export default function UserDetailsPage({ params }) {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams?.id || (params && typeof params.then === "function" ? use(params).id : params?.id);
  
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const isAdmin = useSelector(selectIsAdmin);

  const { data: userDetails, isLoading: userLoading, refetch } = useGetUserDetailsQuery(id, { skip: !isAdmin || !id });
  const { data: plansData } = useGetPlansQuery();
  const [updateUserDetails] = useUpdateUserDetailsMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    planId: "",
    planStatus: "INACTIVE",
    planExpiresAt: ""
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Access denied. Admin only.");
      router.push("/dashboard");
    }
  }, [user, isAdmin, authLoading, router]);

  const targetUser = userDetails?.data;
  const plans = plansData?.data || [];

  const handleOpenEdit = () => {
    if (targetUser) {
      setEditForm({
        planId: targetUser.planId || "",
        planStatus: targetUser.planStatus || "INACTIVE",
        planExpiresAt: targetUser.planExpiresAt ? new Date(targetUser.planExpiresAt).toISOString().slice(0, 16) : ""
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: targetUser.id,
        planStatus: editForm.planStatus,
      };

      if (editForm.planId) payload.planId = parseInt(editForm.planId);
      if (editForm.planExpiresAt) payload.planExpiresAt = new Date(editForm.planExpiresAt).toISOString();

      await updateUserDetails(payload).unwrap();
      toast.success("User plan upgraded successfully (₹0)");
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to update user plan");
    }
  };

  if (authLoading || userLoading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "32px 36px" }}>Loading...</main>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "32px 36px" }}>
          <div style={{ background: "white", padding: 32, borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>User Not Found</h2>
            <p style={{ color: "#64748b", margin: "8px 0 20px" }}>The requested user could not be found or failed to load.</p>
            <Link href="/admin/users" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
              ← Back to Users List
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxHeight: "100vh" }}>
        
        {/* Top Actions */}
        <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
          <Link href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: 14, marginBottom: 24, transition: 'color 0.2s' }}>
            <ArrowLeft size={16} /> Back to Users
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontWeight: 800, boxShadow: '0 10px 25px rgba(59,130,246,0.3)' }}>
              {targetUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                {targetUser.name}
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 100, background: targetUser.role === 'ADMIN' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', color: targetUser.role === 'ADMIN' ? '#ef4444' : '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {targetUser.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />} {targetUser.role}
                </span>
              </h1>
              <p style={{ color: "#64748b", fontSize: 16, marginTop: 4 }}>User ID: #{targetUser.id}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
          
          {/* Profile Card */}
          <div className="glass-card" style={{ background: "white", borderRadius: 20, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="#3b82f6" /> Profile Details
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Mail size={18} /></div>
                <div>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Email Address</p>
                  <p style={{ fontSize: 15, color: '#0f172a', margin: 0, fontWeight: 500 }}>{targetUser.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Phone size={18} /></div>
                <div>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Mobile Number</p>
                  <p style={{ fontSize: 15, color: '#0f172a', margin: 0, fontWeight: 500 }}>{targetUser.mobile || 'Not provided'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Calendar size={18} /></div>
                <div>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Joined Date</p>
                  <p style={{ fontSize: 15, color: '#0f172a', margin: 0, fontWeight: 500 }}>{new Date(targetUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="glass-card" style={{ background: "white", borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, background: targetUser.planStatus === 'ACTIVE' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '6px 16px', borderBottomLeftRadius: 16, color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              {targetUser.planStatus === 'ACTIVE' ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {targetUser.planStatus}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={18} color="#f59e0b" /> Subscription Plan
              </h2>
            </div>
            
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 600 }}>CURRENT PLAN</p>
              <h3 style={{ fontSize: 24, color: '#0f172a', fontWeight: 800, margin: '4px 0 0 0' }}>
                {targetUser.plan ? targetUser.plan.name : "Free / No Plan"}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Start Date</p>
                <p style={{ fontSize: 14, color: '#0f172a', margin: '4px 0 0 0', fontWeight: 600 }}>
                  {targetUser.planStartedAt ? new Date(targetUser.planStartedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> End Date</p>
                <p style={{ fontSize: 14, color: '#0f172a', margin: '4px 0 0 0', fontWeight: 600 }}>
                  {targetUser.planExpiresAt ? new Date(targetUser.planExpiresAt).toLocaleDateString() : 'Lifetime Access'}
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenEdit}
              style={{ width: '100%', padding: '12px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
            >
              <Edit2 size={16} /> Assign ₹0 Plan Upgrade
            </button>
          </div>

          {/* Usage Stats Card */}
          <div className="glass-card" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 20, padding: 24, color: 'white' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#10b981" /> Usage Statistics
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><FileText size={20} /></div>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#cbd5e1' }}>Total Forms</span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{targetUser.formsCount}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Users size={20} /></div>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#cbd5e1' }}>Total Entries</span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{targetUser.entriesCount}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Transactions Table */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.2s', background: "white", borderRadius: 20, padding: 32, marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            Transaction History
          </h2>
          <div style={{ overflow: "auto", borderRadius: 16, border: "1px solid rgba(0, 0, 0, 0.05)" }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'left' }}>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Transaction ID</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {targetUser.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>
                      No transaction history found for this user.
                    </td>
                  </tr>
                ) : (
                  targetUser.transactions.map((txn) => (
                    <tr key={txn.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: '#475569' }}>
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: '#0f172a', fontWeight: 500, fontFamily: 'monospace' }}>
                        {txn.txnid}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: '#0f172a', fontWeight: 700 }}>
                        ₹{txn.amount}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          fontSize: 12, 
                          fontWeight: 700, 
                          padding: '4px 10px', 
                          borderRadius: 100,
                          background: txn.status === 'SUCCESS' ? 'rgba(16,185,129,0.1)' : txn.status === 'FAILED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: txn.status === 'SUCCESS' ? '#10b981' : txn.status === 'FAILED' ? '#ef4444' : '#f59e0b'
                        }}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Edit Subscription Modal */}
      {isEditModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div className="animate-fade-in-up" style={{ background: "white", borderRadius: 24, padding: 40, width: "100%", maxWidth: 500, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>Assign ₹0 Plan Upgrade</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "#f1f5f9", border: "none", width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Assign Plan</label>
                  <select
                    className="form-control"
                    value={editForm.planId}
                    onChange={(e) => setEditForm({ ...editForm, planId: e.target.value })}
                  >
                    <option value="">No Plan</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: 12, color: '#3b82f6', marginTop: 8 }}>Note: Changing the plan will automatically create a ₹0 receipt for this user.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Plan Status</label>
                  <select
                    className="form-control"
                    value={editForm.planStatus}
                    onChange={(e) => setEditForm({ ...editForm, planStatus: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Custom Expiry Date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={editForm.planExpiresAt}
                    onChange={(e) => setEditForm({ ...editForm, planExpiresAt: e.target.value })}
                  />
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Leave blank for lifetime access.</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 32 }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid #cbd5e1", background: "white", color: "#64748b", fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "white", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
                  <CheckCircle2 size={18} /> Upgrade User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
