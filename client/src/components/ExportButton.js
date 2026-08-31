"use client";

import { Download } from "lucide-react";
import toast from "react-hot-toast";

export default function ExportButton({ formId, formTitle }) {
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/forms/${formId}/entries-export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formTitle.replace(/[^a-z0-9]/gi, "_")}_entries.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("CSV exported successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to export");
    }
  };

  return (
    <button onClick={handleExport} className="btn-secondary btn-sm">
      <Download size={14} />
      Export CSV
    </button>
  );
}
