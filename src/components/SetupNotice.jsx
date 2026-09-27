export default function SetupNotice() {
  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <p className="eyebrow">HABIT TRACKER</p>
        <h1>Connect Supabase</h1>
        <p className="intro">
          Add VITE_SUPABASE_URL and VITE_SUPABASE_KEY to your local .env file, then restart Vite.
        </p>
      </section>
    </main>
  )
}