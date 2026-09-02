"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading, selectIsAdmin } from "@/redux/slice/authSlice";
import { useGetAdminFormsQuery, useDeleteAdminFormMutation } from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import { FileText, Search, Trash2, Shield, Eye, Database } from "lucide-react";
import Link from "next/link";

export default function AdminFormsPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, refetch } = useGetAdminFormsQuery(search, { skip: !isAdmin });
  const [deleteFormMutation] = useDeleteAdminFormMutation();

  const forms = data?.data || [];
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

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete form "${title}" and ALL its entries across the system? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteFormMutation(id).unwrap();
      toast.success("Form deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete form");
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxHeight: "100vh" }}>
          {/* Header */}
          <div className="animate-fade-in-up" style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 16, letterSpacing: '-0.02em' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                <Shield size={24} color="white" />
              </div>
              System Forms
            </h1>
            <p style={{ color: "#64748b", fontSize: 16, marginTop: 12 }}>
              Monitor and moderate all forms created across the platform.
            </p>
          </div>

          <div className="glass-card animate-fade-in-up" style={{ padding: 32, animationDelay: "0.1s" }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} color="#10b981" /> Global Forms Directory
              </h2>
              <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, width: 320 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search title or owner..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ paddingLeft: 44 }}
                  />
                </div>
              </form>
            </div>

            {/* Forms Table */}
            {loading ? (
              <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
            ) : (
              <div style={{ overflow: "auto", borderRadius: 16, border: "1px solid rgba(0, 0, 0, 0.05)", background: '#ffffff' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>ID</th>
                      <th>Form Details</th>
                      <th>Owner</th>
                      <th>Fields</th>
                      <th>Entries</th>
                      <th>Created</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: 60, color: "#64748b", fontSize: 15 }}>
                          No forms found.
                        </td>
                      </tr>
                    ) : (
                      forms.map((f) => {
                        const fieldCount = f.fields && Array.isArray(f.fields) ? f.fields.length : 0;
                        const entryCount = f._count?.entries || 0;
                        
                        return (
                          <tr key={f.id}>
                            <td style={{ color: "#64748b", fontWeight: 600 }}>#{f.id}</td>
                            <td>
                              <div>
                                <p style={{ fontWeight: 700, color: "#0f172a" }}>{f.title}</p>
                                {f.description && <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{f.description}</p>}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: 12, fontWeight: 700 }}>
                                  {f.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{f.user.name}</p>
                                  <p style={{ fontSize: 12, color: "#64748b" }}>{f.user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontWeight: 600, color: '#475569' }}>{fieldCount}</td>
                            <td>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 6, 
                                padding: '4px 10px', 
                                borderRadius: 100, 
                                background: 'rgba(16,185,129,0.1)', 
                                color: '#10b981', 
                                fontSize: 13, 
                                fontWeight: 700 
                              }}>
                                <Database size={14} />
                                {entryCount}
                              </span>
                            </td>
                            <td style={{ color: "#64748b", fontSize: 14 }}>
                              {new Date(f.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                                <Link
                                  href={`/forms/${f.id}`}
                                  className="btn-secondary"
                                  style={{ padding: "8px 12px" }}
                                  title="View Form"
                                >
                                  <Eye size={16} />
                                </Link>
                                <button
                                  onClick={() => handleDelete(f.id, f.title)}
                                  className="btn-danger"
                                  style={{ padding: "8px 12px" }}
                                  title="Delete globally"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
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
