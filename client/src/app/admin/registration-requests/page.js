"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  useGetRegistrationRequestsQuery,
  useApproveRegistrationRequestMutation,
  useRejectRegistrationRequestMutation,
  useDeleteRegistrationRequestMutation,
  useGetAdminPlansQuery,
  useGetFieldTemplatesQuery,
} from "@/redux/api/apiSlice";
import toast from "react-hot-toast";
import {
  ClipboardList, CheckCircle, XCircle, Trash2, Search,
  Clock, User, Mail, Phone, MapPin, Calendar, ChevronDown, X,
  Shield, Layers
} from "lucide-react";

const STATUS_COLORS = {
  PENDING: { bg: "#fef9c3", color: "#92400e", border: "#fde047", label: "Pending" },
  APPROVED: { bg: "#dcfce7", color: "#166534", border: "#86efac", label: "Approved" },
  REJECTED: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", label: "Rejected" },
};

export default function RegistrationRequestsPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();

  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Approve modal state
  const [approveModal, setApproveModal] = useState(null); // { id, name, email }
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [planExpiresAt, setPlanExpiresAt] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);

  // Reject modal state
  const [rejectModal, setRejectModal] = useState(null); // { id, name }
  const [rejectNote, setRejectNote] = useState("");

  const { data, isLoading, refetch } = useGetRegistrationRequestsQuery(
    { status: filterStatus || undefined, search },
    { skip: !user }
  );

  const { data: plansData } = useGetAdminPlansQuery(undefined, { skip: !user });
  const { data: templatesData } = useGetFieldTemplatesQuery(undefined, { skip: !user });
  const [approveRequest, { isLoading: approving }] = useApproveRegistrationRequestMutation();
  const [rejectRequest, { isLoading: rejecting }] = useRejectRegistrationRequestMutation();
  const [deleteRequest, { isLoading: deleting }] = useDeleteRegistrationRequestMutation();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const requests = data?.data || [];
  const plans = plansData?.data || [];
  const allTemplates = templatesData?.data || [];

  const toggleTemplate = (tId) => {
    setSelectedTemplateIds(prev => 
      prev.includes(tId) ? prev.filter(id => id !== tId) : [...prev, tId]
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handlePlanChange = (e) => {
    const pId = e.target.value;
    setSelectedPlanId(pId);
    if (!pId) {
      setPlanExpiresAt("");
      return;
    }
    const plan = plans.find(p => p.id === parseInt(pId));
    if (plan && plan.period) {
      const daysMatch = plan.period.match(/(\d+)\s*days?/i);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);
        setPlanExpiresAt(expiry.toISOString().split('T')[0]);
      } else {
        setPlanExpiresAt("");
      }
    }
  };

  const handleApprove = async () => {
    try {
      await approveRequest({
        id: approveModal.id,
        planId: selectedPlanId ? parseInt(selectedPlanId) : undefined,
        planExpiresAt: planExpiresAt || undefined,
        adminNote: adminNote || undefined,
        templateIds: selectedTemplateIds,
      }).unwrap();
      toast.success(`Account created for "${approveModal.name}"!`);
      setApproveModal(null);
      setSelectedPlanId("");
      setPlanExpiresAt("");
      setAdminNote("");
      setSelectedTemplateIds([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Approval failed");
    }
  };

  const handleReject = async () => {
    try {
      await rejectRequest({ id: rejectModal.id, adminNote: rejectNote }).unwrap();
      toast.success(`Request from "${rejectModal.name}" rejected`);
      setRejectModal(null);
      setRejectNote("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Rejection failed");
    }
  };

  const handleDelete = async (req) => {
    if (!confirm(`Delete request from "${req.name}"? This cannot be undone.`)) return;
    try {
      await deleteRequest(req.id).unwrap();
      toast.success("Request deleted");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 28px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #f43f5e, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(244,63,94,0.3)" }}>
              <ClipboardList size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Registration Requests</h1>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Review and approve new user registration requests</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.2s",
                background: filterStatus === s ? "linear-gradient(135deg, #f43f5e, #8b5cf6)" : "#f1f5f9",
                color: filterStatus === s ? "white" : "#475569",
                boxShadow: filterStatus === s ? "0 4px 12px rgba(244,63,94,0.25)" : "none",
              }}
            >
              {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}

          {/* Search */}
          <form onSubmit={handleSearch} style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text" placeholder="Search by name or email..."
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                style={{ paddingLeft: 32, paddingRight: 12, height: 38, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", width: 240 }}
              />
            </div>
            <button type="submit" style={{ padding: "8px 16px", borderRadius: 10, background: "#2563eb", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Search
            </button>
          </form>
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <ClipboardList size={56} style={{ color: "#cbd5e1", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#64748b" }}>No requests found</h3>
            <p style={{ color: "#94a3b8" }}>
              {filterStatus === "PENDING" ? "No pending requests at the moment." : "No requests match your filter."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {requests.map((req) => {
              const statusStyle = STATUS_COLORS[req.status] || STATUS_COLORS.PENDING;
              return (
                <div key={req.id} style={{ background: "white", borderRadius: 16, padding: "24px 28px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                  {/* Avatar */}
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #f43f5e, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                    {req.name?.charAt(0)?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>{req.name}</h3>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}><Mail size={13} />{req.email}</span>
                      {req.mobile && <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}><Phone size={13} />{req.mobile}</span>}
                      {req.state && <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={13} />{req.state}{req.country ? `, ${req.country}` : ""}</span>}
                      <span style={{ fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={13} />{new Date(req.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                    {req.adminNote && (
                      <p style={{ fontSize: 12, color: "#64748b", marginTop: 6, fontStyle: "italic" }}>Note: {req.adminNote}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {req.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => setApproveModal({ id: req.id, name: req.name, email: req.email })}
                          style={{ padding: "8px 18px", borderRadius: 10, background: "#dcfce7", color: "#166534", border: "1px solid #86efac", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: req.id, name: req.name })}
                          style={{ padding: "8px 18px", borderRadius: 10, background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(req)}
                      style={{ padding: "8px 12px", borderRadius: 10, background: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0", fontSize: 13, cursor: "pointer" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Approve Modal */}
      {approveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "36px", width: "100%", maxWidth: 500, boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Approve Request</h2>
              <button onClick={() => setApproveModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: "#166534", margin: 0 }}>
                Approving <strong>{approveModal.name}</strong> ({approveModal.email})<br />
                This will create their account immediately.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Plan Select */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Assign Plan (Optional)</label>
                <select
                  value={selectedPlanId} onChange={handlePlanChange}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}
                >
                  <option value="">No Plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — ₹{p.price}/{p.period}</option>
                  ))}
                </select>
              </div>

              {/* Expiry Date */}
              {selectedPlanId && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Plan Expiry Date</label>
                  <input
                    type="date" value={planExpiresAt} onChange={(e) => setPlanExpiresAt(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}
                  />
                </div>
              )}

              {/* Assign Templates */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <Layers size={14} color="#3b82f6" /> Assign Field Templates
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 120, overflowY: "auto", border: "1px solid #e2e8f0", padding: "8px", borderRadius: 10, background: "#f8fafc" }}>
                  {allTemplates.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0, padding: 4 }}>No templates available.</p>
                  ) : (
                    allTemplates.map(t => (
                      <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: "pointer", margin: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={selectedTemplateIds.includes(t.id)} 
                          onChange={() => toggleTemplate(t.id)} 
                          style={{ width: 14, height: 14, cursor: "pointer" }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{t.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Admin Note (Optional)</label>
                <textarea
                  value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Welcome message or any note..."
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setApproveModal(null)}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove} disabled={approving}
                style={{ flex: 2, padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #10b981, #059669)", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <CheckCircle size={16} />
                {approving ? "Approving..." : "Approve & Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "36px", width: "100%", maxWidth: 440, boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Reject Request</h2>
              <button onClick={() => setRejectModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
            </div>

            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: "#92400e", margin: 0 }}>
                Rejecting request from <strong>{rejectModal.name}</strong>. They will not be able to login.
              </p>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Reason / Note (Optional)</label>
              <textarea
                value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setRejectModal(null)}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject} disabled={rejecting}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <XCircle size={16} />
                {rejecting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
