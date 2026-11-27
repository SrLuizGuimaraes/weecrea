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
  // Identidade WEECREA: fundo off-white, cartão claro, botão amarelo com texto preto, fonte Plus Jakarta Sans (com reserva).
  // O logotipo é uma imagem servida pelo próprio app; sem APP_URL (ou com a imagem bloqueada pelo leitor de e-mail) fica o nome em texto.
  const base = (process.env.APP_URL ?? '').replace(/\/$/, '');
  const logo = base.startsWith('https://')
    ? `<img src="${base}/marca/logo-claro.png" alt="WEECREA" height="30" style="display:block;height:30px;width:auto;border:0;font:700 22px Arial,sans-serif;color:#090909">`
    : `<span style="font:800 22px Arial,sans-serif;color:#090909">weecrea</span>`;
  const html = `<div style="background:#EDE7DF;padding:24px 12px;font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;color:#090909">
<div style="max-width:520px;margin:auto;background:#FBF9F6;border-radius:16px;padding:28px">
<p style="margin:0 0 20px">${logo}</p>
<h1 style="font-size:21px;line-height:1.25;margin:0 0 12px;color:#090909">${escaparHtml(titulo)}</h1>
${paragrafos.map((p) => `<p style="line-height:1.55;margin:0 0 12px;color:#090909">${escaparHtml(p)}</p>`).join('\n')}
${botao ? `<p style="margin:20px 0 0"><a href="${escaparHtml(botao.url)}" style="display:inline-block;background:#F0C617;color:#090909;font-weight:700;padding:12px 22px;border-radius:12px;text-decoration:none">${escaparHtml(botao.texto)}</a></p>` : ''}
</div>
<p style="max-width:520px;margin:14px auto 0;text-align:center;color:#6B645B;font-size:12px">WEECREA · Your creators. Your content. Your growth.</p></div>`;
  const texto = [titulo, '', ...paragrafos, ...(botao ? ['', `${botao.texto}: ${botao.url}`] : [])].join('\n');
  return { html, texto };
}
