import { db } from "@/lib/db";
import { formSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

// GET /api/form/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [submission] = await db
    .select()
    .from(formSubmissions)
    .where(eq(formSubmissions.id, id))
    .limit(1);

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(submission);
}

// PATCH /api/form/[id] — only allowed on DRAFT records
const PatchSchema = z.object({
  rawPayload: z.record(z.string(), z.unknown()),
  status: z.enum(["SUBMIT", "DRAFT"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [existing] = await db
    .select({ id: formSubmissions.id, status: formSubmissions.status })
    .from(formSubmissions)
    .where(eq(formSubmissions.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only DRAFT submissions can be updated" },
      { status: 409 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { rawPayload, status } = parsed.data;

  const [updated] = await db
    .update(formSubmissions)
    .set({ rawPayload, status, updatedAt: new Date() })
    .where(eq(formSubmissions.id, id))
    .returning({ id: formSubmissions.id, status: formSubmissions.status });

  return NextResponse.json(updated);
}
