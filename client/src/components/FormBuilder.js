"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "textarea", label: "Text Area" },
];

export default function FormBuilder({ fields, setFields }) {
  const addField = () => {
    const newField = {
      id: Date.now(),
      name: `field_${fields.length + 1}`,
      label: "",
      type: "text",
      required: false,
      options: "",
    };
    setFields([...fields, newField]);
  };

  const removeField = (id) => {
    if (fields.length === 1) return;
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id, key, value) => {
    setFields(
      fields.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, [key]: value };
        // Auto-generate name from label
        if (key === "label") {
          updated.name = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "");
        }
        return updated;
      })
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="animate-fade-in-up"
          style={{
            background: "rgba(15, 11, 46, 0.4)",
            border: "1px solid rgba(99, 102, 241, 0.1)",
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            animationDelay: `${index * 0.05}s`,
          }}
        >
          {/* Field header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GripVertical size={16} style={{ color: "#475569" }} />
              <span
                className="badge badge-primary"
                style={{ fontSize: 11 }}
              >
                Field {index + 1}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeField(field.id)}
              style={{
                background: "none",
                border: "none",
                color: fields.length === 1 ? "#334155" : "#f87171",
                cursor: fields.length === 1 ? "not-allowed" : "pointer",
                padding: 4,
                borderRadius: 6,
                display: "flex",
                transition: "all 0.2s ease",
              }}
              disabled={fields.length === 1}
              title={fields.length === 1 ? "At least one field required" : "Remove field"}
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Field inputs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <label className="form-label">Field Label *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Full Name"
                value={field.label}
                onChange={(e) => updateField(field.id, "label", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Field Type</label>
              <select
                className="form-select"
                value={field.type}
                onChange={(e) => updateField(field.id, "type", e.target.value)}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Options for select type */}
          {field.type === "select" && (
            <div>
              <label className="form-label">Options (comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Option 1, Option 2, Option 3"
                value={field.options}
                onChange={(e) =>
                  updateField(field.id, "options", e.target.value)
                }
              />
            </div>
          )}

          {/* Required toggle */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: 13,
              color: "#94a3b8",
            }}
          >
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) =>
                updateField(field.id, "required", e.target.checked)
              }
              style={{
                accentColor: "#6366f1",
                width: 16,
                height: 16,
              }}
            />
            Required field
          </label>

          {/* Generated field name */}
          {field.name && (
            <p style={{ fontSize: 11, color: "#475569" }}>
              Field key: <code style={{ color: "#818cf8" }}>{field.name}</code>
            </p>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addField}
        className="btn-secondary"
        style={{
          justifyContent: "center",
          padding: "14px 24px",
          borderStyle: "dashed",
        }}
      >
        <Plus size={18} />
        Add Field
      </button>
    </div>
  );
}
