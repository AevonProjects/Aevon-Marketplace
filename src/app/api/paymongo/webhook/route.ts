import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { retrievePayment } from "@/lib/paymongo";

function licenseKey() {
  const part = () => crypto.randomBytes(4).toString("hex").toUpperCase();
  return `AEVN-${part()}-${part()}-${part()}-${part()}`;
}

export async function POST(request: Request) {
  let event: any;

  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const type = event?.data?.attributes?.type;
  if (type !== "payment.paid") {
    return NextResponse.json({ ok: true });
  }

  const payment = event?.data?.attributes?.data;
  const paymentId = payment?.id as string | undefined;
  const purchaseId = payment?.attributes?.external_reference_number as string | undefined;

  if (!paymentId || !purchaseId) {
    return NextResponse.json({ ok: true });
  }

  const purchase = await db.purchase.findUnique({
    where: { id: purchaseId },
    include: { product: true }
  });

  if (!purchase || purchase.paymentProvider !== "PAYMONGO") {
    return NextResponse.json({ ok: true });
  }

  if (purchase.status === "PAID") {
    return NextResponse.json({ ok: true });
  }

  // Never trust webhook JSON alone. Re-fetch the payment from PayMongo
  // using our private API key, then verify the important fields.
  const verified = await retrievePayment(paymentId);
  const attrs = verified?.data?.attributes;

  if (
    attrs?.status !== "paid" ||
    attrs?.external_reference_number !== purchase.id ||
    attrs?.amount !== purchase.amountPaidCents ||
    String(attrs?.currency || "").toUpperCase() !== purchase.currency.toUpperCase()
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await db.$transaction(async (tx) => {
    const fresh = await tx.purchase.findUnique({
      where: { id: purchase.id }
    });

    if (!fresh || fresh.status === "PAID") return;

    await tx.purchase.update({
      where: { id: purchase.id },
      data: {
        status: "PAID",
        paymentReference: paymentId
      }
    });

    const existingLicense = await tx.license.findUnique({
      where: { purchaseId: purchase.id }
    });

    if (!existingLicense) {
      await tx.license.create({
        data: {
          licenseKey: licenseKey(),
          userId: purchase.userId,
          productId: purchase.productId,
          purchaseId: purchase.id,
          serverSlots: 1,
          status: "ACTIVE"
        }
      });
    }
  });

  return NextResponse.json({ ok: true });
}
