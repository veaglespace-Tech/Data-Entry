"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading, selectIsAdmin } from "@/redux/slice/authSlice";
import { useGetUsersQuery, useDeleteUserMutation, useUpdateUserRoleMutation, useUpdateUserDetailsMutation, useGetPlansQuery } from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import { Users, Search, Trash2, Shield, User, Star, Edit2, X, Check } from "lucide-react";

export default function AdminUsersPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, refetch } = useGetUsersQuery(search, { skip: !isAdmin });
  const [deleteUserMutation] = useDeleteUserMutation();
  const [updateRoleMutation] = useUpdateUserRoleMutation();
  const [updateUserDetails] = useUpdateUserDetailsMutation();
  const { data: plansData } = useGetPlansQuery();
  const plans = plansData?.data || [];

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobile: "",
    planId: "",
    planStatus: "INACTIVE",
    planExpiresAt: ""
  });

  const users = data?.data || [];
  const loading = authLoading || isLoading;

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Access denied. Admin only.");
      router.push("/dashboard");
    }
  }, [user, isAdmin, authLoading, router]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const openEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditForm({
      name: userToEdit.name || "",
      email: userToEdit.email || "",
      mobile: userToEdit.mobile || "",
      planId: userToEdit.planId || "",
      planStatus: userToEdit.planStatus || "INACTIVE",
      planExpiresAt: userToEdit.planExpiresAt ? new Date(userToEdit.planExpiresAt).toISOString().slice(0, 16) : ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: editingUser.id,
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        planStatus: editForm.planStatus,
      };

      if (editForm.planId) payload.planId = parseInt(editForm.planId);
      if (editForm.planExpiresAt) payload.planExpiresAt = new Date(editForm.planExpiresAt).toISOString();

      await updateUserDetails(payload).unwrap();
      toast.success("User details updated successfully");
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to update user details");
    }
  };

  const handleDelete = async (id, name) => {
    if (id === user.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (!confirm(`Are you sure you want to delete user "${name}" and ALL their forms and entries? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUserMutation(id).unwrap();
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete user");
    }
  };

  const handleRoleChange = async (id, currentRole) => {
    if (id === user.id) {
      toast.error("You cannot change your own role");
      return;
    }
    
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      await updateRoleMutation({ id, role: newRole }).unwrap();
      toast.success("User role updated");
    } catch (error) {
      toast.error(error.data?.message || "Failed to update role");
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', maxHeight: '100vh' }}>
          {/* Header */}
          <div className="animate-fade-in-up" style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 16, letterSpacing: '-0.02em' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                <Shield size={24} color="white" />
              </div>
              System Administration
            </h1>
            <p style={{ color: "#64748b", fontSize: 16, marginTop: 12 }}>
              Monitor system activity, manage users, and configure roles.
            </p>
          </div>

          {/* Stats Section */}
          <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40, animationDelay: '0.1s' }}>
            
            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid rgba(15,23,42,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, color: '#64748b', fontWeight: 600, margin: 0 }}>Total Users</h3>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{users.length}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid rgba(15,23,42,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <Shield size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, color: '#64748b', fontWeight: 600, margin: 0 }}>Administrators</h3>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{users.filter(u => u.role === 'ADMIN').length}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid rgba(15,23,42,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Star size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, color: '#64748b', fontWeight: 600, margin: 0 }}>Active Subscriptions</h3>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{users.filter(u => u.planStatus === 'ACTIVE').length}</div>
                </div>
              </div>
            </div>
            
          </div>

          <div className="glass-card animate-fade-in-up" style={{ padding: 32, animationDelay: "0.2s" }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={20} color="#10b981" /> Registered Users
              </h2>
              <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, width: 320 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ paddingLeft: 44 }}
                  />
                </div>
              </form>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
            ) : (
              <div style={{ overflow: "auto", borderRadius: 16, border: "1px solid rgba(0, 0, 0, 0.05)", background: '#ffffff' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>ID</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Forms</th>
                      <th>Entries</th>
                      <th>Joined</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: 60, color: "#64748b", fontSize: 15 }}>
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id}>
                          <td style={{ color: "#64748b", fontWeight: 600 }}>#{u.id}</td>
                          <td>
                            <div>
                              <p style={{ fontWeight: 700, color: "#0f172a" }}>{u.name}</p>
                              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{u.email}</p>
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={() => handleRoleChange(u.id, u.role)}
                              disabled={u.id === user.id}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: u.id === user.id ? "not-allowed" : "pointer",
                                opacity: u.id === user.id ? 0.7 : 1,
                                padding: 0
                              }}
                              title={u.id === user.id ? "Cannot change own role" : "Click to toggle role"}
                            >
                              <span style={{ 
                                display: "inline-flex", 
                                alignItems: "center", 
                                gap: 6, 
                                padding: '6px 12px', 
                                borderRadius: 100, 
                                fontSize: 12, 
                                fontWeight: 700,
                                background: u.role === "ADMIN" ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                color: u.role === "ADMIN" ? '#ef4444' : '#3b82f6',
                                border: u.role === "ADMIN" ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)'
                              }}>
                                {u.role === "ADMIN" ? <Shield size={14} /> : <User size={14} />}
                                {u.role}
                              </span>
                            </button>
                          </td>
                          <td style={{ fontWeight: 600, color: '#475569' }}>{u.forms || 0}</td>
                          <td style={{ fontWeight: 600, color: '#475569' }}>{u.entries || 0}</td>
                          <td style={{ color: "#64748b", fontSize: 14 }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                              <button
                                onClick={() => openEditModal(u)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                title="Edit User & Plan"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(u.id, u.name)}
                                disabled={u.id === user.id}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: u.id === user.id ? "not-allowed" : "pointer",
                                  opacity: u.id === user.id ? 0.4 : 1,
                                  color: '#ef4444'
                                }}
                                title={u.id === user.id ? "Cannot delete yourself" : "Delete user"}
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

          {/* Edit User Modal */}
          {isEditModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 600, background: 'white', borderRadius: 24, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Edit User & Subscription
                  </h2>
                  <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleEditSubmit} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Mobile Number</label>
                    <input type="text" className="form-control" value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value})} />
                  </div>

                  <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', marginTop: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Star size={16} color="#8b5cf6" /> Subscription Management
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Assign Plan</label>
                        <select className="form-control" value={editForm.planId} onChange={e => setEditForm({...editForm, planId: e.target.value})}>
                          <option value="">No Plan</option>
                          {plans.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Plan Status</label>
                        <select className="form-control" value={editForm.planStatus} onChange={e => setEditForm({...editForm, planStatus: e.target.value})}>
                          <option value="INACTIVE">Inactive</option>
                          <option value="ACTIVE">Active</option>
                          <option value="EXPIRED">Expired</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0, marginTop: 24 }}>
                      <label className="form-label">Custom Expiry Date</label>
                      <input 
                        type="datetime-local" 
                        className="form-control" 
                        value={editForm.planExpiresAt} 
                        onChange={e => setEditForm({...editForm, planExpiresAt: e.target.value})} 
                      />
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Leave blank for lifetime access, or specify an exact end date.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={18} /> Save Changes
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
