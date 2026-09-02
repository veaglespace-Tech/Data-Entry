"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import { useGetFormsQuery, useDeleteFormMutation } from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import { FileText, Plus, Database, Trash2, Edit, Eye, Calendar } from "lucide-react";

export default function FormsListPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();
  const { data, isLoading } = useGetFormsQuery(undefined, { skip: !user });
  const [deleteFormMutation] = useDeleteFormMutation();
  
  const forms = data?.data || [];
  const loading = authLoading || isLoading;

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ADMIN" && user.planStatus !== "ACTIVE") {
        router.push("/subscription");
      }
    }
  }, [user, authLoading, router]);

  const deleteForm = async (id) => {
    if (!confirm("Are you sure you want to delete this form and all its entries?")) return;
    try {
      await deleteFormMutation(id).unwrap();
      toast.success("Form deleted");
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete form");
    }
  };

  if (authLoading || !user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxHeight: "100vh" }}>
          {/* Header */}
          <div
            className="animate-fade-in-up"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 40,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: '-0.02em' }}>
                My Forms
              </h1>
              <p style={{ color: "#64748b", fontSize: 16, marginTop: 6 }}>
                Manage your custom data entry forms
              </p>
            </div>
            <Link href="/forms/new" className="btn-primary">
              <Plus size={18} />
              Create Form
            </Link>
          </div>

          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 24,
              }}
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 220, borderRadius: 20 }} />
              ))}
            </div>
          ) : forms.length === 0 ? (
            <div
              className="glass-card animate-fade-in-up"
              style={{
                padding: 60,
                textAlign: "center",
              }}
            >
              <div style={{ width: 80, height: 80, borderRadius: 24, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid #bfdbfe' }}>
                <FileText size={40} style={{ color: "#2563eb" }} />
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 12,
                }}
              >
                No Forms Yet
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: 16,
                  marginBottom: 32,
                  maxWidth: 400,
                  margin: '0 auto 32px'
                }}
              >
                Create your first custom form to start collecting and analyzing data instantly.
              </p>
              <Link href="/forms/new" className="btn-primary">
                <Plus size={18} /> Create Your First Form
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 24,
              }}
            >
              {forms.map((form, index) => (
                <div
                  key={form.id}
                  className="glass-card animate-fade-in-up"
                  style={{
                    padding: 32,
                    display: "flex",
                    flexDirection: "column",
                    animationDelay: `${index * 0.08}s`,
                  }}
                >
                  {/* Form header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: `linear-gradient(135deg, ${
                          ["#2563eb", "#14b8a6", "#f97316", "#8b5cf6"][index % 4]
                        }, ${
                          ["#3b82f6", "#2dd4bf", "#fb923c", "#a78bfa"][index % 4]
                        })`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 4px 15px ${
                          ["rgba(37, 99, 235, 0.3)", "rgba(20, 184, 166, 0.3)", "rgba(249, 115, 22, 0.3)", "rgba(139, 92, 246, 0.3)"][index % 4]
                        }`
                      }}
                    >
                      <FileText size={24} color="white" />
                    </div>
                    <span className="badge badge-primary" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                      <Database size={14} style={{ marginRight: 6 }} />
                      {form._count?.entries || 0} entries
                    </span>
                  </div>

                  {/* Form info */}
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#0f172a",
                      marginBottom: 8,
                    }}
                  >
                    {form.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#64748b",
                      marginBottom: 24,
                      lineHeight: 1.6,
                      flex: 1,
                    }}
                  >
                    {form.description || "No description"}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 24,
                      fontSize: 13,
                      color: "#94a3b8",
                      fontWeight: 500
                    }}
                  >
                    <Calendar size={14} />
                    Created {new Date(form.createdAt).toLocaleDateString()}
                    <span style={{ margin: "0 4px" }}>•</span>
                    {Array.isArray(form.fields) ? form.fields.length : 0} fields
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      borderTop: "1px solid rgba(0, 0, 0, 0.05)",
                      paddingTop: 24,
                    }}
                  >
                    <Link
                      href={`/forms/${form.id}`}
                      className="btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <Eye size={16} /> View
                    </Link>
                    <Link
                      href={`/forms/${form.id}/edit`}
                      className="btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <Edit size={16} /> Edit
                    </Link>
                    <button
                      onClick={() => deleteForm(form.id)}
                      className="btn-danger btn-sm"
                      style={{ padding: '8px 12px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}
