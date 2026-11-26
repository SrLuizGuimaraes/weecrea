// Início do creator. Dono: M9. Dados de exemplo (src/modulos/m9-painel/dados.ts).
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { BotaoLink, CabecalhoPagina, Cartao, CartaoIndicador, Chip, EtiquetaStatus, Vazio } from '@/componentes';
import { BotaoCopiar } from '@/componentes/em-breve';
import { BarraProgresso } from '@/componentes/progresso';
import { bpsParaTexto, formatarReais } from '@/dominio/dinheiro';
import { exigirCreator } from '@/lib/acesso';
import { formatarData } from '@/lib/datas';
import { inicioDoCreator } from '@/modulos/m9-painel/dados';

export default async function InicioCreator({ searchParams }: { searchParams: Promise<{ loja?: string }> }) {
  const { creatorId, nome } = await exigirCreator();
  const { loja: lojaId } = await searchParams;
  const d = inicioDoCreator(creatorId, lojaId);
  const primeiro = nome.split(' ')[0];
  if (!d.loja) {
    return (<><CabecalhoPagina titulo={`Olá, ${primeiro}`} /><Vazio titulo="Você ainda não está em nenhuma loja">Quando uma loja aprovar o seu cadastro, ela aparece aqui.</Vazio></>);
  }
  return (
    <>
      <CabecalhoPagina titulo={`Olá, ${primeiro}`} descricao={`Seus números em ${d.loja.nome} neste mês.`} />
      {d.lojas.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">{d.lojas.map((l) => <Chip key={l.id} href={`/creator/inicio?loja=${l.id}`} ativo={l.id === d.loja!.id}>{l.nome}</Chip>)}</div>
      )}

      {d.cupom && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-borda bg-superficie p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-suave">Seu cupom em {d.loja.nome}</p>
            <p className="font-mono text-2xl font-semibold tracking-wide">{d.cupom.codigo}</p>
            <p className="text-xs text-suave">{d.loja.cupomDescontoPct}% de desconto para quem comprar</p>
          </div>
          <div className="flex items-center gap-2"><EtiquetaStatus status={d.cupom.status} /><BotaoCopiar texto={d.cupom.codigo} rotulo="Copiar cupom" /></div>
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoIndicador rotulo="Vendas no mês" valor={formatarReais(d.vendas ?? 0)} />
        <CartaoIndicador rotulo="Pedidos no mês" valor={d.pedidos ?? 0} />
        <CartaoIndicador rotulo="Comissão do mês" valor={formatarReais(d.comissaoMes ?? 0)} detalhe="Prevista e liberada" />
        <CartaoIndicador rotulo="Sua posição" valor={d.posicao ? `${d.posicao}º` : '—'} detalhe={d.totalRanking ? `entre ${d.totalRanking} creators que venderam` : 'Ainda sem vendas no mês'}
          icone={<Trophy size={14} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Suas metas nas campanhas">
          {d.metas?.length ? (
            <ul className="space-y-4">
              {d.metas.map((m) => (
                <li key={m.campanha.id}>
                  <div className="mb-1 flex justify-between gap-2 text-sm"><span className="font-medium">{m.campanha.nome}</span><span className="text-suave">até {formatarData(m.campanha.fim)}</span></div>
                  <BarraProgresso valor={m.realizado} total={m.meta} legenda={`${formatarReais(m.realizado)} de ${formatarReais(m.meta)}`} />
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-suave">Nenhuma campanha ativa com meta individual.</p>}
        </Cartao>
        <Cartao titulo="Convites pendentes" acao={<Link href="/creator/campanhas" className="text-sm underline">Ver campanhas</Link>}>
          {d.convites?.length ? (
            <ul className="space-y-3">
              {d.convites.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-2 text-sm">
                  <div><p className="font-medium">{k.nome}</p><p className="text-xs text-suave">{bpsParaTexto(k.comissaoBps)} de comissão · começa {formatarData(k.inicio)}</p></div>
                  <BotaoLink tamanho="p" href={`/creator/campanhas?aba=disponiveis#${k.id}`}>Ver</BotaoLink>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-suave">Nenhum convite novo.</p>}
        </Cartao>
      </div>
    </>
  );
}
