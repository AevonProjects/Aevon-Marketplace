import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST() {
  await requireAdmin();

  return NextResponse.json(
    {
      error: "This legacy upload endpoint is disabled. Cloudflare R2 upload is active.",
    },
    { status: 410 }
  );
}
