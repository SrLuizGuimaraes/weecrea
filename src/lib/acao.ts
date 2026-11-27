// Resultado padrão das Server Actions. Em produção o Next esconde a mensagem de erros lançados,
// então erros de regra (texto em português feito para a pessoa ler) voltam como { ok: false, erro }.
export type Resultado<T = void> = { ok: true; dado: T } | { ok: false; erro: string };

/** Erro de regra de negócio: a mensagem é mostrada à pessoa. */
export class ErroDeRegra extends Error {}

export async function comoAcao<T>(fn: () => Promise<T>): Promise<Resultado<T>> {
  try {
    return { ok: true, dado: await fn() };
  } catch (e) {
    if (e instanceof ErroDeRegra) return { ok: false, erro: e.message };
    // Erros de login/permissão e falhas inesperadas: registra no servidor e devolve texto genérico.
    if (e && typeof e === 'object' && 'digest' in e && String((e as { digest: unknown }).digest).startsWith('NEXT_')) throw e; // redirect/notFound
    console.error('[acao]', e);
    return { ok: false, erro: 'Não foi possível concluir. Tente de novo.' };
  }
}
