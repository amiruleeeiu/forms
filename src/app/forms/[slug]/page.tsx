import { db } from "@/lib/db";
import { formSubmissions } from "@/lib/db/schema";
import { getFormRegistry } from "@/lib/form-registry";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormClient } from "./FormClient";

export default async function JsonFormPage({
  params,
  searchParams,
}: PageProps<"/forms/[slug]">) {
  const { slug } = await params;
  const { edit: editId } = await searchParams;
  const resolvedEditId = Array.isArray(editId) ? editId[0] : editId;

  const config = getFormRegistry()[slug];
  if (!config) notFound();

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
            Please provide your information
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight uppercase">
            {resolvedEditId ? "Edit Application" : config.title}
          </h1>
        </div>
        <FormClient
          config={config}
          editId={resolvedEditId}
          initialValues={initialValues}
        />
      </main>
    </div>
  );
}
