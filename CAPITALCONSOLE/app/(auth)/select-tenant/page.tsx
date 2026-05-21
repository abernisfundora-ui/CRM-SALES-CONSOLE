import Link from 'next/link';

const tenants = ['North Region', 'LATAM HQ', 'Enterprise Demo'];

export default function SelectTenantPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center p-6">
      <section className="glass-card w-full space-y-4 p-8">
        <p className="subtle-label">Select tenant</p>
        <h1>Choose workspace</h1>
        <div className="grid gap-3">
          {tenants.map((tenant) => (
            <Link key={tenant} href="/dashboard" className="rounded-xl border border-white/15 bg-surface-1 px-4 py-3 text-sm hover:bg-surface-2">
              {tenant}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
