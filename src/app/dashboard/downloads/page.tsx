import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="container py-14">
      <h1 className="text-4xl font-black">Downloads</h1>
      <div className="card mt-8 p-7">
        <p className="text-zinc-400">Authorized release downloads and download history will appear here.</p>
      </div>
    </main>
  );
}
