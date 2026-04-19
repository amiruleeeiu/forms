import type { StepFormConfig } from "@/form-engine/types";
import { securityClearanceFormConfig } from "@/forms/SecurityClearanceForm/securityClearanceFormConfig";
import { db } from "@/lib/db";
import { formSubmissions } from "@/lib/db/schema";
import { getFormRegistry } from "@/lib/form-registry";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ApplicationViewClient } from "./ApplicationViewClient";

export default async function ApplicationViewPage({
  params,
}: PageProps<"/applications/[id]">) {
  const { id } = await params;

  const [row] = await db
    .select({
      id: formSubmissions.id,
      serviceName: formSubmissions.serviceName,
      status: formSubmissions.status,
      rawPayload: formSubmissions.rawPayload,
    })
    .from(formSubmissions)
    .where(eq(formSubmissions.id, id))
    .limit(1);

  if (!row || row.status !== "SUBMIT") {
    notFound();
  }

  const registry = getFormRegistry();
  const jsonConfig = Object.values(registry).find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => c.serviceName === row.serviceName,
  ) as StepFormConfig | undefined;
  const config = jsonConfig ?? (securityClearanceFormConfig as StepFormConfig);

  return (
    <ApplicationViewClient
      id={row.id}
      serviceName={row.serviceName}
      rawPayload={row.rawPayload as Record<string, unknown>}
      config={config}
    />
  );
}
