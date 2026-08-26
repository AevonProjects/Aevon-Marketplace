import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const purchases = await db.purchase.findMany({
    where: { userId: user.id, status: "PAID" },
    include: { product: true, license: true },
    orderBy: { purchasedAt: "desc" }
  });

  return (
    <main className="container py-14">
      <h1 className="text-4xl font-black">My Plugins</h1>
      <p className="mt-3 text-zinc-400">Products confirmed as paid are attached to your account here.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{purchase.product.name}</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Version {purchase.product.currentVersion || "TBA"}
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                OWNED
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">License</p>
              <p className="mt-2 break-all font-mono text-sm text-zinc-300">
                {purchase.license?.licenseKey || "License is being generated"}
              </p>
            </div>

            <Link href={`/plugins/${purchase.product.slug}`} className="btn btn-secondary mt-5">
              View Plugin
            </Link>
          </div>
        ))}
      </div>

      {purchases.length === 0 && (
        <div className="card mt-8 p-7">
          <p className="text-zinc-400">You do not own any plugins yet.</p>
          <Link href="/plugins" className="btn btn-primary mt-5">Browse Plugins</Link>
        </div>
      )}
    </main>
  );
}
