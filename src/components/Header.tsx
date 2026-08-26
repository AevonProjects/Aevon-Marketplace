import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="container flex min-h-16 items-center justify-between">
        <Link href="/" className="font-black tracking-wide">
          AEVON <span className="text-violet-400">MARKETPLACE</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm text-zinc-300">
          <Link href="/plugins">Plugins</Link>
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
              <form action="/api/auth/logout" method="post">
                <button className="btn btn-secondary" type="submit">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register" className="btn btn-primary">Create account</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
