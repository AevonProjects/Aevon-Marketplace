import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireAdmin();

  const orders = await db.purchase.findMany({
    include: { user: true, product: true, license: true },
    orderBy: { purchasedAt: "desc" }
  });

  return (
    <main className="container py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-400">Administration</p>
          <h1 className="mt-2 text-4xl font-black">Orders</h1>
          <p className="mt-3 text-zinc-400">PayMongo checkout and confirmed marketplace purchases.</p>
        </div>
        <Link href="/admin" className="btn btn-secondary">Back to Admin</Link>
      </div>

      <div className="card mt-9 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-500">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Product</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Date</th>
              <th className="p-4">License</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-white/5">
                <td className="p-4">
                  <div className="font-bold">{order.user.username}</div>
                  <div className="text-xs text-zinc-500">{order.user.email}</div>
                </td>
                <td className="p-4 font-bold">{order.product.name}</td>
                <td className="p-4">
                  {(order.amountPaidCents / 100).toLocaleString("en-PH", {
                    style: "currency",
                    currency: order.currency
                  })}
                </td>
                <td className="p-4">{order.status}</td>
                <td className="p-4">{order.paymentProvider || "—"}</td>
                <td className="p-4 text-zinc-400">{order.purchasedAt.toLocaleString()}</td>
                <td className="p-4">{order.license ? "Issued" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && <p className="p-8 text-zinc-400">No orders yet.</p>}
      </div>
    </main>
  );
}
