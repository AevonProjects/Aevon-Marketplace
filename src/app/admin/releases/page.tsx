import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ReleasesPage() {
  await requireAdmin();

  const releases = await db.release.findMany({
    include: {
      product: true,
      _count: { select: { downloadLogs: true } },
    },
    orderBy: { releasedAt: "desc" },
  });

  return (
    <main className="container py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-400">Administration</p>
          <h1 className="mt-2 text-4xl font-black">Plugin Releases</h1>
          <p className="mt-3 text-zinc-400">Upload private JAR releases for customers who own the plugin.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="btn btn-secondary">Back to Admin</Link>
          <Link href="/admin/releases/new" className="btn btn-primary">Upload Release</Link>
        </div>
      </div>

      <div className="card mt-9 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-500">
            <tr>
              <th className="p-4">Plugin</th>
              <th className="p-4">Version</th>
              <th className="p-4">Published</th>
              <th className="p-4">Downloads</th>
              <th className="p-4">Released</th>
            </tr>
          </thead>
          <tbody>
            {releases.map((release) => (
              <tr key={release.id} className="border-b border-white/5">
                <td className="p-4 font-bold">{release.product.name}</td>
                <td className="p-4">{release.version}</td>
                <td className="p-4">{release.isPublished ? "Yes" : "No"}</td>
                <td className="p-4">{release._count.downloadLogs}</td>
                <td className="p-4 text-zinc-400">{release.releasedAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {releases.length === 0 && <p className="p-8 text-zinc-400">No releases uploaded yet.</p>}
      </div>
    </main>
  );
}
