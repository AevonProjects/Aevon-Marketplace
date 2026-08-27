import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { reconcilePayMongoPurchase } from "@/lib/finalize-purchase";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams
}: {
  searchParams: Promise<{ purchase?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { purchase: purchaseId } = await searchParams;

  const result = purchaseId
    ? await reconcilePayMongoPurchase(purchaseId, user.id).catch(() => ({
        ok: false as const,
        reason: "verification_error"
      }))
    : { ok: false as const, reason: "missing_purchase" };

  const purchase = result.ok ? result.purchase : null;

  return (
    <main className="container flex min-h-[70vh] items-center justify-center py-14">
      <div className="card w-full max-w-xl p-8 text-center">
        {purchase?.status === "PAID" ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-2xl">✓</div>
            <h1 className="mt-5 text-3xl font-black">Purchase confirmed!</h1>
            <p className="mt-3 leading-7 text-zinc-400">
              Your purchase of <strong className="text-white">{purchase.product.name}</strong> has been verified directly with PayMongo and is now attached to your account.
            </p>

            {purchase.license && (
              <div className="mt-6 rounded-xl border border-white/10 p-4 text-left">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Your license</p>
                <p className="mt-2 break-all font-mono text-sm text-zinc-300">
                  {purchase.license.licenseKey}
                </p>
              </div>
            )}

            <Link href="/dashboard/plugins" className="btn btn-primary mt-7">
              Open My Plugins
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/10 text-2xl">…</div>
            <h1 className="mt-5 text-3xl font-black">Checking your payment</h1>
            <p className="mt-3 leading-7 text-zinc-400">
              PayMongo returned you to the marketplace, but the payment has not been confirmed by the API yet.
              Refresh this page after a few seconds. Ownership is only granted after PayMongo reports the transaction as paid.
            </p>
            <Link href="/dashboard/plugins" className="btn btn-secondary mt-7">
              Check My Plugins
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
