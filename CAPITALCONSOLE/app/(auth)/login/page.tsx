import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-6">
      <section className="glass-card grid w-full max-w-4xl gap-6 p-8 md:grid-cols-2">
        <div>
          <p className="subtle-label">Piloto Enterprise</p>
          <h1 className="mt-2">Welcome back</h1>
          <p className="mt-3 text-sm text-slate-300">Modern sales operating system for multi-tenant teams.</p>
        </div>
        <div className="space-y-3">
          <Input />
          <Input />
          <Button className="w-full">Sign in</Button>
        </div>
      </section>
    </main>
  );
}
