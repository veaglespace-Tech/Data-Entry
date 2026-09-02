"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import { useCreateFormMutation } from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import FormBuilder from "@/components/FormBuilder";
import toast from "react-hot-toast";
import { Save, FileText } from "lucide-react";

export default function NewFormPage() {
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();
  const [createForm, { isLoading: submitting }] = useCreateFormMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([
    {
      id: Date.now(),
      name: "",
      label: "",
      type: "text",
      required: false,
      options: "",
    },
  ]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ADMIN" && user.planStatus !== "ACTIVE") {
        router.push("/subscription");
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a form title");
      return;
    }

    // Validate fields
    const validFields = fields.filter((f) => f.label.trim());
    if (validFields.length === 0) {
      toast.error("Please add at least one field with a label");
      return;
    }

    // Check for duplicate field names
    const names = validFields.map((f) => f.name);
    if (new Set(names).size !== names.length) {
      toast.error("Field labels must be unique");
      return;
    }

    try {
      const payload = {
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

      await createForm(payload).unwrap();
      toast.success("Form created successfully!");
      router.push("/forms");
    } catch (error) {
      toast.error(error.data?.message || "Failed to create form");
    }
  };

  if (authLoading || !user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxHeight: "100vh" }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Header */}
          <div className="animate-fade-in-up" style={{ marginBottom: 40 }}>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: 16,
                letterSpacing: '-0.02em'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)' }}>
                <FileText size={24} color="white" />
              </div>
              Create New Form
            </h1>
            <p style={{ color: "#64748b", fontSize: 16, marginTop: 12 }}>
              Define your form fields and start collecting data
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Form Details */}
            <div
              className="glass-card animate-fade-in-up"
              style={{ padding: 40, marginBottom: 32, animationDelay: "0.1s" }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 24,
                }}
              >
                Form Details
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
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
                    rows={4}
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
              style={{ padding: 40, marginBottom: 32, animationDelay: "0.2s" }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 24,
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
                gap: 16,
                justifyContent: "flex-end",
                animationDelay: "0.3s",
                marginBottom: 80
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={() => router.push("/forms")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{
                  opacity: submitting ? 0.7 : 1,
                  padding: "14px 36px",
                  fontSize: 16
                }}
              >
                <Save size={20} />
                {submitting ? "Creating..." : "Create Form"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
