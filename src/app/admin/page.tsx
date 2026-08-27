import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminPage() {
  await requireAdmin();

  const sections = [
    ["Products", "Create, edit, publish, unpublish, and archive plugins.", "/admin/products", true],
    ["Customers", "Review customer accounts and account status.", "/admin/customers", true],
    ["Orders", "Inspect purchases and payment records.", "/admin/orders", true],
    ["Licenses", "Issue, suspend, revoke, and inspect licenses.", "#", false],
    ["Releases", "Publish versions and manage private JAR files.", "/admin/releases", true],
    ["Logs", "Audit downloads, activations, and important security events.", "#", false]
  ] as const;

  return (
    <main className="container py-14">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-400">Administration</p>
      <h1 className="mt-2 text-4xl font-black">Aevon Control Panel</h1>
      <p className="mt-3 text-zinc-400">Manage the marketplace from one place.</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sections.map(([title, text, href, enabled]) => {
          const content = (
            <>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-black">{title}</h2>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${enabled ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-zinc-600"}`}>
                  {enabled ? "Live" : "Coming next"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
              <span className="mt-6 inline-block text-xs font-bold uppercase tracking-wider text-violet-400">{enabled ? "Open module →" : "Module reserved"}</span>
            </>
          );

          return enabled ? (
            <Link key={title} href={href} className="card p-6 transition hover:-translate-y-1 hover:border-violet-400/40">{content}</Link>
          ) : (
            <div key={title} className="card p-6 opacity-70">{content}</div>
          );
        })}
      </div>
    </main>
  );
}
