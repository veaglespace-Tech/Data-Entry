"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading, selectIsAdmin } from "@/redux/slice/authSlice";
import { 
  useGetAdminPlansQuery, 
  useCreateAdminPlanMutation,
  useUpdateAdminPlanMutation,
  useDeleteAdminPlanMutation
} from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import { Star, Plus, Edit2, Trash2, Check, X } from "lucide-react";

export default function AdminPlansPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const router = useRouter();
  
  const { data, isLoading, refetch } = useGetAdminPlansQuery(undefined, { skip: !isAdmin });
  const [createPlan] = useCreateAdminPlanMutation();
  const [updatePlan] = useUpdateAdminPlanMutation();
  const [deletePlan] = useDeleteAdminPlanMutation();

  const plans = data?.data || [];
  const loading = authLoading || isLoading;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    period: "monthly",
    features: "", // We'll store as string and split by newline for JSON
    formLimit: -1,
    entryLimit: -1
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Access denied. Admin only.");
      router.push("/dashboard");
    }
  }, [user, isAdmin, authLoading, router]);

  if (authLoading || !isAdmin) return null;

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        period: plan.period,
        features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
        formLimit: plan.formLimit,
        entryLimit: plan.entryLimit
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "", description: "", price: 0, period: "monthly", features: "", formLimit: -1, entryLimit: -1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      features: formData.features.split("\n").filter(f => f.trim() !== ""),
      price: parseInt(formData.price),
      formLimit: parseInt(formData.formLimit),
      entryLimit: parseInt(formData.entryLimit)
    };

    try {
      if (editingPlan) {
        await updatePlan({ id: editingPlan.id, ...payload }).unwrap();
        toast.success("Plan updated successfully");
      } else {
        await createPlan(payload).unwrap();
        toast.success("Plan created successfully");
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to save plan");
    }
  };

  const handleDelete = async (id, name, usersCount) => {
    if (usersCount > 0) {
      toast.error(`Cannot delete plan. ${usersCount} users are currently subscribed to it.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete the plan "${name}"?`)) return;

    try {
      await deletePlan(id).unwrap();
      toast.success("Plan deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete plan");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', maxHeight: '100vh', position: 'relative' }}>
          
          {/* Header */}
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 16, letterSpacing: '-0.02em' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)' }}>
                  <Star size={24} color="white" />
                </div>
                Subscription Plans
              </h1>
              <p style={{ color: "#64748b", fontSize: 16, marginTop: 12 }}>
                Create and manage pricing tiers for your platform.
              </p>
            </div>
            
            <button 
              onClick={() => handleOpenModal()} 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14 }}
            >
              <Plus size={18} /> Create New Plan
            </button>
          </div>

          {/* Table */}
          <div className="glass-card animate-fade-in-up" style={{ padding: 32, animationDelay: "0.1s" }}>
            {loading ? (
              <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
            ) : (
              <div style={{ overflow: "auto", borderRadius: 16, border: "1px solid rgba(0, 0, 0, 0.05)", background: '#ffffff' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Plan Details</th>
                      <th>Price & Period</th>
                      <th>Limits</th>
                      <th>Active Users</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: 60, color: "#64748b", fontSize: 15 }}>
                          No plans found. Create one to get started.
                        </td>
                      </tr>
                    ) : (
                      plans.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <p style={{ fontWeight: 800, color: "#0f172a", fontSize: 16 }}>{p.name}</p>
                            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{p.description}</p>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                              <span style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>₹{p.price}</span>
                              <span style={{ color: '#64748b', fontSize: 14 }}>/{p.period}</span>
                            </div>
                          </td>
                          <td>
                            <p style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Forms: {p.formLimit === -1 ? 'Unlimited' : p.formLimit}</p>
                            <p style={{ fontSize: 13, color: '#475569', fontWeight: 600, marginTop: 4 }}>Entries: {p.entryLimit === -1 ? 'Unlimited' : p.entryLimit}</p>
                          </td>
                          <td>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              padding: '6px 12px', 
                              borderRadius: 100, 
                              fontSize: 14, 
                              fontWeight: 700,
                              background: 'rgba(59,130,246,0.1)', 
                              color: '#2563eb',
                            }}>
                              {p._count?.users || 0} Users
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                              <button
                                onClick={() => handleOpenModal(p)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                title="Edit Plan"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id, p.name, p._count?.users || 0)}
                                style={{ background: 'none', border: 'none', cursor: p._count?.users > 0 ? 'not-allowed' : 'pointer', color: p._count?.users > 0 ? '#cbd5e1' : '#ef4444' }}
                                title={p._count?.users > 0 ? "Cannot delete plan with active users" : "Delete Plan"}
                                disabled={p._count?.users > 0}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 600, background: 'white', borderRadius: 24, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    {editingPlan ? 'Edit Subscription Plan' : 'Create New Plan'}
                  </h2>
                  <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Plan Name</label>
                      <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Pro Plan" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Billing Period</label>
                      <select className="form-control" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} required>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Description</label>
                    <input type="text" className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="Short catchphrase for the plan" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Price (₹)</label>
                      <input type="number" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required min="0" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Form Limit</label>
                      <input type="number" className="form-control" value={formData.formLimit} onChange={e => setFormData({...formData, formLimit: e.target.value})} required />
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>-1 for unlimited</p>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Entry Limit</label>
                      <input type="number" className="form-control" value={formData.entryLimit} onChange={e => setFormData({...formData, entryLimit: e.target.value})} required />
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>-1 for unlimited</p>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Features (One per line)</label>
                    <textarea 
                      className="form-control" 
                      rows={4} 
                      value={formData.features} 
                      onChange={e => setFormData({...formData, features: e.target.value})} 
                      required 
                      placeholder="Unlimited Forms&#10;Advanced Analytics&#10;Priority Support" 
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                    <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={18} /> {editingPlan ? 'Save Changes' : 'Create Plan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

      </main>
    </div>
  );
}
