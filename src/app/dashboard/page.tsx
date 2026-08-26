import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="container py-14">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-400">Customer Dashboard</p>
      <h1 className="mt-2 text-4xl font-black">Welcome, {user.username}</h1>
      <p className="mt-3 text-zinc-400">Manage your plugins, licenses, downloads, and account.</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["My Plugins", "/dashboard/plugins", "Purchased products will appear here."],
          ["Licenses", "/dashboard/licenses", "Manage server activations and license status."],
          ["Downloads", "/dashboard/downloads", "Access authorized plugin releases."],
          ["Account", "/dashboard/account", "Manage profile and security settings."]
        ].map(([title, href, text]) => (
          <Link href={href} key={href} className="card p-6 hover:border-violet-400/40">
            <h2 className="font-black">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
