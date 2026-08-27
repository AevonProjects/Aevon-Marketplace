import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const logs = await db.downloadLog.findMany({
    where: { userId: user.id },
    include: { product: true, release: true },
    orderBy: { downloadedAt: "desc" },
    take: 100,
  });

  return (
    <main className="container py-14">
      <h1 className="text-4xl font-black">Downloads</h1>
      <p className="mt-3 text-zinc-400">Your authorized download history.</p>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-500">
            <tr>
              <th className="p-4">Plugin</th>
              <th className="p-4">Version</th>
              <th className="p-4">Downloaded</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/5">
                <td className="p-4 font-bold">{log.product.name}</td>
                <td className="p-4">{log.release?.version || "—"}</td>
                <td className="p-4 text-zinc-400">{log.downloadedAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && <p className="p-8 text-zinc-400">No downloads yet.</p>}
      </div>
    </main>
  );
}
