"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

export default function EntryModal({ isOpen, onClose, onSubmit, fields, entry }) {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!entry;

  useEffect(() => {
    if (entry) {
      setFormData(entry.data || {});
    } else {
      // Initialize empty form data
      const initial = {};
      fields.forEach((f) => {
        initial[f.name] = "";
      });
      setFormData(initial);
    }
  }, [entry, fields]);

  if (!isOpen) return null;

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || "";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            className="form-input"
            rows={3}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label}`}
            required={field.required}
            style={{ resize: "vertical", minHeight: 80 }}
          />
        );

      case "select":
        const options = (field.options || "")
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);
        return (
          <select
            className="form-select"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type={field.type || "text"}
            className="form-input"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label}`}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#f1f5f9",
            }}
          >
            {isEditing ? "Edit Entry" : "Add New Entry"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(99, 102, 241, 0.1)",
              border: "none",
              borderRadius: 8,
              padding: 6,
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              transition: "all 0.2s",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {fields.map((field) => (
              <div key={field.name}>
                <label className="form-label">
                  {field.label}
                  {field.required && (
                    <span style={{ color: "#f87171", marginLeft: 4 }}>*</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 24,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ opacity: submitting ? 0.7 : 1 }}
            >
              <Save size={16} />
              {submitting
                ? "Saving..."
                : isEditing
                ? "Update Entry"
                : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
