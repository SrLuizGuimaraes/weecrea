'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { enviarLinkSenha } from '@/lib/link-senha';

export async function pedirLink(form: FormData) {
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const usuario = email ? await db.usuario.findUnique({ where: { email }, select: { id: true } }) : null;
  // A resposta é a mesma exista ou não o e-mail, para não revelar quem tem conta.
  if (usuario) await enviarLinkSenha(usuario.id, 'esqueci_senha');
  redirect('/entrar/esqueci?enviado=1');
}
