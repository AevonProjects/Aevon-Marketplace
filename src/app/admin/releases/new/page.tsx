import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { ReleaseUploadForm } from "@/components/ReleaseUploadForm";

export const dynamic = "force-dynamic";

export default async function NewReleasePage() {
  await requireAdmin();

  const products = await db.product.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="container py-14">
      <Link href="/admin/releases" className="text-sm text-zinc-500">← Back to releases</Link>
      <h1 className="mt-5 text-4xl font-black">Upload Plugin Release</h1>
      <p className="mt-3 text-zinc-400">
        The JAR will be stored inside your private Vercel Blob store.
      </p>
      <ReleaseUploadForm products={products} />
    </main>
  );
}
