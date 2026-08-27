import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { reconcilePayMongoPurchase } from "@/lib/finalize-purchase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  await reconcilePayMongoPurchase(id).catch(() => null);

  return NextResponse.redirect(new URL("/admin/orders", request.url), 303);
}
