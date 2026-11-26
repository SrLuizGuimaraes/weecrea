'use client';
// Financeiro da loja: visão geral, carteira de creators e faturas. Dono: M10. Estado da demonstração.
import { Clock, FileDown, Upload } from 'lucide-react';
import { Abas, Aviso, Botao, CabecalhoPagina, Campo, Cartao, CartaoIndicador, Etiqueta, EtiquetaStatus, Modal, Paginacao, Pessoa, Selecao, Tabela, Td, paginar } from '@/componentes';
import { useToast } from '@/componentes/toast';
import { bpsParaTexto, formatarReais } from '@/dominio/dinheiro';
import { formatarData } from '@/lib/datas';
import { baixarArquivo } from '@/lib/demo/baixar';
import { useDemo } from '@/lib/demo/estado';
import { csvDoLote, liberarComissoes, pagarCreator, pagarLote, revisarRetida } from '@/modulos/m10-financeiro/acoes';
import { carteiraDaLoja, faturasDaLoja, financeiroDaLoja } from '@/modulos/m10-financeiro/dados';

export function TelaFinanceiroLoja({ lojaId, usuarioId, aba: a, pagina, somenteLeitura }: { lojaId: string; usuarioId: string; aba?: string; pagina?: number; somenteLeitura?: boolean }) {
  const aba = a === 'carteira' || a === 'faturas' ? a : 'visao';
  return (
    <>
      <CabecalhoPagina titulo="Financeiro" descricao="Comissões dos creators, pagamentos e faturas da Weethub." />
      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'visao', rotulo: 'Visão geral', href: '?aba=visao' },
        { chave: 'carteira', rotulo: 'Carteira de creators', href: '?aba=carteira' },
        { chave: 'faturas', rotulo: 'Faturas', href: '?aba=faturas' },
      ]} /></div>
      {aba === 'visao' ? <Visao lojaId={lojaId} pagina={pagina ?? 1} leitura={somenteLeitura} />
        : aba === 'carteira' ? <Carteira lojaId={lojaId} usuarioId={usuarioId} leitura={somenteLeitura} /> : <Faturas lojaId={lojaId} />}
    </>
  );
}

function Visao({ lojaId, pagina, leitura }: { lojaId: string; pagina: number; leitura?: boolean }) {
  const { D, mudar } = useDemo();
  const toast = useToast();
  const f = financeiroDaLoja(D, lojaId);
  const pg = paginar(f.extrato, pagina, 15);
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoIndicador rotulo="A pagar (liberado)" valor={formatarReais(f.aPagar)} />
        <CartaoIndicador rotulo="Em retenção" valor={formatarReais(f.emRetencao)} detalhe="Libera após o prazo de retenção" />
        <CartaoIndicador rotulo="Pago no mês" valor={formatarReais(f.pagoNoMes)} />
        <CartaoIndicador rotulo="Estornado" valor={formatarReais(f.estornado)} detalhe="Pedidos cancelados ou devolvidos" />
      </div>
      {f.retidas > 0 && <Aviso tom="aviso" titulo={`${f.retidas} comissão(ões) retida(s) para revisão`}>Comissão retida não é liberada até você revisar. Use “Revisar” no extrato.</Aviso>}
      <Cartao titulo="Extrato de comissões" acao={!leitura && (
        <Botao tamanho="p" variante="secundario" onClick={() => { let n = 0; mudar((d) => { n = liberarComissoes(d); }); toast(n ? `${n} comissão(ões) liberada(s)` : 'Nenhuma comissão venceu a retenção ainda.', n ? 'sucesso' : 'info'); }}>
          <Clock size={14} />Liberar vencidas agora
        </Botao>
      )}>
        <Tabela colunas={['Pedido', 'Pago em', 'Creator', 'Campanha', 'Base', 'Taxa', 'Comissão', 'Status', '']} alinharDireita={[4, 5, 6]}>
          {pg.itens.map(({ comissao: c, pedido, creator, campanha }) => (
            <tr key={c.id}>
              <Td className="font-mono text-xs">#{pedido?.numero ?? '—'}</Td><Td>{pedido?.pagoEm ? formatarData(pedido.pagoEm) : '—'}</Td>
              <Td>{creator?.nome}</Td><Td className="text-suave">{campanha?.nome ?? '—'}</Td>
              <Td direita>{formatarReais(c.baseCentavos)}</Td><Td direita>{bpsParaTexto(c.taxaBps)}</Td>
              <Td direita className={c.valorCentavos < 0 ? 'text-perigo' : ''}>{formatarReais(c.valorCentavos)}</Td>
              <Td><div className="flex flex-wrap gap-1"><EtiquetaStatus status={c.status} />{c.tipo === 'estorno' && <Etiqueta tom="perigo">Estorno</Etiqueta>}{c.retida && <Etiqueta tom="aviso">Retida</Etiqueta>}</div>
                {c.status === 'prevista' && <div className="text-xs text-suave">libera em {formatarData(c.liberaEm)}</div>}</Td>
              <Td>{!leitura && (c.status === 'prevista' || c.status === 'liberada') && c.tipo === 'venda' && (
                c.retida
                  ? <Botao tamanho="p" onClick={() => mudar((d) => revisarRetida(d, lojaId, c.id, true), 'Comissão revisada e solta')}>Revisar</Botao>
                  : <Botao tamanho="p" variante="fantasma" onClick={() => mudar((d) => revisarRetida(d, lojaId, c.id, false), 'Comissão retida para revisão')}>Reter</Botao>
              )}</Td>
            </tr>
          ))}
        </Tabela>
        <div className="mt-3"><Paginacao pagina={pg.pagina} totalPaginas={pg.totalPaginas} hrefDaPagina={(n) => `?aba=visao&p=${n}`} /></div>
      </Cartao>
    </div>
  );
}

function Carteira({ lojaId, usuarioId, leitura }: { lojaId: string; usuarioId: string; leitura?: boolean }) {
  const { D, mudar } = useDemo();
  const toast = useToast();
  const lista = carteiraDaLoja(D, lojaId);
  const total = lista.reduce((s, c) => s + Math.max(0, c.saldo), 0);
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">Saldo liberado para pagar: <b>{formatarReais(total)}</b></p>
        {!leitura && (
          <div className="flex flex-wrap gap-2">
            <Botao variante="secundario" onClick={() => { baixarArquivo(`lote-${loja.slug}-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + csvDoLote(D, lojaId), 'text/csv;charset=utf-8'); toast('CSV do lote baixado'); }}>
              <FileDown size={16} />Baixar CSV do lote
            </Botao>
            <Modal titulo="Confirmar lote pago" gatilho={<Botao disabled={total <= 0}><Upload size={16} />Confirmar lote pago</Botao>}>
              {(fechar) => (
                <div className="space-y-3 text-sm">
                  <p>Confirme só depois de pagar pelo banco. Todas as comissões liberadas ({formatarReais(total)}) ficam como pagas e o saldo de cada creator zera.</p>
                  <div className="flex justify-end gap-2">
                    <Botao variante="fantasma" onClick={fechar}>Voltar</Botao>
                    <Botao onClick={() => { let r = { creators: 0, valor: 0 }; if (mudar((d) => { r = pagarLote(d, lojaId, usuarioId); })) { toast(`Lote registrado: ${r.creators} creator(s), ${formatarReais(r.valor)}`); fechar(); } }}>Confirmar</Botao>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}
      </div>
      <Tabela colunas={['Creator', 'Vendas', 'Em retenção', 'Liberado', 'Pago', 'Saldo', '']} alinharDireita={[1, 2, 3, 4, 5]}>
        {lista.map((c) => (
          <tr key={c.creator.id}>
            <Td><Pessoa nome={c.creator.nome} /></Td><Td direita>{formatarReais(c.vendas)}</Td><Td direita>{formatarReais(c.previsto)}</Td>
            <Td direita>{formatarReais(c.liberado)}</Td><Td direita>{formatarReais(c.pago)}</Td>
            <Td direita className={c.saldo < 0 ? 'font-semibold text-perigo' : 'font-semibold'}>{formatarReais(c.saldo)}</Td>
            <Td>{!leitura && c.saldo > 0 && (
              <Modal titulo={`Pagar ${c.creator.nome}`} gatilho={<Botao tamanho="p">Pagar</Botao>}>
                {(fechar) => (
                  <form className="space-y-3" onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const comprovante = f.get('comprovante') as File | null;
                    if (mudar((d) => { pagarCreator(d, lojaId, c.creator.id, f.get('forma') as 'pix', String(f.get('pagoEm')), usuarioId,
                      comprovante && comprovante.size ? URL.createObjectURL(comprovante) : undefined); }, `Pagamento de ${formatarReais(c.saldo)} registrado. O creator vê no extrato.`)) fechar();
                  }}>
                    <p className="text-sm">Valor: <b>{formatarReais(c.saldo)}</b> (comissões liberadas, já com estornos descontados)</p>
                    <p className="text-sm text-suave">Chave Pix: {D.pagamentoCreator?.[c.creator.id]?.pixMascarado ?? 'o creator ainda não cadastrou'}</p>
                    <Selecao rotulo="Forma" name="forma" opcoes={[{ valor: 'pix', rotulo: 'Pix' }, { valor: 'transferencia', rotulo: 'Transferência' }, { valor: 'outro', rotulo: 'Outro' }]} />
                    <Campo rotulo="Data do pagamento" type="date" name="pagoEm" required defaultValue={new Date().toISOString().slice(0, 10)} />
                    <Campo rotulo="Comprovante (opcional)" name="comprovante" type="file" accept="image/*,application/pdf" />
                    <div className="flex justify-end"><Botao type="submit">Registrar pagamento</Botao></div>
                  </form>
                )}
              </Modal>
            )}</Td>
          </tr>
        ))}
      </Tabela>
    </div>
  );
}

function Faturas({ lojaId }: { lojaId: string }) {
  const { D } = useDemo();
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  return (
    <div className="space-y-4">
      <Aviso tom="info">Valores de exemplo. A cobrança real da Weethub entra depois de 02/12.</Aviso>
      <Tabela colunas={['Competência', 'Vencimento', 'Valor', 'Status', '']} alinharDireita={[2]}>
        {faturasDaLoja(D, lojaId).map((f) => (
          <tr key={f.id}>
            <Td>{f.competencia}</Td><Td>{formatarData(f.vencimento)}</Td><Td direita>{formatarReais(f.valor)}</Td>
            <Td><Etiqueta tom={f.status === 'paga' ? 'sucesso' : 'aviso'}>{f.status === 'paga' ? 'Paga' : 'Em aberto'}</Etiqueta></Td>
            <Td><Botao tamanho="p" variante="secundario" onClick={() => baixarArquivo(`fatura-${loja.slug}-${f.id}.txt`,
              `WEECREA · Weethub\nFatura de ${f.competencia}\nCliente: ${loja.nome}\nValor: ${formatarReais(f.valor)}\nVencimento: ${formatarData(f.vencimento)}\nSituação: ${f.status === 'paga' ? 'paga' : 'em aberto'}\n\n(Documento de exemplo, sem valor fiscal.)\n`)}>Baixar</Botao></Td>
          </tr>
        ))}
      </Tabela>
    </div>
  );
}
