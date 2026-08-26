import Link from "next/link";
import { ProductStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/product-utils";
import { setProductStatus } from "./actions";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await db.product.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <main className="container py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="text-sm text-zinc-500">← Control Panel</Link>
          <p className="mt-6 text-sm font-bold uppercase tracking-[.2em] text-violet-400">Administration</p>
          <h1 className="mt-2 text-4xl font-black">Products</h1>
          <p className="mt-3 text-zinc-400">Create and manage the plugins shown in your marketplace.</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>

      <div className="card mt-9 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-zinc-400">No products yet. Create your first plugin product.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[.02] text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Plugin</th>
                  <th className="px-5 py-4">Version</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-5">
                      <div className="font-black">{product.name}</div>
                      <div className="mt-1 text-xs text-zinc-500">/plugins/{product.slug}</div>
                    </td>
                    <td className="px-5 py-5 text-zinc-300">{product.currentVersion || "—"}</td>
                    <td className="px-5 py-5 font-bold">{formatPrice(product.priceCents, product.currency)}</td>
                    <td className="px-5 py-5">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold">{product.status}</span>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`} className="btn btn-secondary">Edit</Link>
                        {product.status !== ProductStatus.PUBLISHED && (
                          <form action={setProductStatus.bind(null, product.id, ProductStatus.PUBLISHED)}>
                            <button className="btn btn-secondary" type="submit">Publish</button>
                          </form>
                        )}
                        {product.status === ProductStatus.PUBLISHED && (
                          <form action={setProductStatus.bind(null, product.id, ProductStatus.DRAFT)}>
                            <button className="btn btn-secondary" type="submit">Unpublish</button>
                          </form>
                        )}
                        {product.status !== ProductStatus.ARCHIVED && (
                          <form action={setProductStatus.bind(null, product.id, ProductStatus.ARCHIVED)}>
                            <button className="btn btn-secondary" type="submit">Archive</button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
