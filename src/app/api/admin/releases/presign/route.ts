import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { getR2Bucket, getR2Client } from "@/lib/r2";

const MAX_SIZE = 100 * 1024 * 1024;
function clean(value: string) { return value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, ""); }

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  const productId = String(body?.productId || "");
  const version = String(body?.version || "").trim();
  const fileName = String(body?.fileName || "");
  const fileSize = Number(body?.fileSize || 0);

  if (!productId || !version || !fileName.toLowerCase().endsWith(".jar")) return NextResponse.json({ error: "Invalid release information." }, { status: 400 });
  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_SIZE) return NextResponse.json({ error: "JAR must be 100 MB or smaller." }, { status: 400 });

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Plugin not found." }, { status: 404 });

  const exists = await db.release.findUnique({ where: { productId_version: { productId, version } } });
  if (exists) return NextResponse.json({ error: "That version already exists." }, { status: 409 });

  const storageKey = `plugin-releases/${clean(product.slug)}/${clean(version)}/${crypto.randomUUID()}-${clean(fileName)}`;
  const command = new PutObjectCommand({ Bucket: getR2Bucket(), Key: storageKey, ContentType: "application/java-archive" });
  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 15 * 60 });
  return NextResponse.json({ storageKey, uploadUrl });
}
