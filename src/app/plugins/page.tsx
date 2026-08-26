import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/product-utils";

export const dynamic = "force-dynamic";

export default async function PluginsPage() {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "asc" }
  });

  return (
    <main className="container py-14">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-400">Store</p>
      <h1 className="mt-2 text-4xl font-black">Aevon Plugins</h1>
      <p className="mt-3 text-zinc-400">Premium plugins for modern Minecraft servers.</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link key={product.slug} href={`/plugins/${product.slug}`} className="card p-6 hover:border-violet-400/40">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 font-black text-violet-300">A</div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">{product.supportedVersions || "Minecraft"}</span>
            </div>
            <h2 className="mt-7 text-xl font-black">{product.name}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{product.shortDescription}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Version {product.currentVersion || "TBA"}</span>
              <strong>{formatPrice(product.priceCents, product.currency)}</strong>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && <div className="card mt-10 p-8 text-zinc-400">No published plugins are available yet.</div>}
    </main>
  );
}
