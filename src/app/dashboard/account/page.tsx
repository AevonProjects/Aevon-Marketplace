import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="container py-14">
      <h1 className="text-4xl font-black">Account</h1>
      <div className="card mt-8 p-7">
        <p className="text-zinc-400">Profile settings, email verification, password changes, and security options will live here.</p>
      </div>
    </main>
  );
}
