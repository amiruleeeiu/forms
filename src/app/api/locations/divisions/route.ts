import { db } from "@/lib/db";
import { divisions } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db
    .select({ value: divisions.slug, label: divisions.name })
    .from(divisions)
    .orderBy(asc(divisions.name));

  return NextResponse.json(rows);
}
