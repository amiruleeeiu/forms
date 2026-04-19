import { db } from "@/lib/db";
import { districts, thanas } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const districtId = request.nextUrl.searchParams.get("districtId");

  if (!districtId) {
    return NextResponse.json(
      { error: "districtId is required" },
      { status: 400 },
    );
  }

  // districtId is a slug string
  const district = await db
    .select({ id: districts.id })
    .from(districts)
    .where(eq(districts.slug, districtId))
    .limit(1);

  if (!district.length) {
    return NextResponse.json([]);
  }

  const rows = await db
    .select({ value: thanas.slug, label: thanas.name })
    .from(thanas)
    .where(eq(thanas.districtId, district[0].id))
    .orderBy(asc(thanas.name));

  return NextResponse.json(rows);
}
