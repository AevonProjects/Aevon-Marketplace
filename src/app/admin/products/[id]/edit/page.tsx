import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { ProductForm } from "../../ProductForm";
import { updateProduct } from "../../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <main className="container py-14">
      <Link href="/admin/products" className="text-sm text-zinc-500">← Products</Link>
      <h1 className="mt-7 text-4xl font-black">Edit {product.name}</h1>
      <p className="mt-3 text-zinc-400">Changes are saved directly to your marketplace database.</p>
      <ProductForm action={updateProduct.bind(null, product.id)} submitLabel="Save Changes" product={product} />
    </main>
  );
}
