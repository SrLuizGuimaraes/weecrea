import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/componentes/marca';
import { entrar } from './acoes';

export const metadata: Metadata = { title: 'Entrar · WEECREA' };

const MENSAGENS: Record<string, string> = {
  login_invalido: 'E-mail ou senha incorretos.',
  senha_definida: 'Senha definida. Entre com o seu e-mail e a nova senha.',
};

export default async function Entrar({ searchParams }: { searchParams: Promise<{ voltar?: string; aviso?: string; erro?: string }> }) {
  const { voltar, aviso, erro } = await searchParams;
  const mensagem = (erro && MENSAGENS[erro]) || (aviso && MENSAGENS[aviso]);
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form action={entrar} className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--borda)] bg-superficie p-6">
        <div>
          <h1 className="sr-only">WEECREA</h1>
          <Logo alturaClasse="h-9" className="mb-3" />
          <p className="text-sm opacity-70">Entre na sua conta</p>
        </div>
        {!process.env.DATABASE_URL && (
          <p role="status" className="rounded-lg bg-aviso-fraco px-3 py-2 text-sm text-aviso">
            Ambiente em preparação: o banco de dados ainda não foi ligado, então o login não funciona aqui por enquanto.
          </p>
        )}
        {mensagem && (
          <p role="status" className={`rounded-lg px-3 py-2 text-sm ${erro ? 'bg-perigo-fraco text-perigo' : 'bg-sucesso-fraco text-sucesso'}`}>
            {mensagem}
          </p>
        )}
        <input type="hidden" name="voltar" value={voltar ?? ''} />
        <label className="block space-y-1">
          <span className="text-sm font-medium">E-mail</span>
          <input name="email" type="email" required autoComplete="email"
            className="w-full rounded-lg border border-[var(--borda)] bg-transparent px-3 py-2" />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Senha</span>
          <input name="senha" type="password" required autoComplete="current-password"
            className="w-full rounded-lg border border-[var(--borda)] bg-transparent px-3 py-2" />
        </label>
        <button type="submit" className="w-full rounded-lg bg-destaque px-3 py-2 font-medium text-destaque-texto">
          Entrar
        </button>
        <p className="text-center text-sm opacity-70">
          <Link href="/entrar/esqueci" className="underline">Esqueci minha senha</Link>
        </p>
      </form>
    </main>
  );
}
