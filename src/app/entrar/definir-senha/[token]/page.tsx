import { Logo } from '@/componentes/marca';
import type { Metadata } from 'next';
import Link from 'next/link';
import { conferirToken } from '@/lib/link-senha';
import { SENHA_MINIMA } from '@/lib/senha';
import { definirSenha } from './acoes';

export const metadata: Metadata = { title: 'Definir senha · WEECREA' };

const ERROS: Record<string, string> = {
  diferentes: 'As duas senhas não são iguais.',
  curta: `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`,
};
const LINK_RUIM: Record<string, string> = {
  invalido: 'Este link não é válido.',
  expirado: 'Este link expirou.',
  usado: 'Este link já foi usado.',
};

export default async function DefinirSenha({ params, searchParams }: {
  params: Promise<{ token: string }>; searchParams: Promise<{ erro?: string }>;
}) {
  const { token } = await params;
  const { erro } = await searchParams;
  const r = await conferirToken(token);
  const campo = 'w-full rounded-lg border border-[var(--borda)] bg-transparent px-3 py-2';
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--borda)] p-6">
        <Logo alturaClasse="h-8" className="mb-2" />
        <h1 className="text-xl font-semibold">Definir senha</h1>
        {!r.ok ? (
          <>
            <p>{LINK_RUIM[r.erro]}</p>
            <Link href="/entrar/esqueci" className="underline">Pedir um link novo</Link>
          </>
        ) : (
          <form action={definirSenha} className="space-y-4">
            {erro && ERROS[erro] && <p role="alert" className="rounded-lg bg-perigo-fraco px-3 py-2 text-sm text-perigo">{ERROS[erro]}</p>}
            <input type="hidden" name="token" value={token} />
            <label className="block space-y-1">
              <span className="text-sm font-medium">Nova senha</span>
              <input name="senha" type="password" minLength={SENHA_MINIMA} required autoComplete="new-password" className={campo} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Repita a senha</span>
              <input name="confirmacao" type="password" minLength={SENHA_MINIMA} required autoComplete="new-password" className={campo} />
            </label>
            <button type="submit" className="w-full rounded-lg bg-destaque px-3 py-2 font-medium text-destaque-texto">Salvar senha</button>
          </form>
        )}
      </div>
    </main>
  );
}
