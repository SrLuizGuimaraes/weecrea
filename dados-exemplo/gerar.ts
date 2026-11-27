// Gera dados-exemplo/dados.json no formato de src/contratos/tipos.ts.
// Rodar: npm run db:dados-exemplo. O resultado é sempre o mesmo (sorteio com semente fixa).
// Os cálculos aqui são uma cópia simples das regras, só para os dados fazerem sentido;
// a regra oficial é a de src/dominio/.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type {
  Afiliacao, Beneficio, Campanha, Colecao, Comissao, Creator, Cupom, ItemPedido, Loja,
  Pagamento, Participacao, Pedido, Produto, Usuario, Video, Rede,
} from '../src/contratos/tipos';

export interface DadosExemplo {
  geradoEm: string;
  hoje: string;
  usuarios: Usuario[];
  lojas: Loja[];
  creators: Creator[];
  afiliacoes: Afiliacao[];
  cupons: Cupom[];
  produtos: Produto[];
  beneficios: Beneficio[];
  campanhas: Campanha[];
  participacoes: Participacao[];
  pedidos: (Pedido & { emailComprador?: string })[];
  comissoes: Comissao[];
  pagamentos: Pagamento[];
  videos: Video[];
  colecoes: Colecao[];
  /** Só na demonstração: dados de pagamento do creator, já mascarados (no banco, cifrados). */
  pagamentoCreator?: Record<string, { cpfMascarado: string; tipoPix: string; pixMascarado: string }>;
}

const HOJE = '2026-11-25';

// Sorteio determinístico (mulberry32).
let semente = 20261202;
function sorteio(): number {
  semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
  let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const entre = (a: number, b: number) => a + Math.floor(sorteio() * (b - a + 1));
function escolher<T>(lista: readonly T[]): T {
  const item = lista[Math.floor(sorteio() * lista.length)];
  if (item === undefined) throw new Error('lista vazia');
  return item;
}
const dia = (iso: string, mais: number) => {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + mais);
  return d.toISOString().slice(0, 10);
};
const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

function criterios(p: Partial<Loja['criterios']> = {}): Loja['criterios'] {
  return {
    aprovacaoAutomatica: false, seguidoresMin: 0, engajamentoMinBps: 0,
    redesAceitas: ['instagram', 'tiktok'], segmentosAceitos: [], exigeTerProduto: false, ...p,
  };
}

const lojas: Loja[] = [
  {
    id: 'l1', nome: 'Ateliê Jabuticaba', slug: 'atelie-jabuticaba', status: 'ativa',
    nuvemshopStoreId: 5100001, nuvemshopConectada: true, comissaoPadraoBps: 1000, cupomDescontoPct: 10, retencaoDias: 7,
    criterios: criterios({ aprovacaoAutomatica: true, seguidoresMin: 5000, engajamentoMinBps: 200, segmentosAceitos: ['Moda', 'Lifestyle'] }),
    paginaCadastro: { titulo: 'Crie com o Ateliê Jabuticaba', texto: 'Roupas de linho feitas à mão em Minas. Ganhe comissão em cada venda com o seu cupom.', aberta: true },
  },
  {
    id: 'l2', nome: 'Casa Ipê', slug: 'casa-ipe', status: 'ativa',
    nuvemshopStoreId: 5100002, nuvemshopConectada: true, comissaoPadraoBps: 800, cupomDescontoPct: 15, retencaoDias: 7,
    criterios: criterios({ seguidoresMin: 3000, segmentosAceitos: ['Casa', 'Decoração', 'Lifestyle'] }),
    paginaCadastro: { titulo: 'Creators da Casa Ipê', texto: 'Decoração brasileira para a casa toda.', aberta: true },
  },
  {
    id: 'l3', nome: 'Bela Raiz Cosméticos', slug: 'bela-raiz', status: 'implantacao',
    nuvemshopStoreId: 5100003, nuvemshopConectada: true, comissaoPadraoBps: 1200, cupomDescontoPct: 10, retencaoDias: 14,
    criterios: criterios({ aprovacaoAutomatica: true, seguidoresMin: 10000, redesAceitas: ['tiktok'] }),
    paginaCadastro: { titulo: 'Bela Raiz Creators', texto: 'Cosméticos naturais e veganos.', aberta: false },
  },
];

const catalogo: Record<string, [string, string, number][]> = {
  l1: [['Vestido Linho Cru', 'Vestidos', 38990], ['Calça Pantalona Areia', 'Calças', 29900], ['Camisa Linho Off-white', 'Camisas', 24990],
    ['Conjunto Jabuticaba', 'Conjuntos', 45900], ['Saia Midi Terracota', 'Saias', 21990], ['Bolsa de Palha', 'Acessórios', 15990]],
  l2: [['Vaso de Cerâmica Ipê', 'Vasos', 12990], ['Manta de Algodão', 'Têxteis', 18990], ['Luminária de Palha', 'Iluminação', 34990],
    ['Jogo Americano Bordado', 'Mesa', 8990], ['Quadro Folhagens', 'Quadros', 22900]],
  l3: [['Sérum Vitamina C', 'Rosto', 8990], ['Óleo Corporal Pequi', 'Corpo', 6490], ['Máscara de Argila', 'Rosto', 5990],
    ['Kit Rotina Natural', 'Kits', 19990]],
};
const produtos: Produto[] = [];
let nsProduto = 900000;
for (const [lojaId, lista] of Object.entries(catalogo)) {
  lista.forEach(([nome, categoria, preco], i) => {
    produtos.push({ id: `${lojaId}-p${i + 1}`, lojaId, nuvemshopId: ++nsProduto, nome, categoria, precoCentavos: preco });
  });
}

type BaseCreator = [nome: string, uf: string, cidade: string, segs: string[], ig: number | null, tt: number | null, engBps: number];
const baseCreators: BaseCreator[] = [
  ['Marina Couto', 'MG', 'Belo Horizonte', ['Moda'], 48200, null, 480],
  ['Rafa Lima', 'SP', 'São Paulo', ['Lifestyle'], null, 12900, 610],
  ['Bia Torres', 'BA', 'Salvador', ['Moda'], 2100, null, 200],
  ['Júlia Andrade', 'RJ', 'Rio de Janeiro', ['Moda', 'Beleza'], 25300, 8800, 350],
  ['Pedro Sampaio', 'PR', 'Curitiba', ['Casa', 'Decoração'], 9100, null, 420],
  ['Ana Clara Reis', 'PE', 'Recife', ['Beleza'], null, 31000, 720],
  ['Lucas Ferraz', 'RS', 'Porto Alegre', ['Lifestyle', 'Casa'], 6400, 4100, 290],
  ['Camila Nóbrega', 'CE', 'Fortaleza', ['Moda', 'Lifestyle'], 15700, null, 510],
  ['Thaís Monteiro', 'SC', 'Florianópolis', ['Decoração'], 4300, null, 380],
  ['Gabriel Rocha', 'GO', 'Goiânia', ['Lifestyle'], null, 52000, 890],
  ['Larissa Prado', 'DF', 'Brasília', ['Beleza', 'Moda'], 11200, 2300, 260],
  ['Mariana Alves', 'MG', 'Juiz de Fora', ['Moda'], 7300, null, 330],
  ['Renata Duarte', 'AM', 'Manaus', ['Beleza'], null, 18400, 560],
  ['Felipe Matos', 'ES', 'Vitória', ['Casa'], 3800, null, 240],
  ['Sofia Bezerra', 'PA', 'Belém', ['Moda', 'Casa'], 21900, 15200, 470],
];

const usuarios: Usuario[] = [
  { id: 'u-weethub', email: 'weethub@exemplo.com', nome: 'Equipe Weethub', perfil: 'WEETHUB' },
  { id: 'u-l1', email: 'loja@exemplo.com', nome: 'Dona do Ateliê', perfil: 'LOJA', lojaId: 'l1' },
  { id: 'u-l2', email: 'casaipe@exemplo.com', nome: 'Dono da Casa Ipê', perfil: 'LOJA', lojaId: 'l2' },
  { id: 'u-l3', email: 'belaraiz@exemplo.com', nome: 'Dona da Bela Raiz', perfil: 'LOJA', lojaId: 'l3' },
];

const creators: Creator[] = baseCreators.map(([nome, uf, cidade, segmentos, ig, tt, eng], i) => {
  const id = `c${i + 1}`;
  const arroba = semAcento(nome).toLowerCase().replace(/[^a-z]/g, '');
  const email = i === 0 ? 'creator@exemplo.com' : `${arroba}@exemplo.com`;
  usuarios.push({ id: `u-${id}`, email, nome, perfil: 'CREATOR', creatorId: id });
  return {
    id, usuarioId: `u-${id}`, nome, email, whatsapp: `+55 ${entre(11, 99)} 9${entre(1000, 9999)}-${entre(1000, 9999)}`,
    uf, cidade, bio: `Sou ${nome.split(' ')[0]}, crio conteúdo sobre ${segmentos.join(' e ').toLowerCase()} em ${cidade}.`,
    segmentos,
    ...(ig !== null ? { instagram: { perfil: arroba, seguidores: ig } } : {}),
    ...(tt !== null ? { tiktok: { perfil: arroba, seguidores: tt } } : {}),
    engajamentoBps: eng, bloqueado: false,
  };
});

// Afiliações: [creatorId, lojaId, status]
const mapaAfiliacoes: [string, string, Afiliacao['status']][] = [
  ['c1', 'l1', 'aprovado'], ['c2', 'l1', 'aprovado'], ['c3', 'l1', 'pendente'], ['c4', 'l1', 'aprovado'],
  ['c8', 'l1', 'aprovado'], ['c12', 'l1', 'aprovado'], ['c15', 'l1', 'pausado'], ['c11', 'l1', 'recusado'],
  ['c5', 'l2', 'aprovado'], ['c7', 'l2', 'aprovado'], ['c9', 'l2', 'aprovado'], ['c14', 'l2', 'pendente'],
  ['c15', 'l2', 'aprovado'], ['c2', 'l2', 'aprovado'],
  ['c6', 'l3', 'aprovado'], ['c13', 'l3', 'aprovado'], ['c10', 'l3', 'aprovado'], ['c11', 'l3', 'pendente'],
];
const afiliacoes: Afiliacao[] = mapaAfiliacoes.map(([creatorId, lojaId, status], i) => {
  const decidida = status !== 'pendente';
  const a: Afiliacao = {
    id: `a${i + 1}`, lojaId, creatorId, status, origem: escolher(['link', 'qr_code', 'email', 'pagina'] as const),
    temProduto: sorteio() > 0.5, falhasCriterios: [],
  };
  if (status === 'pendente') a.falhasCriterios = ['Seguidores abaixo do mínimo'];
  if (decidida) { a.decisao = status === 'aprovado' && sorteio() > 0.4 ? 'automatica' : 'manual'; a.decididaEm = `2026-09-${String(entre(1, 28)).padStart(2, '0')}T15:00:00Z`; }
  if (creatorId === 'c1' && lojaId === 'l1') a.comissaoPropriaBps = 1200;
  return a;
});

// R-19 (cópia simples): primeiro nome sem acento, só letras, até 12, maiúsculas + desconto.
const cupons: Cupom[] = [];
let nsCupom = 700000;
for (const a of afiliacoes) {
  if (a.status !== 'aprovado' && a.status !== 'pausado') continue;
  const loja = lojas.find((l) => l.id === a.lojaId)!;
  const creator = creators.find((c) => c.id === a.creatorId)!;
  const nome = semAcento(creator.nome.split(' ')[0]!).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12);
  let codigo = `${nome}${loja.cupomDescontoPct}`;
  for (let n = 2; cupons.some((c) => c.lojaId === loja.id && c.codigo === codigo); n++) codigo = `${nome}${n}${loja.cupomDescontoPct}`;
  cupons.push({
    id: `cp${cupons.length + 1}`, lojaId: loja.id, creatorId: creator.id, codigo,
    ...(loja.nuvemshopConectada ? { nuvemshopId: ++nsCupom } : {}),
    status: a.status === 'pausado' ? 'pausado' : loja.nuvemshopConectada ? 'ativo' : 'erro_sync',
  });
}

const beneficios: Beneficio[] = [
  { id: 'b1', lojaId: 'l1', nome: 'Comissão em dobro ao bater a meta', tipo: 'meta', recompensa: 'multiplicador', multiplicadorX100: 200 },
  { id: 'b2', lojaId: 'l1', nome: 'Top 3 ganham um look completo', tipo: 'ranking', recompensa: 'premio', topN: 3, premioDescricao: 'Look completo à escolha' },
  { id: 'b3', lojaId: 'l2', nome: '+2% na Black Friday', tipo: 'periodo', recompensa: 'bonus_bps', bonusBps: 200, periodoInicio: '2026-11-23', periodoFim: '2026-11-30' },
  { id: 'b4', lojaId: 'l3', nome: 'Kit grátis ao bater a meta', tipo: 'meta', recompensa: 'premio', premioDescricao: 'Kit Rotina Natural' },
];

function statusCampanha(inicio: string, fim: string): Campanha['status'] {
  if (HOJE < inicio) return 'agendada';
  if (HOJE > fim) return 'encerrada';
  return 'ativa';
}
const campanhas: Campanha[] = [];
function campanha(c: Omit<Campanha, 'status' | 'visibilidade' | 'entrega' | 'tags' | 'beneficioIds'> & Partial<Campanha>) {
  campanhas.push({
    visibilidade: 'aberta', entrega: 'publicar', tags: [], beneficioIds: [],
    status: c.status ?? statusCampanha(c.inicio, c.fim), ...c,
  });
}
campanha({ id: 'k1', lojaId: 'l1', nome: 'Verão 27 no linho', produtoIds: ['l1-p1', 'l1-p2', 'l1-p3'], inicio: '2026-11-01', fim: '2026-11-30',
  metaCentavos: 2000000, metaIndividualCentavos: 300000, comissaoBps: 1500, briefing: 'Mostre o look de linho no dia a dia, com luz natural. Marque @ateliejabuticaba e use o cupom na legenda.',
  tags: ['linho', 'verão'], beneficioIds: ['b1', 'b2'], entrega: 'publicar_e_entregar' });
campanha({ id: 'k2', lojaId: 'l1', nome: 'Primavera de saias', produtoIds: ['l1-p5'], inicio: '2026-09-15', fim: '2026-10-15',
  metaCentavos: 800000, comissaoBps: 1200, briefing: 'Três formas de usar a saia midi.', tags: ['saia', 'primavera'] });
campanha({ id: 'k3', lojaId: 'l1', nome: 'Natal Jabuticaba', produtoIds: [], inicio: '2026-12-01', fim: '2026-12-24',
  metaCentavos: 3000000, comissaoBps: 1300, briefing: 'Presentes de Natal do Ateliê.', tags: ['natal'], visibilidade: 'so_convidados' });
campanha({ id: 'k4', lojaId: 'l2', nome: 'Black Friday Casa Ipê', produtoIds: [], inicio: '2026-11-20', fim: '2026-11-30',
  metaCentavos: 1500000, comissaoBps: 1000, briefing: 'Mostre um canto da sua casa com peças da Casa Ipê.', tags: ['black friday'], beneficioIds: ['b3'], entrega: 'entregar_arquivo' });
campanha({ id: 'k5', lojaId: 'l2', nome: 'Luz de outono', produtoIds: ['l2-p3'], inicio: '2026-09-01', fim: '2026-10-31',
  metaCentavos: 600000, comissaoBps: 900, briefing: 'A luminária de palha em ambientes reais.', tags: ['iluminação'] });
campanha({ id: 'k6', lojaId: 'l3', nome: 'Lançamento Sérum', produtoIds: ['l3-p1'], inicio: '2026-12-05', fim: '2026-12-31',
  metaCentavos: 1000000, comissaoBps: 1500, briefing: 'Rotina de skincare com o sérum.', tags: ['skincare'], beneficioIds: ['b4'], status: 'rascunho' });

const participacoes: Participacao[] = [];
for (const k of campanhas) {
  if (k.status === 'rascunho') continue;
  for (const a of afiliacoes.filter((x) => x.lojaId === k.lojaId && (x.status === 'aprovado' || x.status === 'pausado'))) {
    const aceito = k.status !== 'agendada' || sorteio() > 0.5;
    const aceitaEm = `${dia(k.inicio, entre(-5, 3))}T13:00:00Z`;
    participacoes.push(aceito
      ? { campanhaId: k.id, creatorId: a.creatorId, status: 'aceito', aceitaEm, comissaoBpsNoAceite: k.comissaoBps }
      : { campanhaId: k.id, creatorId: a.creatorId, status: 'convidado' });
  }
}

// ---------- Pedidos ----------
const ufs = ['SP', 'SP', 'SP', 'RJ', 'RJ', 'MG', 'MG', 'PR', 'RS', 'SC', 'BA', 'PE', 'CE', 'DF', 'GO', 'ES', 'PA', 'AM'];
const pedidos: DadosExemplo['pedidos'] = [];
const comissoes: Comissao[] = [];
let nsPedido = 300000;
const lojasComVenda = ['l1', 'l1', 'l1', 'l2', 'l2', 'l3'];
for (let i = 0; i < 120; i++) {
  const lojaId = escolher(lojasComVenda);
  const loja = lojas.find((l) => l.id === lojaId)!;
  const prods = produtos.filter((p) => p.lojaId === lojaId);
  const itens: ItemPedido[] = [];
  const nItens = entre(1, 3);
  for (let j = 0; j < nItens; j++) {
    const p = escolher(prods);
    const ja = itens.find((x) => x.produtoId === p.id);
    if (ja) { ja.quantidade++; continue; }
    itens.push({ produtoNuvemshopId: p.nuvemshopId, produtoId: p.id, nome: p.nome, quantidade: 1, precoUnitarioCentavos: p.precoCentavos });
  }
  const subtotal = itens.reduce((s, x) => s + x.quantidade * x.precoUnitarioCentavos, 0);
  const cuponsLoja = cupons.filter((c) => c.lojaId === lojaId);
  const cupom = cuponsLoja.length > 0 && sorteio() < 0.82 ? escolher(cuponsLoja) : undefined;
  const desconto = cupom ? Math.round((subtotal * loja.cupomDescontoPct) / 100) : 0;
  const frete = sorteio() < 0.3 ? 0 : entre(15, 45) * 100 + 90;
  const criadoEmDia = dia('2026-09-01', entre(0, 84));
  const criadoEm = `${criadoEmDia}T${String(entre(11, 23)).padStart(2, '0')}:${String(entre(0, 59)).padStart(2, '0')}:00Z`;
  const r = sorteio();
  const estado: Pedido['estado'] = r < 0.76 ? 'pago' : r < 0.86 ? 'cancelado' : r < 0.9 ? 'devolvido' : r < 0.94 ? 'devolvido_parcial' : 'aberto';
  const pagoEm = estado === 'aberto' || (estado === 'cancelado' && sorteio() < 0.5) ? undefined
    : new Date(Date.parse(criadoEm) + entre(10, 600) * 60000).toISOString().replace('.000Z', 'Z');
  const creator = cupom ? creators.find((c) => c.id === cupom.creatorId) : undefined;
  const autocompra = i === 17 && !!creator;
  const base = Math.max(0, subtotal - desconto);
  const primeiroItem = itens[0]!;
  const devolvido = estado === 'devolvido' ? base
    : estado === 'devolvido_parcial' ? Math.round(base * (primeiroItem.precoUnitarioCentavos / subtotal)) : 0;

  // Campanha (R-06, cópia simples): ativa no pagamento, creator aceito antes, item entre os produtos.
  let campanhaId: string | undefined;
  if (creator && pagoEm) {
    const diaPg = pagoEm.slice(0, 10);
    const candidatas = campanhas.filter((k) => k.lojaId === lojaId && k.status !== 'rascunho' && k.status !== 'cancelada'
      && k.inicio <= diaPg && diaPg <= k.fim
      && participacoes.some((p) => p.campanhaId === k.id && p.creatorId === creator.id && p.status === 'aceito' && (p.aceitaEm ?? '') < pagoEm)
      && (k.produtoIds.length === 0 || itens.some((x) => x.produtoId && k.produtoIds.includes(x.produtoId))))
      .sort((a, b) => b.comissaoBps - a.comissaoBps || a.inicio.localeCompare(b.inicio));
    campanhaId = candidatas[0]?.id;
  }

  const pedido: DadosExemplo['pedidos'][number] = {
    id: `o${i + 1}`, lojaId, nuvemshopId: ++nsPedido, numero: String(1000 + i + 1),
    ...(cupom ? { cupom: cupom.codigo } : {}), ...(creator ? { creatorId: creator.id } : {}), ...(campanhaId ? { campanhaId } : {}),
    itens, subtotalCentavos: subtotal, descontoCentavos: desconto, freteCentavos: frete, totalCentavos: subtotal - desconto + frete,
    baseComissaoCentavos: base, devolvidoCentavos: devolvido, ufComprador: escolher(ufs), estado, criadoEm,
    ...(pagoEm ? { pagoEm } : {}),
    ...(estado === 'cancelado' ? { canceladoEm: dia(criadoEmDia, entre(1, 5)) + 'T10:00:00Z' } : {}),
    autocompra, envioCreator: false,
    emailComprador: autocompra && creator ? creator.email : `cliente${i + 1}@exemplo.com`,
  };
  pedidos.push(pedido);

  // Comissão (R-07 a R-10, cópia simples)
  if (!creator || !pagoEm || autocompra) continue;
  const afil = afiliacoes.find((a) => a.lojaId === lojaId && a.creatorId === creator.id)!;
  const camp = campanhas.find((k) => k.id === campanhaId);
  const taxa = camp?.comissaoBps ?? afil.comissaoPropriaBps ?? loja.comissaoPadraoBps;
  const baseFinal = base - devolvido;
  const liberaEm = new Date(Date.parse(pagoEm) + loja.retencaoDias * 86400000).toISOString().replace('.000Z', 'Z');
  const liberada = liberaEm.slice(0, 10) <= HOJE;
  const status: Comissao['status'] = estado === 'cancelado' || estado === 'devolvido' ? 'estornada'
    : liberada ? (pagoEm < '2026-10-20' ? 'paga' : 'liberada') : 'prevista';
  comissoes.push({
    id: `cm${comissoes.length + 1}`, lojaId, creatorId: creator.id, pedidoId: pedido.id, ...(campanhaId ? { campanhaId } : {}),
    baseCentavos: status === 'estornada' ? base : baseFinal, taxaBps: taxa,
    valorCentavos: Math.round(((status === 'estornada' ? base : baseFinal) * taxa) / 10000),
    tipo: 'venda', status, liberaEm, retida: false,
  });
}

// Pagamentos: junta as comissões pagas por loja e creator.
const pagamentos: Pagamento[] = [];
const grupos = new Map<string, Comissao[]>();
for (const c of comissoes.filter((x) => x.status === 'paga')) {
  const k = `${c.lojaId}|${c.creatorId}`;
  grupos.set(k, [...(grupos.get(k) ?? []), c]);
}
for (const [k, lista] of grupos) {
  const [lojaId, creatorId] = k.split('|') as [string, string];
  const id = `pg${pagamentos.length + 1}`;
  lista.forEach((c) => { c.pagamentoId = id; });
  pagamentos.push({
    id, lojaId, creatorId, valorCentavos: lista.reduce((s, c) => s + c.valorCentavos, 0), pagoEm: '2026-11-05T14:00:00Z',
    forma: 'pix', registradoPor: lojaId === 'l1' ? 'u-l1' : lojaId === 'l2' ? 'u-l2' : 'u-l3', comissaoIds: lista.map((c) => c.id),
  });
}
// Estorno depois de pago: um pedido pago, depois devolvido, gera comissão negativa.
const pagaParaEstornar = comissoes.find((c) => c.status === 'paga');
if (pagaParaEstornar) {
  const p = pedidos.find((x) => x.id === pagaParaEstornar.pedidoId)!;
  p.estado = 'devolvido'; p.devolvidoCentavos = p.baseComissaoCentavos;
  comissoes.push({
    id: `cm${comissoes.length + 1}`, lojaId: p.lojaId, creatorId: pagaParaEstornar.creatorId, pedidoId: p.id,
    ...(pagaParaEstornar.campanhaId ? { campanhaId: pagaParaEstornar.campanhaId } : {}),
    baseCentavos: -pagaParaEstornar.baseCentavos, taxaBps: pagaParaEstornar.taxaBps, valorCentavos: -pagaParaEstornar.valorCentavos,
    tipo: 'estorno', status: 'liberada', liberaEm: '2026-11-12T12:00:00Z', retida: false,
  });
}
// Uma comissão retida (R-11) para a tela de revisão.
const paraReter = comissoes.find((c) => c.status === 'prevista');
if (paraReter) paraReter.retida = true;

// ---------- Vídeos ----------
const videos: Video[] = [];
const formatos = { instagram: ['reels', 'story', 'feed'], tiktok: ['tiktok'] } as const;
for (const p of participacoes.filter((x) => x.status === 'aceito')) {
  const k = campanhas.find((c) => c.id === p.campanhaId)!;
  if (k.status === 'agendada') continue;
  const creator = creators.find((c) => c.id === p.creatorId)!;
  const n = entre(0, 2);
  for (let j = 0; j < n; j++) {
    const rede: Rede = creator.instagram && (!creator.tiktok || sorteio() < 0.6) ? 'instagram' : 'tiktok';
    const r = sorteio();
    const status: Video['status'] = r < 0.65 ? 'aprovado' : r < 0.85 ? 'em_analise' : 'reprovado';
    const id = `v${videos.length + 1}`;
    const enviado = dia(k.inicio, entre(1, 20));
    videos.push({
      id, lojaId: k.lojaId, campanhaId: k.id, creatorId: creator.id, origem: 'creator', rede, formato: escolher(formatos[rede]),
      link: rede === 'instagram' ? `https://instagram.com/reel/exemplo-${id}` : `https://tiktok.com/@${creator.tiktok?.perfil}/video/exemplo-${id}`,
      ...(k.entrega !== 'publicar' ? { arquivoUrl: `https://exemplo.blob.vercel-storage.com/videos/${id}.mp4`, tamanhoBytes: entre(20, 280) * 1024 * 1024 } : {}),
      duracaoSeg: entre(15, 90), tags: k.tags, status, ...(status === 'reprovado' ? { motivoReprovacao: 'Produto aparece pouco no vídeo.' } : {}),
      views: entre(800, 60000), curtidas: entre(40, 4000), comentarios: entre(0, 300), publicadoEm: `${enviado}T18:00:00Z`,
      direito: k.entrega === 'publicar' ? 'organico' : 'organico_e_anuncio', enviadoEm: `${enviado}T17:00:00Z`,
    });
  }
}
videos.push({ id: `v${videos.length + 1}`, lojaId: 'l1', origem: 'upload_loja', arquivoUrl: 'https://exemplo.blob.vercel-storage.com/videos/whatsapp-cliente.mp4',
  tamanhoBytes: 45 * 1024 * 1024, duracaoSeg: 32, tags: ['cliente'], status: 'aprovado', direito: 'organico', enviadoEm: '2026-11-18T12:00:00Z' });

const colecoes: Colecao[] = [
  { id: 'col1', lojaId: 'l1', nome: 'Melhores do verão', videoIds: videos.filter((v) => v.lojaId === 'l1' && v.status === 'aprovado').slice(0, 4).map((v) => v.id) },
  { id: 'col2', lojaId: 'l2', nome: 'Para anúncio', videoIds: videos.filter((v) => v.lojaId === 'l2' && v.direito === 'organico_e_anuncio').slice(0, 3).map((v) => v.id) },
];

const dados: DadosExemplo = {
  geradoEm: '2026-11-25', hoje: HOJE, usuarios, lojas, creators, afiliacoes, cupons, produtos, beneficios, campanhas,
  participacoes, pedidos, comissoes, pagamentos, videos, colecoes,
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const destino = fileURLToPath(new URL('./dados.json', import.meta.url));
  writeFileSync(destino, JSON.stringify(dados, null, 1) + '\n');
  console.log(`dados.json: ${lojas.length} lojas, ${creators.length} creators, ${afiliacoes.length} afiliações, ${campanhas.length} campanhas, ${pedidos.length} pedidos, ${comissoes.length} comissões, ${pagamentos.length} pagamentos, ${videos.length} vídeos.`);
}
