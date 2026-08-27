import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const MAX_JAR_BYTES = 100 * 1024 * 1024;

function safePart(value: string) {
  return value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json().catch(() => null);
  const productId = String(body?.productId || "");
  const version = String(body?.version || "").trim();
  const fileName = String(body?.fileName || "");
  const fileSize = Number(body?.fileSize || 0);

  if (!productId || !version || !fileName.toLowerCase().endsWith(".jar")) {
    return NextResponse.json({ error: "Plugin, version, and a .jar file are required." }, { status: 400 });
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_JAR_BYTES) {
    return NextResponse.json({ error: "JAR files must be 100 MB or smaller." }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const existing = await db.release.findUnique({
    where: { productId_version: { productId, version } }
  });

  if (existing) {
    return NextResponse.json({ error: "That version already exists for this plugin." }, { status: 409 });
  }

  const pathname = [
    "plugin-releases",
    safePart(product.slug),
    safePart(version),
    `${crypto.randomUUID()}-${safePart(fileName)}`
  ].join("/");

  const validUntil = Date.now() + 15 * 60 * 1000;

  const token = await issueSignedToken({
    pathname,
    operations: ["put"],
    validUntil
  });

  const { presignedUrl } = await presignUrl(token, {
    pathname,
    operation: "put",
    validUntil
  });

  return NextResponse.json({ pathname, presignedUrl });
}
