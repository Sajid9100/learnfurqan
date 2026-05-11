"use client";

import { useEffect, useState } from "react";
import { Check, X, Eye } from "lucide-react";
import type { TeacherApplication } from "@/lib/types";
import { Modal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";

export function ApplicationsClient() {
  const [apps, setApps] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<TeacherApplication | null>(null);
  const toast = useToast();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/applications", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setApps(data.applications ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function decide(
    a: TeacherApplication,
    status: TeacherApplication["status"]
  ) {
    setBusyId(a.id);
    try {
      const res = await fetch(`/api/admin/applications/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      setApps((prev) =>
        prev.map((row) =>
          row.id === a.id ? (data.application as TeacherApplication) : row
        )
      );
      toast.success(
        status === "approved"
          ? "Approved — welcome email sent"
          : "Rejected — email sent"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
      {loading ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Loading applications…
        </div>
      ) : apps.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No applications yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apps.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {a.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                  <td className="px-4 py-3 text-foreground">{a.country}</td>
                  <td className="px-4 py-3 text-foreground">{a.subject}</td>
                  <td className="px-4 py-3 text-foreground">
                    {a.experience_years} yrs
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(a.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewing(a)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                      {a.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => decide(a, "approved")}
                          disabled={busyId === a.id}
                          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      )}
                      {a.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => decide(a, "rejected")}
                          disabled={busyId === a.id}
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Application details"
        size="lg"
      >
        {viewing && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Name" value={viewing.name} />
            <DetailRow label="Email" value={viewing.email} />
            <DetailRow label="Phone" value={viewing.phone} />
            <DetailRow label="Country" value={viewing.country} />
            <DetailRow label="Subject" value={viewing.subject} />
            <DetailRow
              label="Experience"
              value={`${viewing.experience_years} years`}
            />
            <DetailRow label="Languages" value={viewing.languages} />
            <DetailRow label="Availability" value={viewing.availability} />
            <DetailRow
              label="Certifications"
              value={viewing.certifications}
            />
            {viewing.demo_video_url && (
              <DetailRow
                label="Demo video"
                value={
                  <a
                    href={viewing.demo_video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    {viewing.demo_video_url}
                  </a>
                }
              />
            )}
            {viewing.message && (
              <DetailRow label="Message" value={viewing.message} />
            )}
            <DetailRow
              label="Submitted"
              value={new Date(viewing.created_at).toLocaleString()}
            />
            <DetailRow
              label="Status"
              value={<StatusBadge status={viewing.status} />}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-2 last:border-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="w-40 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-foreground">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: TeacherApplication["status"] }) {
  const styles: Record<TeacherApplication["status"], string> = {
    pending: "bg-accent/15 text-accent-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
