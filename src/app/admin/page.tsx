import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const sections = [
    ["Products", "Create, edit, publish, and archive plugins."],
    ["Customers", "Review customer accounts and account status."],
    ["Orders", "Inspect purchases and payment records."],
    ["Licenses", "Issue, suspend, revoke, and inspect licenses."],
    ["Releases", "Publish versions and manage private JAR files."],
    ["Logs", "Audit downloads, activations, and important security events."]
  ];

  return (
    <main className="container py-14">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-400">Administration</p>
      <h1 className="mt-2 text-4xl font-black">Aevon Control Panel</h1>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sections.map(([title, text]) => (
          <div key={title} className="card p-6">
            <h2 className="text-lg font-black">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
            <span className="mt-6 inline-block text-xs font-bold uppercase tracking-wider text-zinc-600">Module reserved</span>
          </div>
        ))}
      </div>
    </main>
  );
}
