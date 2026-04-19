import { db } from "@/lib/db";
import { districts, divisions } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const divisionId = request.nextUrl.searchParams.get("divisionId");

  if (!divisionId) {
    return NextResponse.json(
      { error: "divisionId is required" },
      { status: 400 },
    );
  }

  // divisionId is a slug string
  const division = await db
    .select({ id: divisions.id })
    .from(divisions)
    .where(eq(divisions.slug, divisionId))
    .limit(1);

  if (!division.length) {
    return NextResponse.json([]);
  }

  const rows = await db
    .select({ value: districts.slug, label: districts.name })
    .from(districts)
    .where(eq(districts.divisionId, division[0].id))
    .orderBy(asc(districts.name));

  return NextResponse.json(rows);
}
