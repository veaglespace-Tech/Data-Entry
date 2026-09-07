"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  useGetFieldTemplatesQuery,
  useCreateFieldTemplateMutation,
  useUpdateFieldTemplateMutation,
  useDeleteFieldTemplateMutation,
  useGetUsersQuery,
  useAssignFieldTemplateMutation,
  useUnassignFieldTemplateMutation,
  useGetFieldTemplateQuery,
} from "@/redux/api/apiSlice";
import toast from "react-hot-toast";
import {
  Layers, Plus, Edit3, Trash2, X, Save, Users,
  Check, GripVertical, Eye, UserCheck,
} from "lucide-react";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown" },
];

const emptyField = () => ({
  id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  label: "",
  placeholder: "",
  type: "text",
  required: false,
});

export default function FieldTemplatesPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();

  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'assign' | 'view'
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [fields, setFields] = useState([emptyField()]);
  const [assignTemplateId, setAssignTemplateId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [viewTemplateId, setViewTemplateId] = useState(null);

  const { data, isLoading, refetch } = useGetFieldTemplatesQuery(undefined, { skip: !user });
  const { data: usersData } = useGetUsersQuery("", { skip: !user });
  const { data: viewData } = useGetFieldTemplateQuery(viewTemplateId, { skip: !viewTemplateId });

  const [createTemplate, { isLoading: creating }] = useCreateFieldTemplateMutation();
  const [updateTemplate, { isLoading: updating }] = useUpdateFieldTemplateMutation();
  const [deleteTemplate] = useDeleteFieldTemplateMutation();
  const [assignTemplate, { isLoading: assigning }] = useAssignFieldTemplateMutation();
  const [unassignTemplate] = useUnassignFieldTemplateMutation();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) router.push("/login");
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const templates = data?.data || [];
  const users = usersData?.data?.filter((u) => u.role === "USER") || [];
  const viewTemplate = viewData?.data;

  const openCreate = () => {
    setEditingTemplate(null);
    setTemplateTitle("");
    setTemplateDesc("");
    setFields([emptyField()]);
    setModal("create");
  };

  const openEdit = (tmpl) => {
    setEditingTemplate(tmpl);
    setTemplateTitle(tmpl.title);
    setTemplateDesc(tmpl.description || "");
    setFields(Array.isArray(tmpl.fields) && tmpl.fields.length > 0 ? tmpl.fields.map((f) => ({ ...f })) : [emptyField()]);
    setModal("edit");
  };

  const addField = () => {
    if (fields.length >= 12) { toast.error("Maximum 12 fields allowed"); return; }
    setFields([...fields, emptyField()]);
  };

  const removeField = (index) => {
    if (fields.length === 1) { toast.error("At least one field required"); return; }
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index, key, value) => {
    setFields(fields.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const handleSave = async () => {
    if (!templateTitle.trim()) { toast.error("Template title is required"); return; }
    const invalidField = fields.find((f) => !f.label.trim());
    if (invalidField) { toast.error("All fields must have a label"); return; }

    try {
      const payload = { title: templateTitle.trim(), description: templateDesc.trim() || undefined, fields };
      if (modal === "create") {
        await createTemplate(payload).unwrap();
        toast.success("Field template created!");
      } else {
        await updateTemplate({ id: editingTemplate.id, ...payload }).unwrap();
        toast.success("Template updated!");
      }
      setModal(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (tmpl) => {
    if (!confirm(`Delete template "${tmpl.title}"? All assignments will also be removed.`)) return;
    try {
      await deleteTemplate(tmpl.id).unwrap();
      toast.success("Template deleted");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) { toast.error("Please select a user"); return; }
    try {
      await assignTemplate({ userId: parseInt(selectedUserId), templateId: assignTemplateId }).unwrap();
      toast.success("Template assigned!");
      setSelectedUserId("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Assignment failed");
    }
  };

  const handleUnassign = async (userId, templateId) => {
    try {
      await unassignTemplate({ userId, templateId }).unwrap();
      toast.success("Template unassigned");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 28px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #f43f5e, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(244,63,94,0.3)" }}>
              <Layers size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Field Templates</h1>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Create and assign field sets for user data entry</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            style={{ padding: "11px 24px", borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}
          >
            <Plus size={18} /> New Template
          </button>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading templates...</div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, background: "white", borderRadius: 20, border: "2px dashed #e2e8f0" }}>
            <Layers size={56} style={{ color: "#cbd5e1", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#64748b" }}>No templates yet</h3>
            <p style={{ color: "#94a3b8", marginBottom: 24 }}>Create your first field template to assign to users.</p>
            <button onClick={openCreate} style={{ padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Create First Template
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {templates.map((tmpl) => (
              <div key={tmpl.id} style={{ background: "white", borderRadius: 16, padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {/* Template Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{tmpl.title}</h3>
                    {tmpl.description && <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{tmpl.description}</p>}
                  </div>
                </div>

                {/* Fields Preview */}
                <div style={{ marginBottom: 16 }}>
                  {(Array.isArray(tmpl.fields) ? tmpl.fields : []).slice(0, 4).map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{f.label}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>{f.type}</span>
                      {f.required && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>*</span>}
                    </div>
                  ))}
                  {tmpl.fields?.length > 4 && (
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "8px 0 0", textAlign: "center" }}>+{tmpl.fields.length - 4} more fields</p>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#eff6ff", color: "#2563eb", fontWeight: 600 }}>
                    {tmpl.fields?.length || 0} fields
                  </span>
                  <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#f0fdf4", color: "#166534", fontWeight: 600 }}>
                    {tmpl._count?.assignments || 0} users assigned
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setViewTemplateId(tmpl.id); setModal("view"); }}
                    style={{ flex: 1, padding: "9px", borderRadius: 10, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => openEdit(tmpl)}
                    style={{ flex: 1, padding: "9px", borderRadius: 10, background: "#eff6ff", color: "#2563eb", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => { setAssignTemplateId(tmpl.id); setModal("assign"); }}
                    style={{ flex: 1, padding: "9px", borderRadius: 10, background: "#f0fdf4", color: "#166534", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <UserCheck size={14} /> Assign
                  </button>
                  <button
                    onClick={() => handleDelete(tmpl)}
                    style={{ padding: "9px 12px", borderRadius: 10, background: "#fff1f2", color: "#e11d48", border: "none", fontSize: 13, cursor: "pointer" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "36px", width: "100%", maxWidth: 640, boxShadow: "0 24px 48px rgba(0,0,0,0.15)", margin: "20px auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {modal === "create" ? "Create Field Template" : "Edit Template"}
              </h2>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Template Title *</label>
              <input
                type="text" value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="e.g. Education Form, Employee Details..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Description (Optional)</label>
              <input
                type="text" value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)}
                placeholder="Brief description of this template..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Fields */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  Fields * ({fields.length}/12)
                </label>
                <button
                  onClick={addField} disabled={fields.length >= 12}
                  style={{ padding: "6px 14px", borderRadius: 8, background: fields.length >= 12 ? "#f1f5f9" : "#eff6ff", color: fields.length >= 12 ? "#94a3b8" : "#2563eb", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Plus size={13} /> Add Field
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
                {fields.map((field, index) => (
                  <div key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", gap: 8, alignItems: "center", background: "#f8fafc", borderRadius: 10, padding: "10px 12px", border: "1px solid #e2e8f0" }}>
                    {/* Label */}
                    <input
                      type="text" placeholder={`Field ${index + 1} label`}
                      value={field.label} onChange={(e) => updateField(index, "label", e.target.value)}
                      style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }}
                    />
                    {/* Placeholder */}
                    <input
                      type="text" placeholder="Placeholder text"
                      value={field.placeholder} onChange={(e) => updateField(index, "placeholder", e.target.value)}
                      style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }}
                    />
                    {/* Type */}
                    <select
                      value={field.type} onChange={(e) => updateField(index, "type", e.target.value)}
                      style={{ padding: "7px 8px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none" }}
                    >
                      {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {/* Required toggle */}
                    <button
                      onClick={() => updateField(index, "required", !field.required)}
                      title={field.required ? "Required" : "Optional"}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer", background: field.required ? "#dcfce7" : "#f1f5f9", color: field.required ? "#166534" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}
                    >
                      {field.required ? <Check size={14} /> : "*"}
                    </button>
                    {/* Remove */}
                    <button
                      onClick={() => removeField(index)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer", background: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button
                onClick={handleSave} disabled={creating || updating}
                style={{ flex: 2, padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Save size={16} />
                {creating || updating ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {modal === "assign" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "36px", width: "100%", maxWidth: 460, boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Assign Template to User</h2>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 8 }}>Select User</label>
              <select
                value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", marginBottom: 20 }}
              >
                <option value="">— Choose a user —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button
                onClick={handleAssign} disabled={assigning || !selectedUserId}
                style={{ flex: 2, padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #10b981, #059669)", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <UserCheck size={16} />
                {assigning ? "Assigning..." : "Assign Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === "view" && viewTemplate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "36px", width: "100%", maxWidth: 560, boxShadow: "0 24px 48px rgba(0,0,0,0.15)", margin: "20px auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>{viewTemplate.title}</h2>
              <button onClick={() => { setModal(null); setViewTemplateId(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
            </div>

            {viewTemplate.description && <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>{viewTemplate.description}</p>}

            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 12 }}>Fields ({viewTemplate.fields?.length || 0})</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {(viewTemplate.fields || []).map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{f.label}</span>
                    {f.placeholder && <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>"{f.placeholder}"</span>}
                  </div>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "#e2e8f0", color: "#475569" }}>{f.type}</span>
                  {f.required && <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>Required</span>}
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 12 }}>Assigned Users ({viewTemplate.assignments?.length || 0})</h4>
            {viewTemplate.assignments?.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>No users assigned yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {viewTemplate.assignments?.map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #f43f5e, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 800 }}>
                      {a.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 }}>{a.user.name}</p>
                      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{a.user.email}</p>
                    </div>
                    <button
                      onClick={() => handleUnassign(a.user.id, viewTemplate.id)}
                      style={{ padding: "5px 10px", borderRadius: 8, background: "#fff1f2", color: "#e11d48", border: "none", fontSize: 12, cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
