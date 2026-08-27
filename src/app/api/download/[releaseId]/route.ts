import { NextResponse } from "next/server";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ releaseId: string }> }
) {
  const user = await getCurrentUser();

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const { releaseId } = await params;

  const release = await db.release.findFirst({
    where: { id: releaseId, isPublished: true },
    include: { product: true },
  });

  if (!release || !release.storageKey) {
    return NextResponse.json({ error: "Release not available." }, { status: 404 });
  }

  const owns = await db.purchase.findFirst({
    where: {
      userId: user.id,
      productId: release.productId,
      status: "PAID",
    },
  });

  if (!owns && user.role !== "ADMIN") {
    return NextResponse.json({ error: "You do not own this plugin." }, { status: 403 });
  }

  const validUntil = Date.now() + 2 * 60 * 1000;

  const token = await issueSignedToken({
    pathname: release.storageKey,
    operations: ["get"],
    validUntil,
  });

  const { presignedUrl } = await presignUrl(token, {
    pathname: release.storageKey,
    operation: "get",
    validUntil,
  });

  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim() || null;

  await db.downloadLog.create({
    data: {
      userId: user.id,
      productId: release.productId,
      releaseId: release.id,
      ipAddress,
    },
  });

  return NextResponse.redirect(presignedUrl, 302);
}
