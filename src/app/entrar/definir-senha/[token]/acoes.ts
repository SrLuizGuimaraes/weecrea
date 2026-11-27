'use server';
import { redirect } from 'next/navigation';
import { definirSenhaComToken } from '@/lib/link-senha';
import { SENHA_MINIMA } from '@/lib/senha';

export async function definirSenha(form: FormData) {
  const token = String(form.get('token') ?? '');
  const senha = String(form.get('senha') ?? '');
  const confirmacao = String(form.get('confirmacao') ?? '');
  const voltar = `/entrar/definir-senha/${encodeURIComponent(token)}`;
  if (senha.length < SENHA_MINIMA) redirect(`${voltar}?erro=curta`);
  if (senha !== confirmacao) redirect(`${voltar}?erro=diferentes`);
  const r = await definirSenhaComToken(token, senha);
  if (!r.ok) redirect(voltar);
  redirect('/entrar?aviso=senha_definida');
}
