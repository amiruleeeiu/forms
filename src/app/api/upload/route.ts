import { db } from "@/lib/db";
import { uploadedFiles } from "@/lib/db/schema";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

const UPLOADS_DIR = join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file size (10 MB limit)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large (max 10 MB)" },
      { status: 413 },
    );
  }

  // Allow only safe mime types
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed" },
      { status: 415 },
    );
  }

  // Generate a safe stored filename using crypto.randomUUID()
  const ext =
    file.name
      .split(".")
      .pop()
      ?.replace(/[^a-zA-Z0-9]/g, "") ?? "bin";
  const storedName = `${crypto.randomUUID()}.${ext}`;

  await mkdir(UPLOADS_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(UPLOADS_DIR, storedName), buffer);

  const url = `/uploads/${storedName}`;

  const [record] = await db
    .insert(uploadedFiles)
    .values({
      originalName: file.name,
      storedName,
      mimeType: file.type,
      sizeBytes: file.size,
      url,
    })
    .returning();

  return NextResponse.json({
    id: record.id,
    url: record.url,
    originalName: record.originalName,
  });
}
