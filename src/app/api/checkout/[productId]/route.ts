import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCheckoutSession } from "@/lib/paymongo";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const { productId } = await params;

  const product = await db.product.findFirst({
    where: { id: productId, status: "PUBLISHED" }
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const owned = await db.purchase.findFirst({
    where: {
      userId: user.id,
      productId: product.id,
      status: "PAID"
    }
  });

  if (owned) {
    return NextResponse.redirect(new URL("/dashboard/plugins", request.url), 303);
  }

  const purchase = await db.purchase.create({
    data: {
      userId: user.id,
      productId: product.id,
      amountPaidCents: product.priceCents,
      currency: product.currency,
      paymentProvider: "PAYMONGO",
      status: "PENDING"
    }
  });

  try {
    const base = new URL(request.url).origin;

    const checkout = await createCheckoutSession({
      purchaseId: purchase.id,
      productName: product.name,
      description: product.shortDescription || product.description,
      amount: product.priceCents,
      currency: product.currency,
      customerName: user.username,
      customerEmail: user.email,
      successUrl: `${base}/checkout/success?purchase=${encodeURIComponent(purchase.id)}`,
      cancelUrl: `${base}/plugins/${encodeURIComponent(product.slug)}`
    });

    const checkoutId = checkout?.data?.id as string | undefined;
    const checkoutUrl = checkout?.data?.attributes?.checkout_url as string | undefined;

    if (!checkoutId || !checkoutUrl) {
      throw new Error("PayMongo did not return a checkout URL.");
    }

    await db.purchase.update({
      where: { id: purchase.id },
      data: { paymentReference: checkoutId }
    });

    return NextResponse.redirect(checkoutUrl, 303);
  } catch (error) {
    await db.purchase.update({
      where: { id: purchase.id },
      data: { status: "FAILED" }
    }).catch(() => null);

    const message = error instanceof Error ? error.message : "Unable to create checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
