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
    include: {
      product: {
        include: {
          releases: {
            where: { isPublished: true },
            orderBy: { releasedAt: "desc" },
          },
        },
      },
      license: true,
    },
    orderBy: { purchasedAt: "desc" },
  });

  return (
    <main className="container py-14">
      <h1 className="text-4xl font-black">My Plugins</h1>
      <p className="mt-3 text-zinc-400">Your purchased plugins and secure downloads.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {purchases.map((purchase) => {
          const release = purchase.product.releases[0];

          return (
            <div key={purchase.id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{purchase.product.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Current version {purchase.product.currentVersion || "TBA"}
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

              {release ? (
                <div className="mt-5 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Latest Release</p>
                      <p className="mt-1 font-bold">v{release.version}</p>
                    </div>
                    <a href={`/api/download/${release.id}`} className="btn btn-primary">
                      Download JAR
                    </a>
                  </div>

                  {release.changelog && (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                      {release.changelog}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-white/10 p-4 text-sm text-zinc-500">
                  No published download is available yet.
                </div>
              )}

              <Link href={`/plugins/${purchase.product.slug}`} className="btn btn-secondary mt-5">
                View Plugin
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
