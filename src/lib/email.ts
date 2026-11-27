// Envio de e-mail (Resend). Dono: M1.
// Sem RESEND_API_KEY (desenvolvimento local), o e-mail é só mostrado no terminal.
import 'server-only';
import { Resend } from 'resend';

export interface Email { para: string | string[]; assunto: string; html: string; texto: string }

const REMETENTE_PADRAO = 'WEECREA <onboarding@resend.dev>';

export async function enviarEmail(email: Email): Promise<{ enviado: boolean; id?: string; simulado?: boolean }> {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    console.info(`\n[e-mail simulado] para: ${[email.para].flat().join(', ')}\nassunto: ${email.assunto}\n${email.texto}\n`);
    return { enviado: true, simulado: true };
  }
  const resend = new Resend(chave);
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_REMETENTE ?? REMETENTE_PADRAO,
    to: email.para,
    subject: email.assunto,
    html: email.html,
    text: email.texto,
  });
  if (error) {
    console.error('[e-mail] falhou:', error.message);
    return { enviado: false };
  }
  return { enviado: true, id: data?.id };
}

/** Escapa texto para colocar no HTML do e-mail. */
export function escaparHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Molde simples de e-mail: título, parágrafos e um botão. */
export function moldeEmail({ titulo, paragrafos, botao }: { titulo: string; paragrafos: string[]; botao?: { texto: string; url: string } }) {
  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;color:#111">
<h1 style="font-size:20px">${escaparHtml(titulo)}</h1>
${paragrafos.map((p) => `<p style="line-height:1.5">${escaparHtml(p)}</p>`).join('\n')}
${botao ? `<p><a href="${escaparHtml(botao.url)}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${escaparHtml(botao.texto)}</a></p>` : ''}
<p style="color:#888;font-size:12px">WEECREA · Weethub</p></div>`;
  const texto = [titulo, '', ...paragrafos, ...(botao ? ['', `${botao.texto}: ${botao.url}`] : [])].join('\n');
  return { html, texto };
}
