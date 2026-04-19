import { db } from "@/lib/db";
import { formSubmissions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

const FormSubmissionSchema = z.object({
  serviceName: z.string().min(1).max(100),
  stakeholderCode: z.string().min(1).max(100),
  rawPayload: z.record(z.string(), z.unknown()),
  status: z.enum(["SUBMIT", "DRAFT"]),
});

export async function GET() {
  const rows = await db
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

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = FormSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { serviceName, stakeholderCode, rawPayload, status } = parsed.data;

  const [record] = await db
    .insert(formSubmissions)
    .values({ serviceName, stakeholderCode, rawPayload, status })
    .returning({ id: formSubmissions.id, status: formSubmissions.status });

  return NextResponse.json(record, { status: 201 });
}
