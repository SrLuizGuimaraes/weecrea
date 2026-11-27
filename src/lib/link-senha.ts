// Link para definir senha por e-mail. Dono: M1.
// Usado pelo M7 (aprovação do creator), pelo M11 (convite do dono da loja) e pelo "esqueci minha senha".
//
//   await enviarLinkSenha(usuarioId, 'aprovacao_creator', { loja: 'Ateliê', cupom: 'MARINA10' });
//
// Guardamos só o hash do token. O link vale 72 horas e só pode ser usado uma vez.
import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { db } from './db';
import { enviarEmail, moldeEmail } from './email';
import { gerarHashSenha } from './senha';

export type MotivoLinkSenha = 'convite_loja' | 'aprovacao_creator' | 'esqueci_senha';

const VALIDADE_HORAS: Record<MotivoLinkSenha, number> = { convite_loja: 72, aprovacao_creator: 72, esqueci_senha: 2 };

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export function urlDoApp(): string {
  return (process.env.APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')).replace(/\/$/, '');
}

/** Cria o token e devolve o link completo. */
export async function criarLinkSenha(usuarioId: string, motivo: MotivoLinkSenha): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await db.tokenSenha.create({
    data: {
      usuarioId, motivo, tokenHash: hashToken(token),
      expiraEm: new Date(Date.now() + VALIDADE_HORAS[motivo] * 3600_000),
    },
  });
  return `${urlDoApp()}/entrar/definir-senha/${token}`;
}

/** Cria o link e manda o e-mail certo para o motivo. */
export async function enviarLinkSenha(
  usuarioId: string, motivo: MotivoLinkSenha, extra: { loja?: string; cupom?: string } = {},
): Promise<{ enviado: boolean; link: string }> {
  const usuario = await db.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
  const link = await criarLinkSenha(usuarioId, motivo);
  const primeiroNome = usuario.nome.split(' ')[0];
  const conteudo =
    motivo === 'aprovacao_creator'
      ? moldeEmail({
          titulo: `Você foi aprovada(o)${extra.loja ? ` na ${extra.loja}` : ''}!`,
          paragrafos: [
            `Oi, ${primeiroNome}! Seu cadastro foi aprovado.`,
            ...(extra.cupom ? [`Seu cupom exclusivo é ${extra.cupom}. Cada venda com ele gera comissão para você.`] : []),
            'Defina sua senha para ver campanhas, enviar vídeos e acompanhar suas comissões. O link vale 72 horas.',
          ],
          botao: { texto: 'Definir minha senha', url: link },
        })
      : motivo === 'convite_loja'
        ? moldeEmail({
            titulo: `Sua loja${extra.loja ? ` ${extra.loja}` : ''} está na WEECREA`,
            paragrafos: [`Oi, ${primeiroNome}! A Weethub criou o acesso da sua loja.`, 'Defina sua senha para entrar. O link vale 72 horas.'],
            botao: { texto: 'Definir minha senha', url: link },
          })
        : moldeEmail({
            titulo: 'Redefinir senha',
            paragrafos: ['Recebemos um pedido para redefinir sua senha. Se não foi você, ignore este e-mail.', 'O link vale 2 horas.'],
            botao: { texto: 'Criar nova senha', url: link },
          });
  const assunto = motivo === 'aprovacao_creator' ? 'Cadastro aprovado: defina sua senha'
    : motivo === 'convite_loja' ? 'Convite para a WEECREA' : 'Redefinir sua senha da WEECREA';
  const r = await enviarEmail({ para: usuario.email, assunto, ...conteudo });
  return { enviado: r.enviado, link };
}

export type ResultadoToken = { ok: true; usuarioId: string } | { ok: false; erro: 'invalido' | 'expirado' | 'usado' };

/** Confere o token sem usar (para mostrar a tela certa). */
export async function conferirToken(token: string): Promise<ResultadoToken> {
  const t = await db.tokenSenha.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!t) return { ok: false, erro: 'invalido' };
  if (t.usadoEm) return { ok: false, erro: 'usado' };
  if (t.expiraEm < new Date()) return { ok: false, erro: 'expirado' };
  return { ok: true, usuarioId: t.usuarioId };
}

/** Define a senha e invalida todos os links abertos da pessoa. */
export async function definirSenhaComToken(token: string, novaSenha: string): Promise<ResultadoToken> {
  const r = await conferirToken(token);
  if (!r.ok) return r;
  const senhaHash = await gerarHashSenha(novaSenha);
  await db.$transaction([
    db.usuario.update({ where: { id: r.usuarioId }, data: { senhaHash } }),
    db.tokenSenha.updateMany({ where: { usuarioId: r.usuarioId, usadoEm: null }, data: { usadoEm: new Date() } }),
  ]);
  return r;
}
