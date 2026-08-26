import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams
}: {
  searchParams: Promise<{ purchase?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { purchase: purchaseId } = await searchParams;

  const purchase = purchaseId
    ? await db.purchase.findFirst({
        where: { id: purchaseId, userId: user.id },
        include: { product: true, license: true }
      })
    : null;

  return (
    <main className="container flex min-h-[70vh] items-center justify-center py-14">
      <div className="card w-full max-w-xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-2xl">✓</div>
        <h1 className="mt-5 text-3xl font-black">Payment received</h1>

        {purchase?.status === "PAID" ? (
          <>
            <p className="mt-3 leading-7 text-zinc-400">
              Your purchase of <strong className="text-white">{purchase.product.name}</strong> has been confirmed.
              The plugin is now attached to your account.
            </p>
            <Link href="/dashboard/plugins" className="btn btn-primary mt-7">
              Open My Plugins
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 leading-7 text-zinc-400">
              PayMongo returned you to Aevon Marketplace successfully. We are waiting for the secure payment confirmation.
              This normally updates automatically after PayMongo sends the webhook.
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
