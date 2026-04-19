import { SecurityClearanceForm } from "@/forms/SecurityClearanceForm/SecurityClearanceForm";
import { db } from "@/lib/db";
import { formSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function SecurityClearancePage({
  searchParams,
}: PageProps<"/security-clearance">) {
  const { edit: editId } = await searchParams;
  const resolvedEditId = Array.isArray(editId) ? editId[0] : editId;

  let initialValues: Record<string, unknown> | undefined;

  if (resolvedEditId) {
    const [row] = await db
      .select({
        rawPayload: formSubmissions.rawPayload,
        status: formSubmissions.status,
      })
      .from(formSubmissions)
      .where(eq(formSubmissions.id, resolvedEditId))
      .limit(1);

    if (row?.status === "DRAFT") {
      initialValues = row.rawPayload as Record<string, unknown>;
    }
  }

  console.log(initialValues);

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <main className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <Link
            href="/applications"
            className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← My Applications
          </Link>
          <p className="text-sm text-muted-foreground">
            Please provide your information for security clearance
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight uppercase">
            {resolvedEditId
              ? "Edit Application"
              : "Application for Security Clearance"}
          </h1>
        </div>
        <SecurityClearanceForm
          editId={resolvedEditId}
          initialValues={initialValues}
        />
      </main>
    </div>
  );
}
