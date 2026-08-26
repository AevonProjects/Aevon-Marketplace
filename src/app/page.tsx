import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/product-utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
    take: 3
  });

  return (
    <main>
      <section className="container py-24">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-300">Premium Minecraft server software</div>
          <h1 className="text-5xl font-black leading-tight md:text-7xl">Powerful plugins.<span className="block bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">Built for serious servers.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">Create an account, purchase your plugins, manage licenses, and access secure releases from one place.</p>
          <div className="mt-9 flex gap-3">
            <Link href="/plugins" className="btn btn-primary">Browse plugins</Link>
            <Link href="/register" className="btn btn-secondary">Create account</Link>
          </div>
        </div>
      </section>

      <section className="container pb-24">
        <div className="mb-7 flex items-end justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[.2em] text-violet-400">Marketplace</p><h2 className="mt-2 text-3xl font-black">Featured plugins</h2></div>
          <Link href="/plugins" className="text-sm text-zinc-400">View all →</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.slug} href={`/plugins/${product.slug}`} className="card p-6 transition hover:-translate-y-1 hover:border-violet-400/40">
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 font-black text-violet-300">A</div>
              <h3 className="text-xl font-black">{product.name}</h3>
              <p className="mt-2 min-h-16 text-sm leading-6 text-zinc-400">{product.shortDescription}</p>
              <div className="mt-6 flex items-center justify-between"><span className="text-sm text-zinc-500">v{product.currentVersion || "TBA"}</span><span className="font-black">{formatPrice(product.priceCents, product.currency)}</span></div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
