// Campanhas da loja, por aba. Dono: M5. Dados de exemplo (src/modulos/m5-campanhas/dados.ts).
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Abas, BotaoLink, CabecalhoPagina, Etiqueta, EtiquetaStatus, Tabela, Td, Vazio } from '@/componentes';
import { BotaoEmBreve } from '@/componentes/em-breve';
import { BarraProgresso } from '@/componentes/progresso';
import { formatarReais, bpsParaTexto } from '@/dominio/dinheiro';
import { exigirLoja } from '@/lib/acesso';
import { formatarData } from '@/lib/datas';
import { beneficiosDaLoja, campanhasDaLoja, type Aba } from '@/modulos/m5-campanhas/dados';

const ABAS = [
  { chave: 'ativas', rotulo: 'Ativas' }, { chave: 'futuras', rotulo: 'Futuras' },
  { chave: 'encerradas', rotulo: 'Encerradas' }, { chave: 'todas', rotulo: 'Todas' }, { chave: 'beneficios', rotulo: 'Benefícios' },
];

const descreverBeneficio = (b: { tipo: string; recompensa: string; multiplicadorX100?: number; bonusBps?: number; topN?: number; premioDescricao?: string; periodoInicio?: string; periodoFim?: string }) => {
  const quando = b.tipo === 'meta' ? 'Ao bater a meta' : b.tipo === 'ranking' ? `Top ${b.topN ?? 3} do ranking` : `De ${formatarData(b.periodoInicio!)} a ${formatarData(b.periodoFim!)}`;
  const o_que = b.recompensa === 'multiplicador' ? `comissão ×${(b.multiplicadorX100 ?? 100) / 100}` : b.recompensa === 'bonus_bps' ? `+${bpsParaTexto(b.bonusBps ?? 0)} de comissão` : (b.premioDescricao ?? 'prêmio');
  return `${quando}: ${o_que}`;
};

export default async function Campanhas({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba: abaUrl } = await searchParams;
  const aba = ABAS.some((a) => a.chave === abaUrl) ? abaUrl! : 'ativas';
  return (
    <>
      <CabecalhoPagina titulo="Campanhas" descricao="Crie campanhas com meta, comissão e benefícios, e acompanhe o realizado."
        acoes={<BotaoLink href="/loja/campanhas/nova"><Plus size={16} />Nova campanha</BotaoLink>} />
      <div className="mb-4"><Abas ativa={aba} abas={ABAS.map((a) => ({ ...a, href: `/loja/campanhas?aba=${a.chave}` }))} /></div>

      {aba === 'beneficios' ? (
        <div className="space-y-4">
          <div className="flex justify-end"><BotaoEmBreve variante="secundario"><Plus size={16} />Novo benefício</BotaoEmBreve></div>
          <Tabela colunas={['Benefício', 'Regra', 'Em uso em']}>
            {beneficiosDaLoja(lojaId).map(({ beneficio: b, emUso }) => (
              <tr key={b.id}>
                <Td className="font-medium">{b.nome}</Td>
                <Td>{descreverBeneficio(b)}</Td>
                <Td>{emUso.length ? emUso.join(', ') : <span className="text-suave">Nenhuma campanha</span>}</Td>
              </tr>
            ))}
          </Tabela>
          <p className="text-xs text-suave">Benefício em uso por uma campanha não pode ser excluído.</p>
        </div>
      ) : (() => {
        const lista = campanhasDaLoja(lojaId, aba as Aba);
        if (!lista.length) return <Vazio titulo="Nenhuma campanha nesta aba" acao={<BotaoLink href="/loja/campanhas/nova" variante="secundario">Criar campanha</BotaoLink>} />;
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {lista.map((r) => (
              <Link key={r.campanha.id} href={`/loja/campanhas/${r.campanha.id}`}
                className="block rounded-xl border border-borda bg-superficie p-4 transition hover:border-texto">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{r.campanha.nome}</h2>
                    <p className="text-xs text-suave">{formatarData(r.campanha.inicio)} a {formatarData(r.campanha.fim)} · {bpsParaTexto(r.campanha.comissaoBps)} de comissão</p>
                  </div>
                  <EtiquetaStatus status={r.campanha.status} />
                </div>
                <BarraProgresso className="mt-4" valor={r.realizado} total={r.campanha.metaCentavos}
                  legenda={`${formatarReais(r.realizado)} de ${formatarReais(r.campanha.metaCentavos)}`} />
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-suave">
                  <span>{r.participantes} participando</span><span>·</span><span>{r.pedidos} pedidos</span><span>·</span><span>{r.videos} vídeos</span>
                  {r.campanha.visibilidade === 'so_convidados' && <Etiqueta tom="info">Só convidados</Etiqueta>}
                  {r.beneficios.map((b) => <Etiqueta key={b.id} tom="destaque">{b.nome}</Etiqueta>)}
                </div>
              </Link>
            ))}
          </div>
        );
      })()}
    </>
  );
}
