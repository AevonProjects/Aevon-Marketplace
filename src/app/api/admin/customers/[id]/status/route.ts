import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const form = await request.formData();
  const value = String(form.get("status") || "") as "ACTIVE" | "SUSPENDED" | "BANNED";
  if (!["ACTIVE", "SUSPENDED", "BANNED"].includes(value)) return NextResponse.json({ error: "Invalid value." }, { status: 400 });
  if (id === admin.id && value !== "ACTIVE") return NextResponse.json({ error: "You cannot suspend your own account." }, { status: 400 });
  await db.user.update({ where: { id }, data: { status: value } });
  return NextResponse.redirect(new URL(`/admin/customers/${id}`, request.url), 303);
}
