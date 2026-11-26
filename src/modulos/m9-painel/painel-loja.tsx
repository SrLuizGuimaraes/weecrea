// Painel de vendas da loja (M9). Usado em /loja/painel e no "ver como cliente" da Weethub.
import { BarChart3, DollarSign, Film, ShoppingBag, Users, Wallet } from 'lucide-react';
import { Abas, Cartao, CartaoIndicador, Chip, Tabela, Td } from '@/componentes';
import { classeEntrada } from '@/componentes/campos';
import { BarrasHorizontais, GraficoColunas, MapaBrasil } from '@/componentes/graficos';
import { formatarReais } from '@/dominio/dinheiro';
import { formatarData } from '@/lib/datas';
import { formatarNumero } from '@/lib/dados-exemplo';
import { Pessoa } from '@/componentes/avatar';
import { lerFiltro, painelDaLoja } from './dados';

export type ParamsPainel = { dias?: string; de?: string; ate?: string; creator?: string; visao?: string };

export function PainelLoja({ lojaId, params, base }: { lojaId: string; params: ParamsPainel; base: string }) {
  const f = lerFiltro(params);
  const d = painelDaLoja(lojaId, f);
  const visao = params.visao === 'creator' ? 'creator' : 'periodo';
  const link = (extra: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const tudo = { dias: f.dias ? String(f.dias) : undefined, de: f.dias ? undefined : f.de, ate: f.dias ? undefined : f.ate, creator: f.creatorId, visao, ...extra };
    for (const [k, v] of Object.entries(tudo)) if (v) q.set(k, v);
    return `${base}?${q}`;
  };
  const i = d.indicadores;
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-cartao border border-borda bg-superficie p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[7, 30, 90].map((n) => <Chip key={n} href={link({ dias: String(n), de: undefined, ate: undefined })} ativo={f.dias === n}>{n} dias</Chip>)}
        </div>
        <form method="get" action={base} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="visao" value={visao} />
          <label className="text-xs text-suave">De<input type="date" name="de" defaultValue={f.de} className={classeEntrada} /></label>
          <label className="text-xs text-suave">Até<input type="date" name="ate" defaultValue={f.ate} className={classeEntrada} /></label>
          <label className="text-xs text-suave">Creator
            <select name="creator" defaultValue={f.creatorId ?? ''} className={classeEntrada}>
              <option value="">Todos</option>
              {d.creatorsDoFiltro.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <button type="submit" className="h-10 rounded-lg bg-texto px-4 text-sm font-medium text-fundo">Filtrar</button>
        </form>
      </div>
      <p className="text-xs text-suave">Período: {formatarData(f.de)} a {formatarData(f.ate)}. Vendas = base de comissão dos pedidos pagos com cupom de creator, menos devoluções.</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <CartaoIndicador rotulo="Vendas" valor={formatarReais(i.vendas)} icone={<DollarSign size={14} />} />
        <CartaoIndicador rotulo="Pedidos com cupom" valor={formatarNumero(i.pedidos)} icone={<ShoppingBag size={14} />} />
        <CartaoIndicador rotulo="Ticket médio" valor={formatarReais(i.ticket)} icone={<BarChart3 size={14} />} />
        <CartaoIndicador rotulo="Creators ativos" valor={i.creatorsAtivos} icone={<Users size={14} />} />
        <CartaoIndicador rotulo="Vídeos recebidos" valor={i.videos} icone={<Film size={14} />} />
        <CartaoIndicador rotulo="Comissões a pagar" valor={formatarReais(i.aPagar)} icone={<Wallet size={14} />} />
      </div>

      <Abas ativa={visao} abas={[
        { chave: 'periodo', rotulo: 'Por período', href: link({ visao: 'periodo' }) },
        { chave: 'creator', rotulo: 'Por creator', href: link({ visao: 'creator' }) },
      ]} />

      {visao === 'periodo' ? (
        <Cartao titulo={d.porSemana ? 'Vendas por semana' : 'Vendas por dia'}>
          <GraficoColunas pontos={d.serie.map((p) => ({ ...p, texto: formatarReais(p.valor) }))} />
        </Cartao>
      ) : (
        <Cartao titulo="Vendas por creator">
          <BarrasHorizontais itens={d.rankingCreators.map((c) => ({ rotulo: c.nome, valor: c.vendas, texto: formatarReais(c.vendas) }))} />
        </Cartao>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Cartao titulo="Ranking de creators">
          <Tabela colunas={['#', 'Creator', 'Cupom', 'Pedidos', 'Vendas']} alinharDireita={[3, 4]} vazio="Nenhuma venda no período.">
            {d.rankingCreators.map((c, n) => (
              <tr key={c.creatorId}><Td>{n + 1}</Td><Td><Pessoa nome={c.nome} /></Td><Td className="font-mono text-xs">{c.cupom}</Td><Td direita>{c.pedidos}</Td><Td direita>{formatarReais(c.vendas)}</Td></tr>
            ))}
          </Tabela>
        </Cartao>
        <Cartao titulo="Produtos mais vendidos">
          <Tabela colunas={['Produto', 'Unidades', 'Valor']} alinharDireita={[1, 2]} vazio="Nenhuma venda no período.">
            {d.produtos.slice(0, 8).map((p) => (
              <tr key={p.nome}><Td>{p.nome}</Td><Td direita>{p.quantidade}</Td><Td direita>{formatarReais(p.valor)}</Td></tr>
            ))}
          </Tabela>
        </Cartao>
      </div>

      <Cartao titulo="Creators aprovados por estado">
        <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
          <MapaBrasil valores={d.ufs} />
          <BarrasHorizontais itens={Object.entries(d.ufs).sort((a, b) => b[1] - a[1]).map(([uf, n]) => ({ rotulo: uf, valor: n, texto: `${n} creator${n > 1 ? 's' : ''}` }))} />
        </div>
      </Cartao>
    </div>
  );
}
