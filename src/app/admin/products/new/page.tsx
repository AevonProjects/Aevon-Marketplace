import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createProduct } from "../actions";
import { ProductForm } from "../ProductForm";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <main className="container py-14">
      <Link href="/admin/products" className="text-sm text-zinc-500">← Products</Link>
      <h1 className="mt-7 text-4xl font-black">Add Product</h1>
      <p className="mt-3 text-zinc-400">Create a new plugin listing for your marketplace.</p>
      <ProductForm action={createProduct} submitLabel="Create Product" />
    </main>
  );
}
