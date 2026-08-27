import crypto from "node:crypto";
import { db } from "@/lib/db";
import { retrieveCheckoutSession } from "@/lib/paymongo";

function createLicenseKey() {
  const part = () => crypto.randomBytes(4).toString("hex").toUpperCase();
  return `AEVN-${part()}-${part()}-${part()}-${part()}`;
}

function collectPayments(session: any): any[] {
  const attrs = session?.data?.attributes ?? {};
  const candidates = [
    attrs.payments,
    attrs.payment,
    attrs.payment_intent?.attributes?.payments,
    attrs.payment_intent?.payments
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return [value];
  }

  return [];
}

export async function reconcilePayMongoPurchase(purchaseId: string, userId?: string) {
  const purchase = await db.purchase.findFirst({
    where: {
      id: purchaseId,
      ...(userId ? { userId } : {})
    },
    include: { product: true, license: true }
  });

  if (!purchase) {
    return { ok: false as const, reason: "purchase_not_found" };
  }

  if (purchase.status === "PAID") {
    return { ok: true as const, purchase };
  }

  if (
    purchase.paymentProvider !== "PAYMONGO" ||
    !purchase.paymentReference ||
    !purchase.paymentReference.startsWith("cs_")
  ) {
    return { ok: false as const, reason: "missing_checkout_reference" };
  }

  const session = await retrieveCheckoutSession(purchase.paymentReference);
  const attrs = session?.data?.attributes ?? {};

  // The reference is created by our backend when checkout begins.
  if (
    attrs.reference_number &&
    attrs.reference_number !== purchase.id
  ) {
    return { ok: false as const, reason: "reference_mismatch" };
  }

  const payments = collectPayments(session);

  const paidPayment = payments.find((payment: any) => {
    const paymentAttrs = payment?.attributes ?? payment ?? {};
    const amount = Number(paymentAttrs.amount);
    const currency = String(paymentAttrs.currency ?? "").toUpperCase();
    const status = String(paymentAttrs.status ?? "").toLowerCase();

    return (
      status === "paid" &&
      amount === purchase.amountPaidCents &&
      currency === purchase.currency.toUpperCase()
    );
  });

  // Some Checkout API responses expose the aggregate payment status instead
  // of a populated payments array. Only accept it if amount/currency also match.
  const aggregatePaid =
    String(attrs.payment_status ?? attrs.status ?? "").toLowerCase() === "paid" &&
    Number(attrs.amount ?? purchase.amountPaidCents) === purchase.amountPaidCents &&
    String(attrs.currency ?? purchase.currency).toUpperCase() === purchase.currency.toUpperCase();

  if (!paidPayment && !aggregatePaid) {
    return { ok: false as const, reason: "payment_not_confirmed" };
  }

  await db.$transaction(async (tx) => {
    const fresh = await tx.purchase.findUnique({
      where: { id: purchase.id }
    });

    if (!fresh || fresh.status === "PAID") return;

    await tx.purchase.update({
      where: { id: purchase.id },
      data: { status: "PAID" }
    });

    const existingLicense = await tx.license.findUnique({
      where: { purchaseId: purchase.id }
    });

    if (!existingLicense) {
      await tx.license.create({
        data: {
          licenseKey: createLicenseKey(),
          userId: purchase.userId,
          productId: purchase.productId,
          purchaseId: purchase.id,
          serverSlots: 1,
          status: "ACTIVE"
        }
      });
    }
  });

  const updated = await db.purchase.findUnique({
    where: { id: purchase.id },
    include: { product: true, license: true }
  });

  return { ok: true as const, purchase: updated! };
}
