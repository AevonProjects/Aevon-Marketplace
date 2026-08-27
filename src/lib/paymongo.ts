const API_BASE = "https://api.paymongo.com/v1";

function authHeader() {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) throw new Error("PAYMONGO_SECRET_KEY is not configured");
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export async function paymongoRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...(init.headers || {})
    },
    cache: "no-store"
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      body?.errors?.[0]?.detail ||
      body?.errors?.[0]?.code ||
      "PayMongo request failed";
    throw new Error(detail);
  }

  return body;
}

export async function createCheckoutSession(input: {
  purchaseId: string;
  productName: string;
  description: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return paymongoRequest("/checkout_sessions", {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          billing: {
            name: input.customerName,
            email: input.customerEmail
          },
          cancel_url: input.cancelUrl,
          success_url: input.successUrl,
          description: `Aevon Marketplace purchase: ${input.productName}`,
          line_items: [
            {
              amount: input.amount,
              quantity: 1,
              currency: input.currency,
              name: input.productName,
              description: input.description.slice(0, 255)
            }
          ],
          payment_method_types: ["card", "gcash"],
          reference_number: input.purchaseId,
          send_email_receipt: true,
          show_description: true,
          show_line_items: true
        }
      }
    })
  });
}

export async function retrievePayment(paymentId: string) {
  return paymongoRequest(`/payments/${encodeURIComponent(paymentId)}`, {
    method: "GET"
  });
}


export async function retrieveCheckoutSession(checkoutSessionId: string) {
  return paymongoRequest(`/checkout_sessions/${encodeURIComponent(checkoutSessionId)}`, {
    method: "GET"
  });
}
