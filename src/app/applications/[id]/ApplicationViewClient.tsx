"use client";

import { flattenGroupedValues, FormPreview } from "@/form-engine";
import type { StepFormConfig } from "@/form-engine/types";
import Link from "next/link";

interface ApplicationViewClientProps {
  id: string;
  serviceName: string;
  rawPayload: Record<string, unknown>;
  config: StepFormConfig;
}

export function ApplicationViewClient({
  id,
  serviceName,
  rawPayload,
  config,
}: ApplicationViewClientProps) {
  const flatValues = flattenGroupedValues(rawPayload);

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
          <div className="mt-1 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight uppercase">
                {serviceName.replace(/-/g, " ")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Application ID:{" "}
                <span className="font-mono">
                  {id.slice(0, 8).toUpperCase()}···
                </span>
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Submitted
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <FormPreview
            config={config}
            values={flatValues}
            action="submit"
            readOnly
            onBack={() => {}}
            onConfirm={() => {}}
          />
        </div>
      </main>
    </div>
  );
}
