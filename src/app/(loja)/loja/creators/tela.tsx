'use client';
// Creators da loja: fila de aprovação, ativos e recusados. Dono: M7. Estado da demonstração.
import Link from 'next/link';
import { Abas, CabecalhoPagina, EtiquetaStatus, Tabela, Td, Vazio } from '@/componentes';
import { BotoesDecisao } from '@/modulos/m7-aprovacao/botoes';
import { useDemo } from '@/lib/demo/estado';
import { formatarReais } from '@/dominio/dinheiro';
import { formatarData } from '@/lib/datas';
import { formatarNumero } from '@/lib/demo/util';
import { Pessoa } from '@/componentes/avatar';
import { contagemPorAba, creatorsDaLoja } from '@/modulos/m7-aprovacao/dados';

type Aba = 'aprovacao' | 'ativos' | 'recusados';

export function TelaCreators({ lojaId, aba: a }: { lojaId: string; aba?: string }) {
  const { D } = useDemo();
  const aba: Aba = a === 'ativos' || a === 'recusados' ? a : 'aprovacao';
  const n = contagemPorAba(D, lojaId);
  const lista = creatorsDaLoja(D, lojaId, aba);
  return (
    <>
      <CabecalhoPagina titulo="Creators" descricao="Aprove quem pediu para entrar e acompanhe quem já vende com você."
        acoes={<Link href="/loja/configuracoes?aba=aprovacao" className="text-sm underline">Critérios de aprovação</Link>} />
      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'aprovacao', rotulo: `Aprovação (${n.aprovacao})`, href: '?aba=aprovacao' },
        { chave: 'ativos', rotulo: `Ativos (${n.ativos})`, href: '?aba=ativos' },
        { chave: 'recusados', rotulo: `Recusados e removidos (${n.recusados})`, href: '?aba=recusados' },
      ]} /></div>

      {!lista.length ? <Vazio titulo={aba === 'aprovacao' ? 'Ninguém na fila' : 'Nenhum creator aqui'}>
        {aba === 'aprovacao' ? 'Os cadastros que não passam nos critérios automáticos aparecem aqui.' : null}</Vazio>
        : aba === 'aprovacao' ? (
          <Tabela colunas={['Creator', 'Rede', 'Seguidores', 'Segmentos', 'Primeiro critério não atendido', '']}>
            {lista.map((r) => (
              <tr key={r.afiliacao.id}>
                <Td><Link href={`/loja/creators/${r.creator.id}`} className="hover:underline"><Pessoa nome={r.creator.nome} detalhe={`${r.creator.cidade}/${r.creator.uf}`} /></Link></Td>
                <Td>{r.perfil.rede} <span className="text-suave">{r.perfil.perfil}</span></Td>
                <Td>{formatarNumero(r.perfil.seguidores)}</Td>
                <Td>{r.creator.segmentos.join(', ')}</Td>
                <Td className="text-aviso">{r.afiliacao.falhasCriterios[0] ?? '—'}</Td>
                <Td><BotoesDecisao lojaId={lojaId} creatorId={r.creator.id} status={r.afiliacao.status} /></Td>
              </tr>
            ))}
          </Tabela>
        ) : (
          <Tabela colunas={['Creator', 'Status', 'Seguidores', 'Cupom', 'Vídeos', 'Pedidos', 'Vendas', aba === 'ativos' ? '' : 'Decidido em']} alinharDireita={[4, 5, 6]}>
            {lista.map((r) => (
              <tr key={r.afiliacao.id}>
                <Td><Link href={`/loja/creators/${r.creator.id}`} className="hover:underline"><Pessoa nome={r.creator.nome} detalhe={`${r.perfil.perfil}, ${r.creator.uf}`} /></Link></Td>
                <Td><EtiquetaStatus status={r.afiliacao.status} /></Td>
                <Td>{formatarNumero(r.perfil.seguidores)}</Td>
                <Td>{r.cupom ? <span className="font-mono text-xs">{r.cupom.codigo}</span> : '—'} {r.cupom && r.cupom.status !== 'ativo' && <EtiquetaStatus status={r.cupom.status} />}</Td>
                <Td direita>{r.videos}</Td><Td direita>{r.pedidos}</Td><Td direita>{formatarReais(r.vendas)}</Td>
                <Td>{aba === 'ativos'
                  ? <BotoesDecisao lojaId={lojaId} creatorId={r.creator.id} status={r.afiliacao.status} />
                  : r.afiliacao.decididaEm ? formatarData(r.afiliacao.decididaEm) : '—'}</Td>
              </tr>
            ))}
          </Tabela>
        )}
    </>
  );
}
