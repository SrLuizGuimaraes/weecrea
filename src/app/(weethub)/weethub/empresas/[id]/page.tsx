// Ficha da empresa. Dono: M11. Dados de exemplo.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eye } from 'lucide-react';
import { BotaoLink, CabecalhoPagina, Cartao, CartaoIndicador, Etiqueta, EtiquetaStatus, Selecao } from '@/componentes';
import { BotaoEmBreve, FormSimulado } from '@/componentes/em-breve';
import { Botao } from '@/componentes/botao';
import { bpsParaTexto, formatarReais } from '@/dominio/dinheiro';
import { exigirWeethub } from '@/lib/acesso';
import { dados } from '@/lib/dados-exemplo';
import { resumoEmpresa } from '@/modulos/m11-weethub/dados';

export default async function FichaEmpresa({ params }: { params: Promise<{ id: string }> }) {
  await exigirWeethub();
  const { id } = await params;
  if (!dados.lojas.some((l) => l.id === id)) notFound();
  const e = resumoEmpresa(id);
  const l = e.loja;
  return (
    <>
      <CabecalhoPagina titulo={l.nome} voltar={<Link href="/weethub/empresas">← Empresas</Link>} descricao={`/c/${l.slug}`}
        acoes={<><EtiquetaStatus status={l.status} /><BotaoLink href={`/weethub/empresas/${l.id}/ver`}><Eye size={16} />Ver como cliente</BotaoLink></>} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoIndicador rotulo="Vendas com creators" valor={formatarReais(e.vendas)} detalhe={`${e.pedidos} pedidos`} />
        <CartaoIndicador rotulo="Creators aprovados" valor={e.creators} detalhe={`${e.pendentes} na fila`} />
        <CartaoIndicador rotulo="Campanhas ativas" valor={e.campanhas} />
        <CartaoIndicador rotulo="Vídeos" valor={e.videos} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Resumo">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-suave">Dono</dt><dd>{e.dono?.nome} · {e.dono?.email}</dd>
            <dt className="text-suave">Comissão padrão</dt><dd>{bpsParaTexto(l.comissaoPadraoBps)}</dd>
            <dt className="text-suave">Desconto do cupom</dt><dd>{l.cupomDescontoPct}%</dd>
            <dt className="text-suave">Retenção</dt><dd>{l.retencaoDias} dias</dd>
            <dt className="text-suave">Aprovação automática</dt><dd>{l.criterios.aprovacaoAutomatica ? `Ligada (mínimo ${l.criterios.seguidoresMin.toLocaleString('pt-BR')} seguidores)` : 'Desligada'}</dd>
            <dt className="text-suave">Mensalidade (exemplo)</dt><dd>{formatarReais(e.mensalidade)}</dd>
          </dl>
          <FormSimulado mensagem="Status alterado (simulação)." className="mt-4 flex items-end gap-2">
            <Selecao rotulo="Status da empresa" defaultValue={l.status} className="flex-1"
              opcoes={[{ valor: 'implantacao', rotulo: 'Implantação' }, { valor: 'ativa', rotulo: 'Ativa' }, { valor: 'suspensa', rotulo: 'Suspensa' }, { valor: 'cancelada', rotulo: 'Cancelada' }]} />
            <Botao type="submit" variante="secundario">Salvar</Botao>
          </FormSimulado>
        </Cartao>
        <Cartao titulo="Integração">
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2">Nuvemshop: {l.nuvemshopConectada ? <Etiqueta tom="sucesso">Conectada</Etiqueta> : <Etiqueta>Desconectada</Etiqueta>}</p>
            {l.nuvemshopStoreId && <p className="text-suave">Loja Nuvemshop #{l.nuvemshopStoreId}</p>}
            <p className="text-suave">Página de cadastro: {l.paginaCadastro.aberta ? 'aberta' : 'fechada'}</p>
            <div className="flex flex-wrap gap-2">
              <BotaoEmBreve variante="secundario" tamanho="p" mensagem="Convite reenviado ao dono (simulação).">Reenviar convite ao dono</BotaoEmBreve>
              <BotaoEmBreve variante="secundario" tamanho="p" mensagem="Conferindo pedidos dos últimos 7 dias (simulação).">Conferir pedidos</BotaoEmBreve>
            </div>
          </div>
        </Cartao>
      </div>
    </>
  );
}
