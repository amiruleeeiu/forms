import { db } from "@/lib/db";
import { formSubmissions } from "@/lib/db/schema";
import { format } from "date-fns";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function ApplicationsPage() {
  const submissions = await db
    .select({
      id: formSubmissions.id,
      serviceName: formSubmissions.serviceName,
      stakeholderCode: formSubmissions.stakeholderCode,
      status: formSubmissions.status,
      createdAt: formSubmissions.createdAt,
      updatedAt: formSubmissions.updatedAt,
    })
    .from(formSubmissions)
    .orderBy(desc(formSubmissions.updatedAt));

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-12">
      <main className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-1 inline-block text-sm text-muted-foreground hover:text-foreground"
            >
              ← Home
            </Link>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#150004] uppercase">
              My Applications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {submissions.length} application
              {submissions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/security-clearance"
            className="inline-flex h-auto items-center rounded-[8px] bg-[#a50022] px-6 py-3 text-base font-semibold capitalize text-white shadow-[0px_2px_4px_0px_rgba(165,0,34,0.08),0px_3px_6px_0px_rgba(165,0,34,0.2)] hover:bg-[#8e001d]"
          >
            + New Application
          </Link>
        </div>

        {/* Empty state */}
        {submissions.length === 0 ? (
          <div className="rounded-xl border bg-white p-16 text-center">
            <p className="text-base text-muted-foreground">
              No applications yet.
            </p>
            <Link
              href="/security-clearance"
              className="mt-4 inline-block text-sm font-semibold text-[#a50022] hover:underline"
            >
              Submit your first application →
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1.4fr_140px_160px_120px] gap-4 border-b bg-[#f7f7f8] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#150004]">
              <span>Application ID</span>
              <span>Service</span>
              <span>Status</span>
              <span>Last Updated</span>
              <span className="text-right">Action</span>
            </div>

            {/* Rows */}
            {submissions.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[1fr_1.4fr_140px_160px_120px] items-center gap-4 border-b px-6 py-4 text-sm last:border-b-0 hover:bg-[#fafafa]"
              >
                {/* ID */}
                <span className="font-mono text-xs text-muted-foreground">
                  {s.id.slice(0, 8).toUpperCase()}
                  <span className="opacity-40">···</span>
                </span>

                {/* Service */}
                <span className="truncate font-medium capitalize text-[#150004]">
                  {s.serviceName.replace(/-/g, " ")}
                </span>

                {/* Status badge */}
                <StatusBadge status={s.status} />

                {/* Date */}
                <span className="text-muted-foreground">
                  {format(new Date(s.updatedAt), "dd MMM yyyy, HH:mm")}
                </span>

                {/* Actions */}
                <div className="flex justify-end">
                  {s.status === "DRAFT" ? (
                    <Link
                      href={`/security-clearance?edit=${s.id}`}
                      className="rounded-[8px] border border-[#150004] bg-white px-4 py-2 text-xs font-semibold text-[#150004] hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                  ) : (
                    <span className="px-4 py-2 text-xs text-muted-foreground">
                      —
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "DRAFT") {
    return (
      <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
      Submitted
    </span>
  );
}
