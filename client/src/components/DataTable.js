"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Edit, Trash2, Plus } from "lucide-react";

export default function DataTable({
  columns,
  data,
  pagination,
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  onAdd,
  searchValue,
}) {
  const [localSearch, setLocalSearch] = useState(searchValue || "");

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(localSearch);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex gap-2 w-full sm:max-w-[400px]"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search entries..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
          <button type="submit" className="btn-primary btn-sm">
            Search
          </button>
        </form>

        {/* Add button */}
        {onAdd && (
          <button onClick={onAdd} className="btn-primary">
            <Plus size={16} />
            Add Entry
          </button>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          overflow: "auto",
          borderRadius: 14,
          border: "1px solid var(--surface-border)",
        }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>#</th>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th style={{ width: 120, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  style={{
                    textAlign: "center",
                    padding: 48,
                    color: "var(--text-muted)",
                    fontSize: 14,
                  }}
                >
                  No entries found. Add your first entry!
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {pagination
                      ? (pagination.page - 1) * pagination.limit + index + 1
                      : index + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {row.data?.[col.key] !== undefined
                        ? String(row.data[col.key])
                        : "—"}
                    </td>
                  ))}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => onEdit(row)}
                        style={{
                          background: "rgba(139, 92, 246, 0.1)",
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                          borderRadius: 8,
                          padding: "6px 8px",
                          cursor: "pointer",
                          color: "#8b5cf6",
                          display: "flex",
                          transition: "all 0.2s",
                        }}
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          borderRadius: 8,
                          padding: "6px 8px",
                          cursor: "pointer",
                          color: "#f87171",
                          display: "flex",
                          transition: "all 0.2s",
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Showing{" "}
            <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
              {pagination.total}
            </span>{" "}
            entries
          </p>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-secondary btn-sm"
              style={{
                opacity: pagination.page <= 1 ? 0.4 : 1,
                cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1
              )
              .map((p, i, arr) => (
                <span key={p} style={{ display: "flex", gap: 6 }}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span
                      style={{
                        padding: "6px 4px",
                        color: "var(--text-muted)",
                        fontSize: 13,
                      }}
                    >
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => onPageChange(p)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border:
                        p === pagination.page
                          ? "1px solid rgba(139, 92, 246, 0.4)"
                          : "1px solid var(--surface-border)",
                      background:
                        p === pagination.page
                          ? "linear-gradient(135deg, #f43f5e, #8b5cf6)"
                          : "#ffffff",
                      color: p === pagination.page ? "#fff" : "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: p === pagination.page ? 700 : 500,
                      transition: "all 0.2s",
                    }}
                  >
                    {p}
                  </button>
                </span>
              ))}

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="btn-secondary btn-sm"
              style={{
                opacity: pagination.page >= pagination.totalPages ? 0.4 : 1,
                cursor:
                  pagination.page >= pagination.totalPages
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
