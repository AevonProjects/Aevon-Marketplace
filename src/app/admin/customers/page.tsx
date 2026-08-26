import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export default async function CustomersPage() {
  await requireAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { purchases: true, licenses: true, downloadLogs: true } } }
  });

  return (
    <main className="container py-14">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-sm font-bold uppercase tracking-[.2em] text-violet-400">Administration</p><h1 className="mt-2 text-4xl font-black">Customers</h1><p className="mt-3 text-zinc-400">Review accounts, roles, status, purchases, and licenses.</p></div>
        <Link href="/admin" className="btn btn-secondary">Back to Admin</Link>
      </div>
      <div className="card mt-9 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-500"><tr><th className="p-4">Customer</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Verified</th><th className="p-4">Purchases</th><th className="p-4">Licenses</th><th className="p-4">Joined</th><th className="p-4"></th></tr></thead>
          <tbody>{users.map(u => <tr key={u.id} className="border-b border-white/5"><td className="p-4"><div className="font-bold">{u.username}</div><div className="text-xs text-zinc-500">{u.email}</div></td><td className="p-4">{u.role}</td><td className="p-4">{u.status}</td><td className="p-4">{u.emailVerified ? "Yes" : "No"}</td><td className="p-4">{u._count.purchases}</td><td className="p-4">{u._count.licenses}</td><td className="p-4 text-zinc-400">{u.createdAt.toLocaleDateString()}</td><td className="p-4"><Link className="text-violet-300 font-bold" href={`/admin/customers/${u.id}`}>Manage →</Link></td></tr>)}</tbody>
        </table>
        {users.length === 0 && <p className="p-8 text-zinc-400">No customer accounts yet.</p>}
      </div>
    </main>
  );
}
