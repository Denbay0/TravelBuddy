export default function AdminLoginPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Admin Login</h1>
        <p className="mt-2 text-sm text-ink/70">UI-only placeholder for the upcoming admin authentication flow.</p>

        <form className="mt-8 space-y-5" onSubmit={(event) => event.preventDefault()}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="admin@travelbuddy.com"
              className="w-full rounded-xl border border-ink/20 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/25"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-ink/20 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/25"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-ink/90"
          >
            Sign in
          </button>
        </form>
      </div>
    </section>
  )
}
