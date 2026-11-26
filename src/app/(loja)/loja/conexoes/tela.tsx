'use client';
// Conexões (M3) e pedidos recebidos (M4). Estado da demonstração: a Nuvemshop é simulada e os pedidos de teste
// passam pelas mesmas regras (atribuição R-01 a R-06 e comissão R-07 a R-10) que o webhook real vai usar.
import { CheckCircle2, Link2, Plus } from 'lucide-react';
import { useState } from 'react';
import { Abas, Aviso, Botao, CabecalhoPagina, Campo, Cartao, CartaoIndicador, Etiqueta, EtiquetaStatus, Modal, Selecao, Tabela, Td } from '@/componentes';
import { useToast } from '@/componentes/toast';
import { formatarReais, paraCentavos } from '@/dominio/dinheiro';
import { formatarDataHora } from '@/lib/datas';
import { useDemo } from '@/lib/demo/estado';
import { conectarNuvemshop, desconectarNuvemshop } from '@/modulos/m3-nuvemshop/acoes';
import { conexaoDaLoja } from '@/modulos/m3-nuvemshop/dados';
import { cancelarOuDevolver, criarPedidoTeste, pagarPedido } from '@/modulos/m4-vendas/acoes';

const UFS = 'SP RJ MG PR RS SC BA PE CE DF GO ES PA AM'.split(' ');

export function TelaConexoes({ lojaId, aba: a }: { lojaId: string; aba?: string }) {
  const { D, mudar } = useDemo();
  const aba = a === 'pedidos' ? 'pedidos' : 'integracoes';
  const c = conexaoDaLoja(D, lojaId);
  const conectada = c.loja.nuvemshopConectada;
  return (
    <>
      <CabecalhoPagina titulo="Conexões" descricao="Ligue a sua loja Nuvemshop para importar produtos, criar cupons e receber os pedidos." />
      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'integracoes', rotulo: 'Integrações', href: '?aba=integracoes' },
        { chave: 'pedidos', rotulo: `Pedidos recebidos (${c.pedidos})`, href: '?aba=pedidos' },
      ]} /></div>
      {aba === 'pedidos' ? <Pedidos lojaId={lojaId} /> : (
        <div className="space-y-4">
          <Cartao titulo={<span className="flex items-center gap-2"><Link2 size={16} />Nuvemshop</span>}
            acao={conectada ? <Etiqueta tom="sucesso"><CheckCircle2 size={12} className="mr-1" />Conectada</Etiqueta> : <Etiqueta>Desconectada</Etiqueta>}>
            {conectada ? (
              <div className="space-y-4">
                <p className="text-sm">Loja Nuvemshop <b>#{c.loja.nuvemshopStoreId}</b> ligada à <b>{c.loja.nome}</b>.</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <CartaoIndicador rotulo="Produtos importados" valor={c.produtos} />
                  <CartaoIndicador rotulo="Pedidos recebidos" valor={c.pedidos} />
                  <CartaoIndicador rotulo="Último aviso" valor={<span className="text-base">{c.ultimoAviso ? formatarDataHora(c.ultimoAviso) : '—'}</span>} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Avisos registrados (webhooks)</p>
                  <div className="flex flex-wrap gap-2">{c.webhooks.map((w) => <Etiqueta key={w}>{w}</Etiqueta>)}</div>
                </div>
                <Botao variante="fantasma" onClick={() => mudar((d) => desconectarNuvemshop(d, lojaId), 'Nuvemshop desconectada. Os cupons novos ficam com erro até conectar de novo.')}>Desconectar</Botao>
              </div>
            ) : (
              <div className="space-y-4">
                <Aviso tom="info">Ao conectar, a WEECREA importa os produtos, registra os avisos de pedidos e passa a criar os cupons dos creators direto na sua loja.</Aviso>
                <Botao onClick={() => { let n = 0; if (mudar((d) => { n = conectarNuvemshop(d, lojaId); })) mudar(() => {}, `Nuvemshop conectada (simulado)${n ? `. ${n} cupom(ns) pendente(s) criado(s) na loja.` : '.'}`); }}>Conectar Nuvemshop</Botao>
              </div>
            )}
          </Cartao>
          <div className="grid gap-4 md:grid-cols-2">
            {['Instagram', 'TikTok'].map((r) => (
              <Cartao key={r} titulo={r} acao={<Etiqueta tom="info">Fase 2</Etiqueta>}>
                <p className="text-sm text-suave">Busca automática dos vídeos que marcam a loja. Entra depois de 02/12; por enquanto os creators enviam o link em Conteúdos.</p>
                <Botao className="mt-3" variante="secundario" disabled>Conectar {r}</Botao>
              </Cartao>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Pedidos({ lojaId }: { lojaId: string }) {
  const { D, mudar } = useDemo();
  const toast = useToast();
  const [itens, setItens] = useState<Record<string, number>>({});
  const produtos = D.produtos.filter((p) => p.lojaId === lojaId);
  const pedidos = D.pedidos.filter((p) => p.lojaId === lojaId).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 30);
  const nome = (id?: string) => D.creators.find((c) => c.id === id)?.nome;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-suave">Os últimos 30 pedidos que a Nuvemshop avisou. Use o pedido de teste para ver venda, comissão e estorno.</p>
        <Modal titulo="Pedido de teste" largura="max-w-xl" gatilho={<Botao><Plus size={16} />Pedido de teste</Botao>}>
          {(fechar) => (
            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              let r: ReturnType<typeof criarPedidoTeste> | undefined;
              const ok = mudar((d) => { r = criarPedidoTeste(d, lojaId, {
                cupom: String(f.get('cupom') ?? ''), itens: Object.entries(itens).map(([produtoId, quantidade]) => ({ produtoId, quantidade })),
                freteCentavos: f.get('frete') ? paraCentavos(String(f.get('frete'))) : 0, emailComprador: String(f.get('email')),
                ufComprador: String(f.get('uf')), pagar: f.get('pagar') === 'sim',
              }); });
              if (ok && r) {
                toast(r.geraComissao ? 'Pedido pago: venda atribuída e comissão gerada.' : `Pedido criado sem comissão: ${r.motivo ?? 'sem cupom de creator'}.`, r.geraComissao ? 'sucesso' : 'info');
                setItens({}); fechar();
              }
            }}>
              <div className="space-y-2">
                <p className="text-sm font-medium">Produtos</p>
                {produtos.map((p) => (
                  <label key={p.id} className="flex items-center justify-between gap-3 text-sm">
                    <span>{p.nome} <span className="text-suave">{formatarReais(p.precoCentavos)}</span></span>
                    <input type="number" min="0" max="20" value={itens[p.id] ?? 0} onChange={(e) => setItens({ ...itens, [p.id]: Number(e.target.value) })}
                      className="w-16 rounded-controle border border-borda bg-superficie px-2 py-1 text-right" aria-label={`Quantidade de ${p.nome}`} />
                  </label>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo rotulo="Cupom usado" name="cupom" placeholder="MARINA10" ajuda="Vários: separe por vírgula." />
                <Campo rotulo="Frete (R$)" name="frete" type="number" step="0.01" min="0" defaultValue="19.90" />
                <Campo rotulo="E-mail de quem comprou" name="email" type="email" required defaultValue="cliente.teste@exemplo.com" ajuda="Se for o e-mail do creator, é autocompra." />
                <Selecao rotulo="UF de quem comprou" name="uf" opcoes={UFS.map((u) => ({ valor: u, rotulo: u }))} />
              </div>
              <Selecao rotulo="Situação" name="pagar" opcoes={[{ valor: 'sim', rotulo: 'Pago agora' }, { valor: 'nao', rotulo: 'Aberto (aguardando pagamento)' }]} />
              <div className="flex justify-end"><Botao type="submit">Criar pedido</Botao></div>
            </form>
          )}
        </Modal>
      </div>
      <Tabela colunas={['Pedido', 'Data', 'Cupom', 'Creator', 'Total', 'Comissão', 'Estado', '']} alinharDireita={[4, 5]}>
        {pedidos.map((p) => {
          const cms = D.comissoes.filter((c) => c.pedidoId === p.id);
          const comissao = cms.reduce((s, c) => s + (c.status === 'estornada' ? 0 : c.valorCentavos), 0);
          return (
            <tr key={p.id}>
              <Td className="font-mono text-xs">#{p.numero}</Td><Td>{formatarDataHora(p.criadoEm)}</Td>
              <Td className="font-mono text-xs">{p.cupom ?? '—'}</Td><Td>{nome(p.creatorId) ?? <span className="text-suave">—</span>}{p.autocompra && <Etiqueta tom="aviso" className="ml-1">Autocompra</Etiqueta>}</Td>
              <Td direita>{formatarReais(p.totalCentavos)}</Td><Td direita>{cms.length ? formatarReais(comissao) : '—'}</Td>
              <Td><EtiquetaStatus status={p.estado} /></Td>
              <Td><div className="flex justify-end gap-1">
                {p.estado === 'aberto' && <Botao tamanho="p" onClick={() => mudar((d) => { pagarPedido(d, lojaId, p.id); }, 'Pedido pago')}>Marcar pago</Botao>}
                {(p.estado === 'aberto' || p.estado === 'pago') && <Botao tamanho="p" variante="fantasma" onClick={() => mudar((d) => cancelarOuDevolver(d, lojaId, p.id, 'cancelar'), 'Pedido cancelado; comissão estornada')}>Cancelar</Botao>}
                {(p.estado === 'pago' || p.estado === 'devolvido_parcial') && (
                  <Modal titulo={`Devolução do pedido #${p.numero}`} gatilho={<Botao tamanho="p" variante="fantasma">Devolver</Botao>}>
                    {(fechar) => (
                      <form className="space-y-3" onSubmit={(e) => {
                        e.preventDefault();
                        const v = String(new FormData(e.currentTarget).get('valor') ?? '');
                        if (mudar((d) => cancelarOuDevolver(d, lojaId, p.id, v ? 'devolver_parte' : 'devolver', v ? paraCentavos(v) : 0), v ? 'Devolução parcial: comissão recalculada' : 'Pedido devolvido; comissão estornada')) fechar();
                      }}>
                        <Campo rotulo="Valor devolvido (R$)" name="valor" type="number" step="0.01" min="0.01" ajuda={`Deixe vazio para devolver tudo. Base da comissão: ${formatarReais(p.baseComissaoCentavos - p.devolvidoCentavos)}.`} />
                        <div className="flex justify-end"><Botao type="submit" variante="perigo">Registrar devolução</Botao></div>
                      </form>
                    )}
                  </Modal>
                )}
              </div></Td>
            </tr>
          );
        })}
      </Tabela>
    </div>
  );
}
