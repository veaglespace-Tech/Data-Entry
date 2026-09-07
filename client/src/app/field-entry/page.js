"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import {
  useGetMyTemplatesQuery,
  useGetFormsQuery,
  useCreateFormMutation,
  useCreateEntryMutation,
} from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import { FileText, Send, Layers } from "lucide-react";

export default function FieldEntryPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();

  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);
  const [fieldValues, setFieldValues] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { data: templatesData } = useGetMyTemplatesQuery(undefined, { skip: !user || user?.role === "ADMIN" });
  const { data: formsData, refetch: refetchForms } = useGetFormsQuery(undefined, { skip: !user || user?.role === "ADMIN" });
  const [createForm] = useCreateFormMutation();
  const [createEntry] = useCreateEntryMutation();

  const templates = templatesData?.data || [];
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && isAdmin) router.push("/dashboard");
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    setFieldValues({});
  }, [activeTemplateIndex]);

  if (authLoading || !user || isAdmin) return null;

  const currentAssignment = templates[activeTemplateIndex];
  const currentTemplate = currentAssignment?.template;

  const handleFieldEntry = async (e) => {
    e.preventDefault();
    if (!currentTemplate) return;

    const requiredFields = (currentTemplate.fields || []).filter((f) => f.required);
    for (const f of requiredFields) {
      if (!fieldValues[f.id] && !fieldValues[f.name]) {
        toast.error(`"${f.label}" is required`);
        return;
      }
    }

    setSubmitting(true);
    try {
      let formId;
      const existingForms = formsData?.data || [];
      const existingForm = existingForms.find((f) => f.title === currentTemplate.title);

      if (existingForm) {
        formId = existingForm.id;
      } else {
        const newForm = await createForm({
          title: currentTemplate.title,
          description: currentTemplate.description || "",
          fields: (currentTemplate.fields || []).map((f) => ({
            name: f.id || f.label.toLowerCase().replace(/\s+/g, "_"),
            label: f.label,
            type: f.type || "text",
            required: f.required || false,
          })),
        }).unwrap();
        formId = newForm.data.id;
        refetchForms();
      }

      const entryData = {};
      (currentTemplate.fields || []).forEach((f) => {
        const key = f.id || f.label.toLowerCase().replace(/\s+/g, "_");
        entryData[key] = fieldValues[f.id] || fieldValues[key] || "";
      });

      await createEntry({ formId, data: entryData }).unwrap();
      toast.success("Entry saved successfully!");
      setFieldValues({});
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save entry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 28px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #2563eb, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(37,99,235,0.3)" }}>
            <FileText size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Field Entry</h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Fill forms based on your assigned templates</p>
          </div>
        </div>

        {templates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "white", borderRadius: 20, border: "2px dashed #e2e8f0" }}>
            <Layers size={56} style={{ color: "#cbd5e1", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>No Forms Assigned Yet</h3>
            <p style={{ color: "#94a3b8", maxWidth: 400, margin: "0 auto" }}>
              Admin will assign field templates to your account. Check back after your account has been fully set up.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
            <div style={{ background: "white", borderRadius: 16, padding: "20px", border: "1px solid #e2e8f0", height: "fit-content" }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 12 }}>
                Your Forms ({templates.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {templates.map((assignment, idx) => (
                  <button
                    key={assignment.id}
                    onClick={() => setActiveTemplateIndex(idx)}
                    style={{
                      padding: "12px 14px", borderRadius: 10, textAlign: "left", border: "none", cursor: "pointer", transition: "all 0.2s",
                      background: activeTemplateIndex === idx ? "linear-gradient(135deg, #f43f5e, #8b5cf6)" : "#f8fafc",
                      color: activeTemplateIndex === idx ? "white" : "#0f172a",
                      boxShadow: activeTemplateIndex === idx ? "0 4px 12px rgba(244,63,94,0.25)" : "none",
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}>{assignment.template?.title}</p>
                    <p style={{ fontSize: 11, margin: 0, opacity: 0.7 }}>{assignment.template?.fields?.length || 0} fields</p>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 16, padding: "32px", border: "1px solid #e2e8f0" }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{currentTemplate?.title}</h2>
                {currentTemplate?.description && <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>{currentTemplate.description}</p>}
              </div>

              <form onSubmit={handleFieldEntry}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
                  {(currentTemplate?.fields || []).map((field) => {
                    const fieldKey = field.id || field.label;
                    return (
                      <div key={field.id}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                          {field.label}{field.required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            placeholder={field.placeholder || `Enter ${field.label}`}
                            value={fieldValues[fieldKey] || ""}
                            onChange={(e) => setFieldValues({ ...fieldValues, [fieldKey]: e.target.value })}
                            required={field.required}
                            rows={3}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }}
                          />
                        ) : (
                          <input
                            type={field.type || "text"}
                            placeholder={field.placeholder || `Enter ${field.label}`}
                            value={fieldValues[fieldKey] || ""}
                            onChange={(e) => setFieldValues({ ...fieldValues, [fieldKey]: e.target.value })}
                            required={field.required}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setFieldValues({})}
                    style={{ padding: "12px 20px", borderRadius: 12, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                  >
                    Clear
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    style={{ flex: 1, padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}
                  >
                    <Send size={16} />
                    {submitting ? "Saving..." : "Submit Entry"}
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
