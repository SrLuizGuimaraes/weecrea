// Quem está usando e o que pode ver. Dono: M1.
// Use no começo de toda página, Server Action e rota que lê ou grava dados:
//   const { lojaId } = await exigirLoja();      // e filtre tudo por lojaId
//   const { creatorId } = await exigirCreator(); // e filtre tudo por creatorId
// Nunca confie em lojaId ou creatorId vindos da URL ou do formulário.
import 'server-only';
import { redirect } from 'next/navigation';
import type { Perfil, Usuario } from '@/contratos/tipos';
import { auth } from './auth';
import { INICIO_DO_PERFIL } from './perfis';

export async function usuarioAtual(): Promise<Usuario | null> {
  const sessao = await auth();
  const u = sessao?.user;
  if (!u?.id || !u.perfil || !u.email) return null;
  return {
    id: u.id, email: u.email, nome: u.name ?? u.email, perfil: u.perfil,
    ...(u.lojaId ? { lojaId: u.lojaId } : {}), ...(u.creatorId ? { creatorId: u.creatorId } : {}),
  };
}

export async function exigirPerfil(perfil: Perfil): Promise<Usuario> {
  const u = await usuarioAtual();
  if (!u) redirect('/entrar');
  if (u.perfil !== perfil) redirect(INICIO_DO_PERFIL[u.perfil]);
  return u;
}

export async function exigirLoja(): Promise<Usuario & { lojaId: string }> {
  const u = await exigirPerfil('LOJA');
  if (!u.lojaId) throw new Error('Usuário de loja sem loja ligada.');
  return { ...u, lojaId: u.lojaId };
}

export async function exigirCreator(): Promise<Usuario & { creatorId: string }> {
  const u = await exigirPerfil('CREATOR');
  if (!u.creatorId) throw new Error('Usuário creator sem cadastro de creator.');
  return { ...u, creatorId: u.creatorId };
}

export function exigirWeethub(): Promise<Usuario> {
  return exigirPerfil('WEETHUB');
}
