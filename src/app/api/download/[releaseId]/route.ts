import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getR2Bucket, getR2Client } from "@/lib/r2";

export async function GET(request: Request, { params }: { params: Promise<{ releaseId: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") return NextResponse.redirect(new URL("/login", request.url), 303);
  const { releaseId } = await params;
  const release = await db.release.findFirst({ where: { id: releaseId, isPublished: true }, include: { product: true } });
  if (!release || !release.storageKey) return NextResponse.json({ error: "Release not available." }, { status: 404 });

  const owns = await db.purchase.findFirst({ where: { userId: user.id, productId: release.productId, status: "PAID" } });
  if (!owns && user.role !== "ADMIN") return NextResponse.json({ error: "You do not own this plugin." }, { status: 403 });

  const name = `${release.product.slug}-${release.version}.jar`;
  const command = new GetObjectCommand({ Bucket: getR2Bucket(), Key: release.storageKey, ResponseContentDisposition: `attachment; filename="${name}"` });
  const downloadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 120 });

  const forwarded = request.headers.get("x-forwarded-for");
  await db.downloadLog.create({ data: { userId: user.id, productId: release.productId, releaseId: release.id, ipAddress: forwarded?.split(",")[0]?.trim() || null } });
  return NextResponse.redirect(downloadUrl, 302);
}
