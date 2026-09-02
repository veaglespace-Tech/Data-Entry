"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import { 
  useGetFormQuery, 
  useGetFormEntriesQuery, 
  useCreateEntryMutation, 
  useUpdateEntryMutation, 
  useDeleteEntryMutation 
} from "@/redux/api/apiSlice";
import Sidebar from "@/components/Sidebar";
import DataTable from "@/components/DataTable";
import EntryModal from "@/components/EntryModal";
import ExportButton from "@/components/ExportButton";
import toast from "react-hot-toast";
import { ArrowLeft, Edit, FileText } from "lucide-react";

export default function FormDetailPage({ params }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;
  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: formData, isLoading: formLoading, isError: formError } = useGetFormQuery(formId, { skip: !user });
  const { data: entriesData, isLoading: entriesLoading } = useGetFormEntriesQuery(
    { formId, page, search }, 
    { skip: !user || !formId }
  );
  
  const [createEntry] = useCreateEntryMutation();
  const [updateEntry] = useUpdateEntryMutation();
  const [deleteEntry] = useDeleteEntryMutation();

  const form = formData?.data;
  const entries = entriesData?.data || [];
  const pagination = entriesData?.pagination || null;
  const loading = authLoading || formLoading || entriesLoading;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

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
    }
  }, [formError, router]);

  const handleAdd = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleDelete = async (entryId) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteEntry({ formId, entryId }).unwrap();
      toast.success("Entry deleted");
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const handleSubmitEntry = async (data) => {
    try {
      if (editingEntry) {
        await updateEntry({ formId, entryId: editingEntry.id, data }).unwrap();
        toast.success("Entry updated");
      } else {
        await createEntry({ formId, data }).unwrap();
        toast.success("Entry created");
      }
      setModalOpen(false);
      setEditingEntry(null);
    } catch (error) {
      toast.error(error.data?.message || "Failed to save entry");
    }
  };

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (authLoading || !user) return null;

  const columns = form
    ? form.fields.map((f) => ({
        key: f.name,
        label: f.label,
      }))
    : [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxHeight: "100vh" }}>
          {loading || !form ? (
            <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
          ) : (
            <>
              {/* Header */}
              <div
                className="animate-fade-in-up"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 32,
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div>
                  <Link
                    href="/forms"
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
                    <ArrowLeft size={14} /> Back to Forms
                  </Link>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <FileText size={28} style={{ color: "#818cf8" }} />
                    {form.title}
                  </h1>
                  {form.description && (
                    <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
                      {form.description}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <span className="badge badge-primary">
                      {form.fields?.length || 0} fields
                    </span>
                    <span className="badge badge-success">
                      {form._count?.entries || 0} entries
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <ExportButton formId={form.id} formTitle={form.title} />
                  <Link
                    href={`/forms/${form.id}/edit`}
                    className="btn-secondary btn-sm"
                  >
                    <Edit size={14} /> Edit Form
                  </Link>
                </div>
              </div>

              {/* Data Table */}
              <div
                className="glass-card animate-fade-in-up"
                style={{ padding: 24, animationDelay: "0.1s" }}
              >
                <DataTable
                  columns={columns}
                  data={entries}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onSearch={handleSearch}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAdd={handleAdd}
                  searchValue={search}
                />
              </div>

              {/* Entry Modal */}
              <EntryModal
                isOpen={modalOpen}
                onClose={() => {
                  setModalOpen(false);
                  setEditingEntry(null);
                }}
                onSubmit={handleSubmitEntry}
                fields={form.fields || []}
                entry={editingEntry}
              />
            </>
          )}
      </main>
    </div>
  );
}
