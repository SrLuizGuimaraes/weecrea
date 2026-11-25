'use server';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/lib/auth';
import { db } from '@/lib/db';
import { INICIO_DO_PERFIL } from '@/lib/perfis';

/** Só aceita voltar para um caminho interno (evita redirecionar para outro site). */
function caminhoSeguro(voltar: unknown): string | undefined {
  return typeof voltar === 'string' && voltar.startsWith('/') && !voltar.startsWith('//') ? voltar : undefined;
}

export async function entrar(form: FormData) {
  const voltar = caminhoSeguro(form.get('voltar'));
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  // Sem "voltar", cada perfil vai para a sua área. Se o "voltar" for de outra área, o proxy corrige.
  const usuario = email ? await db.usuario.findUnique({ where: { email }, select: { perfil: true } }) : null;
  try {
    await signIn('credentials', {
      email,
      senha: form.get('senha'),
      redirectTo: voltar ?? (usuario ? INICIO_DO_PERFIL[usuario.perfil] : '/'),
    });
  } catch (e) {
    if (e instanceof AuthError) {
      const params = new URLSearchParams({ erro: 'login_invalido', ...(voltar ? { voltar } : {}) });
      redirect(`/entrar?${params}`);
    }
    throw e;
  }
}

export async function sair() {
  await signOut({ redirectTo: '/entrar' });
}
