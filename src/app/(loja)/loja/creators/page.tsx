// Creators da loja: fila de aprovação, ativos e recusados. Dono: M7. Dados de exemplo.
import Link from 'next/link';
import { Abas, CabecalhoPagina, EtiquetaStatus, Tabela, Td, Vazio } from '@/componentes';
import { BotaoEmBreve } from '@/componentes/em-breve';
import { formatarReais } from '@/dominio/dinheiro';
import { exigirLoja } from '@/lib/acesso';
import { formatarData } from '@/lib/datas';
import { formatarNumero } from '@/lib/dados-exemplo';
import { Pessoa } from '@/componentes/avatar';
import { contagemPorAba, creatorsDaLoja } from '@/modulos/m7-aprovacao/dados';

type Aba = 'aprovacao' | 'ativos' | 'recusados';

export default async function Creators({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba: a } = await searchParams;
  const aba: Aba = a === 'ativos' || a === 'recusados' ? a : 'aprovacao';
  const n = contagemPorAba(lojaId);
  const lista = creatorsDaLoja(lojaId, aba);
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
                <Td><div className="flex justify-end gap-2">
                  <BotaoEmBreve tamanho="p" variante="secundario" mensagem="Recusado (simulação). O creator recebe um e-mail cordial.">Recusar</BotaoEmBreve>
                  <BotaoEmBreve tamanho="p" mensagem="Aprovado (simulação): cupom criado na loja e e-mail com link de senha enviado.">Aprovar</BotaoEmBreve>
                </div></Td>
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
                  ? <div className="flex justify-end gap-2">
                      <BotaoEmBreve tamanho="p" variante="secundario" mensagem={r.afiliacao.status === 'pausado' ? 'Reativado (simulação).' : 'Pausado (simulação): o cupom foi pausado na loja.'}>{r.afiliacao.status === 'pausado' ? 'Reativar' : 'Pausar'}</BotaoEmBreve>
                      <BotaoEmBreve tamanho="p" variante="fantasma" mensagem="Removido (simulação): o cupom foi desativado na loja.">Remover</BotaoEmBreve>
                    </div>
                  : r.afiliacao.decididaEm ? formatarData(r.afiliacao.decididaEm) : '—'}</Td>
              </tr>
            ))}
          </Tabela>
        )}
    </>
  );
}
