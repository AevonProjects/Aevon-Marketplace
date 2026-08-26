import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, include: { purchases: { include: { product: true }, orderBy: { purchasedAt: "desc" } }, licenses: { include: { product: true }, orderBy: { createdAt: "desc" } } } });
  if (!user) notFound();
  return <main className="container py-14">
    <Link href="/admin/customers" className="text-sm text-zinc-500">← Back to customers</Link>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-5"><div><h1 className="text-4xl font-black">{user.username}</h1><p className="mt-2 text-zinc-400">{user.email}</p></div><div className="flex gap-2"><span className="rounded-full border border-white/10 px-3 py-2 text-sm">{user.role}</span><span className="rounded-full border border-white/10 px-3 py-2 text-sm">{user.status}</span></div></div>
    <section className="card mt-8 p-7"><h2 className="text-xl font-black">Account controls</h2><p className="mt-2 text-sm text-zinc-400">Suspending an account blocks login. Your own administrator account cannot be suspended or demoted here.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {user.id !== admin.id && <>
          <form action={`/api/admin/customers/${user.id}/status`} method="post"><input type="hidden" name="status" value={user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"}/><button className="btn btn-secondary">{user.status === "ACTIVE" ? "Suspend account" : "Reactivate account"}</button></form>
          <form action={`/api/admin/customers/${user.id}/role`} method="post"><input type="hidden" name="role" value={user.role === "ADMIN" ? "CUSTOMER" : "ADMIN"}/><button className="btn btn-secondary">{user.role === "ADMIN" ? "Make Customer" : "Make Admin"}</button></form>
        </>}
        {user.id === admin.id && <span className="text-sm text-violet-300">This is your current administrator account.</span>}
      </div>
    </section>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="card p-7"><h2 className="text-xl font-black">Purchases</h2><div className="mt-4 space-y-3">{user.purchases.length ? user.purchases.map(x => <div key={x.id} className="rounded-xl border border-white/10 p-4"><div className="font-bold">{x.product.name}</div><div className="text-sm text-zinc-500">{x.status} · {(x.amountPaidCents/100).toLocaleString('en-PH',{style:'currency',currency:x.currency})}</div></div>) : <p className="text-sm text-zinc-500">No purchases yet.</p>}</div></section>
    <section className="card p-7"><h2 className="text-xl font-black">Licenses</h2><div className="mt-4 space-y-3">{user.licenses.length ? user.licenses.map(x => <div key={x.id} className="rounded-xl border border-white/10 p-4"><div className="font-bold">{x.product.name}</div><div className="text-sm text-zinc-500">{x.status} · {x.serverSlots} server slot(s)</div></div>) : <p className="text-sm text-zinc-500">No licenses yet.</p>}</div></section></div>
  </main>;
}
