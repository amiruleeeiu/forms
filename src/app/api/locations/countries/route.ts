import { db } from "@/lib/db";
import { countries } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db
    .select({ value: countries.code, label: countries.name })
    .from(countries)
    .orderBy(asc(countries.name));

  return NextResponse.json(rows);
}
