import { Logo } from '@/componentes/marca';
import type { Metadata } from 'next';
import Link from 'next/link';
import { pedirLink } from './acoes';

export const metadata: Metadata = { title: 'Esqueci minha senha · WEECREA' };

export default async function Esqueci({ searchParams }: { searchParams: Promise<{ enviado?: string }> }) {
  const { enviado } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form action={pedirLink} className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--borda)] p-6">
        <Logo alturaClasse="h-8" className="mb-2" />
        <h1 className="text-xl font-semibold">Esqueci minha senha</h1>
        {enviado ? (
          <p role="status">Se o e-mail estiver cadastrado, você vai receber um link em instantes.</p>
        ) : (
          <>
            <label className="block space-y-1">
              <span className="text-sm font-medium">E-mail</span>
              <input name="email" type="email" required autoComplete="email"
                className="w-full rounded-lg border border-[var(--borda)] bg-transparent px-3 py-2" />
            </label>
            <button type="submit" className="w-full rounded-lg bg-destaque px-3 py-2 font-medium text-destaque-texto">Enviar link</button>
          </>
        )}
        <Link href="/entrar" className="block text-center text-sm underline">Voltar</Link>
      </form>
    </main>
  );
}
