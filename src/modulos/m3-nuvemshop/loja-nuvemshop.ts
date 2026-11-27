// Ligação entre a loja do nosso banco e a API da Nuvemshop (M3): cliente autenticado, produtos e webhooks.
import 'server-only';
import { cifrar, decifrar } from '@/lib/cripto';
import { db } from '@/lib/db';
import { urlDoApp } from '@/lib/link-senha';
import { ClienteNuvemshop, ErroNuvemshop } from './cliente';
import { mapearProduto, type ProdutoApi } from './produto-mapa';

/** Cliente autenticado da loja. Lança erro claro se ela não estiver conectada. */
export async function clienteDaLoja(lojaId: string): Promise<ClienteNuvemshop> {
  const loja = await db.loja.findUniqueOrThrow({ where: { id: lojaId } });
  if (!loja.nuvemshopConectada || !loja.nuvemshopStoreId || !loja.nuvemshopTokenCifrado) {
    throw new Error('Esta loja não está conectada à Nuvemshop.');
  }
  return new ClienteNuvemshop({ storeId: loja.nuvemshopStoreId, token: decifrar(loja.nuvemshopTokenCifrado) });
}

export async function salvarConexao(lojaId: string, storeId: number, token: string) {
  await db.loja.update({
    where: { id: lojaId },
    data: { nuvemshopStoreId: storeId, nuvemshopConectada: true, nuvemshopTokenCifrado: cifrar(token) },
  });
}

/** Desligar do nosso lado: apaga o token. (A loja também pode desinstalar o app pelo painel dela.) */
export async function limparConexao(lojaId: string) {
  await db.loja.update({ where: { id: lojaId }, data: { nuvemshopConectada: false, nuvemshopTokenCifrado: null } });
}

// ---------- Produtos ----------

export async function gravarProduto(lojaId: string, p: ProdutoApi) {
  const d = mapearProduto(p);
  await db.produto.upsert({
    where: { lojaId_nuvemshopId: { lojaId, nuvemshopId: d.nuvemshopId } },
    create: { lojaId, ...d }, update: d,
  });
}

/** Importa todos os produtos (pode ser chamado de novo para atualizar). Devolve quantos foram gravados. */
export async function sincronizarProdutos(lojaId: string): Promise<number> {
  const cliente = await clienteDaLoja(lojaId);
  let n = 0;
  for await (const lote of cliente.paginas<ProdutoApi>('/products', { fields: 'id,name,categories,images,variants' })) {
    for (const p of lote) { await gravarProduto(lojaId, p); n += 1; }
  }
  return n;
}

/** Produto apagado na loja: some do nosso banco, salvo se alguma campanha ainda usar. */
export async function removerProduto(lojaId: string, nuvemshopId: number) {
  const p = await db.produto.findUnique({ where: { lojaId_nuvemshopId: { lojaId, nuvemshopId } } });
  if (!p) return;
  const emUso = await db.campanha.count({ where: { lojaId, produtoIds: { has: p.id } } });
  if (!emUso) await db.produto.delete({ where: { id: p.id } });
}

// ---------- Webhooks ----------

/** Avisos que a WEECREA usa. Os de LGPD (store/customer redact e data request) são configurados no Portal de Parceiros. */
export const EVENTOS_WEBHOOK = [
  'order/created', 'order/updated', 'order/paid', 'order/cancelled',
  'product/created', 'product/updated', 'product/deleted', 'app/uninstalled',
] as const;

export function urlDosWebhooks(): string { return `${urlDoApp()}/api/nuvemshop/webhooks`; }

/** Registra os avisos que faltam. Só aceita HTTPS (exigência da Nuvemshop). Devolve o que deu certo e o que falhou. */
export async function registrarWebhooks(lojaId: string): Promise<{ registrados: string[]; falhas: { evento: string; motivo: string }[] }> {
  const url = urlDosWebhooks();
  if (!url.startsWith('https://')) {
    return { registrados: [], falhas: EVENTOS_WEBHOOK.map((evento) => ({ evento, motivo: 'O endereço do app precisa ser HTTPS (APP_URL).' })) };
  }
  const cliente = await clienteDaLoja(lojaId);
  const existentes = await cliente.get<{ event: string; url: string }[]>('/webhooks').catch(() => []);
  const ja = new Set(existentes.filter((w) => w.url === url).map((w) => w.event));
  const registrados: string[] = [], falhas: { evento: string; motivo: string }[] = [];
  for (const evento of EVENTOS_WEBHOOK) {
    if (ja.has(evento)) { registrados.push(evento); continue; }
    try { await cliente.post('/webhooks', { event: evento, url }); registrados.push(evento); }
    catch (e) { falhas.push({ evento, motivo: e instanceof ErroNuvemshop ? `Nuvemshop respondeu ${e.status}` : 'Falha de rede' }); }
  }
  return { registrados, falhas };
}

/** Webhooks que a Nuvemshop diz ter registrados para o nosso endereço (consulta ao vivo; vazio se não deu para consultar). */
export async function webhooksRegistrados(lojaId: string): Promise<string[] | null> {
  try {
    const c = await clienteDaLoja(lojaId);
    const lista = await c.get<{ event: string; url: string }[]>('/webhooks');
    return lista.filter((w) => w.url === urlDosWebhooks()).map((w) => w.event);
  } catch { return null; }
}
