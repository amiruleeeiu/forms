/**
 * Shared client-side helpers for form API calls.
 * Handles file uploads and form submission/draft.
 */

// ---------------------------------------------------------------------------
// Upload a single file
// ---------------------------------------------------------------------------

export async function uploadFile(
  file: File,
): Promise<{ id: string; url: string; originalName: string }> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `Upload failed (${res.status})`,
    );
  }
  return res.json() as Promise<{
    id: string;
    url: string;
    originalName: string;
  }>;
}

// ---------------------------------------------------------------------------
// Recursively walk form values and upload all File objects.
// Returns a deep copy with File → { url, originalName } replacements.
// ---------------------------------------------------------------------------

export async function walkAndUploadFiles(
  values: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  async function walk(node: unknown): Promise<unknown> {
    if (node instanceof File) {
      const result = await uploadFile(node);
      return { url: result.url, originalName: result.originalName };
    }

    if (node instanceof Date) {
      return node.toISOString();
    }

    if (Array.isArray(node)) {
      return Promise.all(node.map(walk));
    }

    if (node !== null && typeof node === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(
        node as Record<string, unknown>,
      )) {
        out[key] = await walk(val);
      }
      return out;
    }

    return node;
  }

  return walk(values) as Promise<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Submit / save draft
// ---------------------------------------------------------------------------

export async function submitForm(payload: {
  serviceName: string;
  stakeholderCode: string;
  rawPayload: Record<string, unknown>;
  status: "SUBMIT" | "DRAFT";
}): Promise<{ id: string; status: string }> {
  const res = await fetch("/api/form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ??
        `Form submission failed (${res.status})`,
    );
  }

  return res.json() as Promise<{ id: string; status: string }>;
}

// ---------------------------------------------------------------------------
// Update an existing DRAFT (submit or re-save draft)
// ---------------------------------------------------------------------------

export async function updateSubmission(
  id: string,
  payload: {
    rawPayload: Record<string, unknown>;
    status: "SUBMIT" | "DRAFT";
  },
): Promise<{ id: string; status: string }> {
  const res = await fetch(`/api/form/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `Update failed (${res.status})`,
    );
  }

  return res.json() as Promise<{ id: string; status: string }>;
}
