import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  await requireAdmin();
  return NextResponse.redirect(new URL("/admin/releases", request.url), 303);
}
