"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import { useGetFormQuery, useUpdateFormMutation } from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import FormBuilder from "@/components/FormBuilder";
import toast from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditFormPage({ params }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);

  const { data: formData, isLoading: formLoading, isError: formError } = useGetFormQuery(formId, { skip: !user });
  const [updateForm, { isLoading: submitting }] = useUpdateFormMutation();

  const loading = authLoading || formLoading;

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ADMIN" && user.planStatus !== "ACTIVE") {
        router.push("/subscription");
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (formError) {
      toast.error("Form not found");
      router.push("/forms");
    } else if (formData?.data) {
      const form = formData.data;
      setTitle(form.title);
      setDescription(form.description || "");
      setFields(
        form.fields.map((f, i) => ({
          ...f,
          id: Date.now() + i,
          options: f.options || "",
        }))
      );
    }
  }, [formData, formError, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a form title");
      return;
    }

    const validFields = fields.filter((f) => f.label.trim());
    if (validFields.length === 0) {
      toast.error("Please add at least one field with a label");
      return;
    }

    try {
      const payload = {
        id: formId,
        title: title.trim(),
        description: description.trim(),
        fields: validFields.map((f) => ({
          name: f.name,
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.type === "select" ? f.options : "",
        })),
      };

      await updateForm(payload).unwrap();
      toast.success("Form updated successfully!");
      router.push(`/forms/${formId}`);
    } catch (error) {
      toast.error(error.data?.message || "Failed to update form");
    }
  };

  if (authLoading || !user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxHeight: "100vh" }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {loading ? (
            <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
          ) : (
            <>
              {/* Header */}
              <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
                <Link
                  href={`/forms/${formId}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "#818cf8",
                    textDecoration: "none",
                    marginBottom: 12,
                  }}
                >
                  <ArrowLeft size={14} /> Back to Form
                </Link>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
                  Edit Form
                </h1>
                <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
                  Update your form fields and settings
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Form Details */}
                <div
                  className="glass-card animate-fade-in-up"
                  style={{ padding: 28, marginBottom: 24, animationDelay: "0.1s" }}
                >
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 20,
                    }}
                  >
                    Form Details
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label className="form-label">Form Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Employee Registration Form"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Describe what this form is for..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ resize: "vertical" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div
                  className="glass-card animate-fade-in-up"
                  style={{ padding: 28, marginBottom: 24, animationDelay: "0.2s" }}
                >
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 20,
                    }}
                  >
                    Form Fields
                  </h2>
                  <FormBuilder fields={fields} setFields={setFields} />
                </div>

                {/* Submit */}
                <div
                  className="animate-fade-in-up"
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "flex-end",
                    animationDelay: "0.3s",
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => router.push(`/forms/${formId}`)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                    style={{
                      opacity: submitting ? 0.7 : 1,
                      padding: "12px 32px",
                    }}
                  >
                    <Save size={18} />
                    {submitting ? "Updating..." : "Update Form"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
