export default function RegisterPage() {
  return (
    <main className="container flex min-h-[75vh] items-center justify-center py-12">
      <form action="/api/auth/register" method="post" className="card w-full max-w-md p-8">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-400">Aevon Account</p>
        <h1 className="mt-2 text-3xl font-black">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-400">An account will be required before purchasing or downloading plugins.</p>

        <div className="mt-7 space-y-4">
          <input className="input" name="username" placeholder="Username" minLength={3} maxLength={24} required />
          <input className="input" name="email" type="email" placeholder="Email address" required />
          <input className="input" name="password" type="password" placeholder="Password" minLength={10} required />
          <button className="btn btn-primary w-full" type="submit">Create account</button>
        </div>
      </form>
    </main>
  );
}
