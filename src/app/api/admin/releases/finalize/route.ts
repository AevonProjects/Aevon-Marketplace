import { NextResponse } from "next/server";
import { head } from "@vercel/blob";
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

  if (!productId || !version || !storageKey.startsWith("plugin-releases/")) {
    return NextResponse.json({ error: "Invalid release data." }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const existing = await db.release.findUnique({
    where: { productId_version: { productId, version } }
  });
  if (existing) {
    return NextResponse.json({ error: "That release already exists." }, { status: 409 });
  }

  try {
    await head(storageKey, { access: "private" });
  } catch {
    return NextResponse.json({ error: "Uploaded JAR could not be verified in private storage." }, { status: 400 });
  }

  await db.$transaction(async (tx) => {
    await tx.release.create({
      data: {
        productId,
        version,
        storageKey,
        changelog: changelog || null,
        isPublished: publish
      }
    });

    if (publish) {
      await tx.product.update({
        where: { id: productId },
        data: { currentVersion: version }
      });
    }
  });

  return NextResponse.json({ ok: true });
}
