import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json().catch(() => null);
  const productId = String(body?.productId || "");
  const version = String(body?.version || "").trim();
  const changelog = String(body?.changelog || "").trim();
  const storageKey = String(body?.storageKey || "");
  const publish = Boolean(body?.publish);

  if (!productId || !version || !storageKey) {
    return NextResponse.json({ error: "Invalid release information." }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Plugin not found." }, { status: 404 });
  }

  const exists = await db.release.findUnique({
    where: {
      productId_version: {
        productId,
        version,
      },
    },
  });

  if (exists) {
    return NextResponse.json({ error: "That release already exists." }, { status: 409 });
  }

  await db.$transaction(async (tx) => {
    await tx.release.create({
      data: {
        productId,
        version,
        storageKey,
        changelog: changelog || null,
        isPublished: publish,
      },
    });

    if (publish) {
      await tx.product.update({
        where: { id: productId },
        data: { currentVersion: version },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
