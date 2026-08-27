import { NextResponse } from "next/server";
import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const MAX_JAR_BYTES = 100 * 1024 * 1024;

type ClientPayload = {
  productId: string;
  version: string;
  originalFileName: string;
};

export async function POST(request: Request) {
  await requireAdmin();

  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let payload: ClientPayload;

        try {
          payload = JSON.parse(clientPayload || "{}") as ClientPayload;
        } catch {
          throw new Error("Invalid upload information.");
        }

        const productId = String(payload.productId || "");
        const version = String(payload.version || "").trim();
        const originalFileName = String(payload.originalFileName || "");

        if (!productId || !version || !originalFileName.toLowerCase().endsWith(".jar")) {
          throw new Error("Invalid JAR upload.");
        }

        const product = await db.product.findUnique({
          where: { id: productId },
          select: { id: true },
        });

        if (!product) {
          throw new Error("Plugin not found.");
        }

        const exists = await db.release.findUnique({
          where: {
            productId_version: {
              productId,
              version,
            },
          },
          select: { id: true },
        });

        if (exists) {
          throw new Error("That version already exists for this plugin.");
        }

        return {
          allowedContentTypes: [
            "application/java-archive",
            "application/octet-stream",
            "application/zip",
          ],
          maximumSizeInBytes: MAX_JAR_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            productId,
            version,
            originalFileName,
          }),
        };
      },
      onUploadCompleted: async () => {
        // Database finalization is deliberately performed by the authenticated
        // /finalize endpoint after the browser receives the completed Blob.
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to authorize upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
