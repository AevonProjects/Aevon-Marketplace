export default function LoginPage() {
  return (
    <main className="container flex min-h-[75vh] items-center justify-center py-12">
      <form action="/api/auth/login" method="post" className="card w-full max-w-md p-8">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-400">Welcome back</p>
        <h1 className="mt-2 text-3xl font-black">Sign in</h1>
        <div className="mt-7 space-y-4">
          <input className="input" name="email" type="email" placeholder="Email address" required />
          <input className="input" name="password" type="password" placeholder="Password" required />
          <button className="btn btn-primary w-full" type="submit">Login</button>
        </div>
      </form>
    </main>
  );
}
