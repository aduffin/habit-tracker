export default function Dashboard({ user }) {
  return (
    <main className="dashboard-layout">
      <section className="dashboard-panel">
        <p className="eyebrow">HABIT TRACKER</p>
        <h1>Your dashboard</h1>
        <p className="intro">Logged in as <strong>{user.email}</strong></p>
      </section>
    </main>
  )
}