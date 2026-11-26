'use client';
// Ficha da empresa. Dono: M11. Estado da demonstração.
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Aviso, Botao, BotaoLink, CabecalhoPagina, Cartao, CartaoIndicador, Etiqueta, EtiquetaStatus, Selecao } from '@/componentes';
import { useToast } from '@/componentes/toast';
import type { Loja } from '@/contratos/tipos';
import { bpsParaTexto, formatarReais } from '@/dominio/dinheiro';
import { useDemo } from '@/lib/demo/estado';
import { mudarStatusEmpresa } from '@/modulos/m11-weethub/acoes';
import { resumoEmpresa } from '@/modulos/m11-weethub/dados';

export function TelaFichaEmpresa({ id }: { id: string }) {
  const { D, mudar } = useDemo();
  const toast = useToast();
  if (!D.lojas.some((l) => l.id === id)) return <Aviso tom="perigo">Empresa não encontrada. <Link href="/weethub/empresas" className="underline">Voltar</Link></Aviso>;
  const e = resumoEmpresa(D, id);
  const l = e.loja;
  return (
    <>
      <CabecalhoPagina titulo={l.nome} voltar={<Link href="/weethub/empresas">← Empresas</Link>} descricao={<a href={`/c/${l.slug}`} className="underline">/c/{l.slug}</a>}
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
            <dt className="text-suave">Dono</dt><dd>{e.dono ? `${e.dono.nome} · ${e.dono.email}` : '—'}</dd>
            <dt className="text-suave">Comissão padrão</dt><dd>{bpsParaTexto(l.comissaoPadraoBps)}</dd>
            <dt className="text-suave">Desconto do cupom</dt><dd>{l.cupomDescontoPct}%</dd>
            <dt className="text-suave">Retenção</dt><dd>{l.retencaoDias} dias</dd>
            <dt className="text-suave">Aprovação automática</dt><dd>{l.criterios.aprovacaoAutomatica ? `Ligada (mínimo ${l.criterios.seguidoresMin.toLocaleString('pt-BR')} seguidores)` : 'Desligada'}</dd>
            <dt className="text-suave">Mensalidade (exemplo)</dt><dd>{formatarReais(e.mensalidade)}</dd>
          </dl>
          <form key={l.status} className="mt-4 flex items-end gap-2" onSubmit={(ev) => {
            ev.preventDefault();
            const status = new FormData(ev.currentTarget).get('status') as Loja['status'];
            mudar((d) => mudarStatusEmpresa(d, l.id, status), status === 'suspensa' ? 'Empresa suspensa: a página de cadastro mostra "Inscrições fechadas".' : 'Status alterado');
          }}>
            <Selecao rotulo="Status da empresa" name="status" defaultValue={l.status} className="flex-1"
              opcoes={[{ valor: 'implantacao', rotulo: 'Implantação' }, { valor: 'ativa', rotulo: 'Ativa' }, { valor: 'suspensa', rotulo: 'Suspensa' }, { valor: 'cancelada', rotulo: 'Cancelada' }]} />
            <Botao type="submit" variante="secundario">Salvar</Botao>
          </form>
        </Cartao>
        <Cartao titulo="Integração">
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2">Nuvemshop: {l.nuvemshopConectada ? <Etiqueta tom="sucesso">Conectada</Etiqueta> : <Etiqueta>Desconectada</Etiqueta>}</p>
            {l.nuvemshopStoreId && <p className="text-suave">Loja Nuvemshop #{l.nuvemshopStoreId}</p>}
            <p className="text-suave">Página de cadastro: {l.paginaCadastro.aberta ? 'aberta' : 'fechada'}</p>
            <Botao variante="secundario" tamanho="p" disabled={!e.dono} onClick={() => toast(`Convite reenviado para ${e.dono?.email} (simulado).`)}>Reenviar convite ao dono</Botao>
          </div>
        </Cartao>
      </div>
    </>
  );
}
