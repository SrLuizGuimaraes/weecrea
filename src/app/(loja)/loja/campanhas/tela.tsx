'use client';
// Campanhas da loja, por aba, e benefícios. Dono: M5. Estado da demonstração.
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Abas, Botao, BotaoLink, CabecalhoPagina, Campo, Etiqueta, EtiquetaStatus, Modal, Selecao, Tabela, Td, Vazio } from '@/componentes';
import { BarraProgresso } from '@/componentes/progresso';
import type { Beneficio } from '@/contratos/tipos';
import { bpsParaTexto, formatarReais } from '@/dominio/dinheiro';
import { formatarData } from '@/lib/datas';
import { useDados } from '@/lib/dados-reais-cliente';
import { criarBeneficioServidor, excluirBeneficioServidor } from '@/modulos/m5-campanhas/servidor';
import { beneficiosDaLoja, campanhasDaLoja, type Aba } from '@/modulos/m5-campanhas/dados';

const ABAS = [
  { chave: 'ativas', rotulo: 'Ativas' }, { chave: 'futuras', rotulo: 'Futuras' },
  { chave: 'encerradas', rotulo: 'Encerradas' }, { chave: 'todas', rotulo: 'Todas' }, { chave: 'beneficios', rotulo: 'Benefícios' },
];

export function descreverBeneficio(b: Pick<Beneficio, 'tipo' | 'recompensa' | 'multiplicadorX100' | 'bonusBps' | 'topN' | 'premioDescricao' | 'periodoInicio' | 'periodoFim'>) {
  const quando = b.tipo === 'meta' ? 'Ao bater a meta' : b.tipo === 'ranking' ? `Top ${b.topN ?? 3} do ranking` : `De ${b.periodoInicio ? formatarData(b.periodoInicio) : '?'} a ${b.periodoFim ? formatarData(b.periodoFim) : '?'}`;
  const oQue = b.recompensa === 'multiplicador' ? `comissão ×${(b.multiplicadorX100 ?? 100) / 100}` : b.recompensa === 'bonus_bps' ? `+${bpsParaTexto(b.bonusBps ?? 0)} de comissão` : (b.premioDescricao ?? 'prêmio');
  return `${quando}: ${oQue}`;
}

function NovoBeneficio() {
  const { executar } = useDados();
  const [tipo, setTipo] = useState<Beneficio['tipo']>('meta');
  const [recompensa, setRecompensa] = useState<Beneficio['recompensa']>('multiplicador');
  return (
    <Modal titulo="Novo benefício" gatilho={<Botao variante="secundario"><Plus size={16} />Novo benefício</Botao>}>
      {(fechar) => (
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const ok = await executar(() => criarBeneficioServidor({
            nome: String(f.get('nome')), tipo, recompensa,
            ...(recompensa === 'multiplicador' ? { multiplicadorX100: Math.round(Number(f.get('multiplicador')) * 100) } : {}),
            ...(recompensa === 'bonus_bps' ? { bonusBps: Math.round(Number(f.get('bonus')) * 100) } : {}),
            ...(recompensa === 'premio' ? { premioDescricao: String(f.get('premio')) } : {}),
            ...(tipo === 'ranking' ? { topN: Number(f.get('topN')) } : {}),
            ...(tipo === 'periodo' ? { periodoInicio: String(f.get('inicio')), periodoFim: String(f.get('fim')) } : {}),
          }), 'Benefício criado');
          if (ok) fechar();
        }}>
          <Campo rotulo="Nome" name="nome" required placeholder="Comissão em dobro" />
          <Selecao rotulo="Quando vale" value={tipo} onChange={(e) => setTipo(e.target.value as Beneficio['tipo'])}
            opcoes={[{ valor: 'meta', rotulo: 'Ao bater a meta' }, { valor: 'ranking', rotulo: 'Para os principais do ranking' }, { valor: 'periodo', rotulo: 'Num período' }]} />
          {tipo === 'ranking' && <Campo rotulo="Quantos do topo" name="topN" type="number" min="1" defaultValue={3} />}
          {tipo === 'periodo' && <div className="grid grid-cols-2 gap-3"><Campo rotulo="De" name="inicio" type="date" required /><Campo rotulo="Até" name="fim" type="date" required /></div>}
          <Selecao rotulo="Recompensa" value={recompensa} onChange={(e) => setRecompensa(e.target.value as Beneficio['recompensa'])}
            opcoes={[{ valor: 'multiplicador', rotulo: 'Multiplicar a comissão' }, { valor: 'bonus_bps', rotulo: 'Somar pontos à comissão' }, { valor: 'premio', rotulo: 'Prêmio' }]} />
          {recompensa === 'multiplicador' && <Campo rotulo="Multiplicar por" name="multiplicador" type="number" step="0.1" min="1" defaultValue={2} />}
          {recompensa === 'bonus_bps' && <Campo rotulo="Somar (%)" name="bonus" type="number" step="0.5" min="0" defaultValue={2} />}
          {recompensa === 'premio' && <Campo rotulo="Prêmio" name="premio" required placeholder="Vale-compras de R$ 500" />}
          <div className="flex justify-end"><Botao type="submit">Criar benefício</Botao></div>
        </form>
      )}
    </Modal>
  );
}

export function TelaCampanhas({ lojaId, aba: abaUrl }: { lojaId: string; aba?: string }) {
  const { D, executar } = useDados();
  const aba = ABAS.some((a) => a.chave === abaUrl) ? abaUrl! : 'ativas';
  return (
    <>
      <CabecalhoPagina titulo="Campanhas" descricao="Crie campanhas com meta, comissão e benefícios, e acompanhe o realizado."
        acoes={<BotaoLink href="/loja/campanhas/nova"><Plus size={16} />Nova campanha</BotaoLink>} />
      <div className="mb-4"><Abas ativa={aba} abas={ABAS.map((a) => ({ ...a, href: `/loja/campanhas?aba=${a.chave}` }))} /></div>

      {aba === 'beneficios' ? (
        <div className="space-y-4">
          <div className="flex justify-end"><NovoBeneficio /></div>
          <Tabela colunas={['Benefício', 'Regra', 'Em uso em', '']}>
            {beneficiosDaLoja(D, lojaId).map(({ beneficio: b, emUso }) => (
              <tr key={b.id}>
                <Td className="font-medium">{b.nome}</Td><Td>{descreverBeneficio(b)}</Td>
                <Td>{emUso.length ? emUso.join(', ') : <span className="text-suave">Nenhuma campanha</span>}</Td>
                <Td><Botao tamanho="p" variante="fantasma" aria-label="Excluir benefício"
                  onClick={() => executar(() => excluirBeneficioServidor(b.id), 'Benefício excluído')}><Trash2 size={14} /></Botao></Td>
              </tr>
            ))}
          </Tabela>
          <p className="text-xs text-suave">Benefício em uso por uma campanha não pode ser excluído.</p>
        </div>
      ) : (() => {
        const lista = campanhasDaLoja(D, lojaId, aba as Aba);
        if (!lista.length) return <Vazio titulo="Nenhuma campanha nesta aba" acao={<BotaoLink href="/loja/campanhas/nova" variante="secundario">Criar campanha</BotaoLink>} />;
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {lista.map((r) => (
              <Link key={r.campanha.id} href={`/loja/campanhas/${r.campanha.id}`} className="block rounded-cartao border border-borda bg-superficie p-4 transition hover:border-texto">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{r.campanha.nome}</h2>
                    <p className="text-xs text-suave">{formatarData(r.campanha.inicio)} a {formatarData(r.campanha.fim)} · {bpsParaTexto(r.campanha.comissaoBps)} de comissão</p>
                  </div>
                  <EtiquetaStatus status={r.campanha.status} />
                </div>
                <BarraProgresso className="mt-4" valor={r.realizado} total={r.campanha.metaCentavos} legenda={`${formatarReais(r.realizado)} de ${formatarReais(r.campanha.metaCentavos)}`} />
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
