import Link from "next/link";
import { notFound } from "next/navigation";
import { starterProducts } from "@/lib/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = starterProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <main className="container py-14">
      <Link href="/plugins" className="text-sm text-zinc-500">← Back to plugins</Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="card p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15 text-xl font-black text-violet-300">A</div>
          <h1 className="mt-6 text-4xl font-black">{product.name}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">{product.description}</p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 p-4">
              <p className="text-xs uppercase text-zinc-500">Current version</p>
              <p className="mt-1 font-bold">{product.version}</p>
            </div>
            <div className="rounded-xl border border-white/10 p-4">
              <p className="text-xs uppercase text-zinc-500">Platforms</p>
              <p className="mt-1 font-bold">Paper / Purpur</p>
            </div>
            <div className="rounded-xl border border-white/10 p-4">
              <p className="text-xs uppercase text-zinc-500">License</p>
              <p className="mt-1 font-bold">1 server slot</p>
            </div>
          </div>
        </section>

        <aside className="card h-fit p-7">
          <p className="text-sm text-zinc-500">License price</p>
          <p className="mt-2 text-4xl font-black">{product.price}</p>
          <p className="mt-5 text-sm leading-6 text-zinc-400">
            Purchasing will be enabled in v0.2. Registration and ownership infrastructure are already being prepared.
          </p>
          <Link href="/register" className="btn btn-primary mt-7 w-full">Create account to purchase</Link>
        </aside>
      </div>
    </main>
  );
}
