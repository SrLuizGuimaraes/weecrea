// Financeiro da loja: visão geral, carteira de creators e faturas. Dono: M10. Dados de exemplo; pagar só simula.
import { FileDown, Upload } from 'lucide-react';
import { Abas, Aviso, Botao, CabecalhoPagina, Campo, Cartao, CartaoIndicador, Etiqueta, EtiquetaStatus, Modal, Paginacao, Selecao, Tabela, Td, paginar } from '@/componentes';
import { BotaoEmBreve, FormSimulado } from '@/componentes/em-breve';
import { bpsParaTexto, formatarReais } from '@/dominio/dinheiro';
import { exigirLoja } from '@/lib/acesso';
import { formatarData } from '@/lib/datas';
import { carteiraDaLoja, faturasDaLoja, financeiroDaLoja } from '@/modulos/m10-financeiro/dados';

export default async function FinanceiroLoja({ searchParams }: { searchParams: Promise<{ aba?: string; p?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba: a, p } = await searchParams;
  const aba = a === 'carteira' || a === 'faturas' ? a : 'visao';
  return (
    <>
      <CabecalhoPagina titulo="Financeiro" descricao="Comissões dos creators, pagamentos e faturas da Weethub." />
      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'visao', rotulo: 'Visão geral', href: '?aba=visao' },
        { chave: 'carteira', rotulo: 'Carteira de creators', href: '?aba=carteira' },
        { chave: 'faturas', rotulo: 'Faturas', href: '?aba=faturas' },
      ]} /></div>
      {aba === 'visao' ? <Visao lojaId={lojaId} pagina={Number(p) || 1} /> : aba === 'carteira' ? <Carteira lojaId={lojaId} /> : <Faturas lojaId={lojaId} />}
    </>
  );
}

function Visao({ lojaId, pagina }: { lojaId: string; pagina: number }) {
  const f = financeiroDaLoja(lojaId);
  const pg = paginar(f.extrato, pagina, 15);
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoIndicador rotulo="A pagar (liberado)" valor={formatarReais(f.aPagar)} />
        <CartaoIndicador rotulo="Em retenção" valor={formatarReais(f.emRetencao)} detalhe="Libera após o prazo de retenção" />
        <CartaoIndicador rotulo="Pago no mês" valor={formatarReais(f.pagoNoMes)} />
        <CartaoIndicador rotulo="Estornado" valor={formatarReais(f.estornado)} detalhe="Pedidos cancelados ou devolvidos" />
      </div>
      {f.retidas > 0 && <Aviso tom="aviso" titulo={`${f.retidas} comissão(ões) retida(s) para revisão`}>Comissão retida não é liberada até você revisar.</Aviso>}
      <Cartao titulo="Extrato de comissões">
        <Tabela colunas={['Pedido', 'Pago em', 'Creator', 'Campanha', 'Base', 'Taxa', 'Comissão', 'Status']} alinharDireita={[4, 5, 6]}>
          {pg.itens.map(({ comissao: c, pedido, creator, campanha }) => (
            <tr key={c.id}>
              <Td className="font-mono text-xs">#{pedido.numero}</Td><Td>{pedido.pagoEm ? formatarData(pedido.pagoEm) : '—'}</Td>
              <Td>{creator.nome}</Td><Td className="text-suave">{campanha?.nome ?? '—'}</Td>
              <Td direita>{formatarReais(c.baseCentavos)}</Td><Td direita>{bpsParaTexto(c.taxaBps)}</Td>
              <Td direita className={c.valorCentavos < 0 ? 'text-perigo' : ''}>{formatarReais(c.valorCentavos)}</Td>
              <Td><div className="flex flex-wrap gap-1"><EtiquetaStatus status={c.status} />{c.tipo === 'estorno' && <Etiqueta tom="perigo">Estorno</Etiqueta>}{c.retida && <Etiqueta tom="aviso">Retida</Etiqueta>}</div>
                {c.status === 'prevista' && <div className="text-xs text-suave">libera em {formatarData(c.liberaEm)}</div>}</Td>
            </tr>
          ))}
        </Tabela>
        <div className="mt-3"><Paginacao pagina={pg.pagina} totalPaginas={pg.totalPaginas} hrefDaPagina={(n) => `?aba=visao&p=${n}`} /></div>
      </Cartao>
    </div>
  );
}

function Carteira({ lojaId }: { lojaId: string }) {
  const lista = carteiraDaLoja(lojaId);
  const total = lista.reduce((s, c) => s + c.saldo, 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">Saldo liberado para pagar: <b>{formatarReais(total)}</b></p>
        <div className="flex flex-wrap gap-2">
          <BotaoEmBreve variante="secundario" mensagem="Baixando o CSV do lote (nome, chave Pix, valor) (simulação)."><FileDown size={16} />Baixar CSV do lote</BotaoEmBreve>
          <BotaoEmBreve mensagem="Lote confirmado como pago (simulação). O saldo de cada creator zera."><Upload size={16} />Confirmar lote pago</BotaoEmBreve>
        </div>
      </div>
      <Tabela colunas={['Creator', 'Vendas', 'Em retenção', 'Liberado', 'Pago', 'Saldo', '']} alinharDireita={[1, 2, 3, 4, 5]}>
        {lista.map((c) => (
          <tr key={c.creator.id}>
            <Td className="font-medium">{c.creator.nome}</Td><Td direita>{formatarReais(c.vendas)}</Td><Td direita>{formatarReais(c.previsto)}</Td>
            <Td direita>{formatarReais(c.liberado)}</Td><Td direita>{formatarReais(c.pago)}</Td><Td direita className="font-semibold">{formatarReais(c.saldo)}</Td>
            <Td>{c.saldo > 0 && (
              <Modal titulo={`Pagar ${c.creator.nome}`} gatilho={<Botao tamanho="p">Pagar</Botao>}>
                <FormSimulado mensagem="Pagamento registrado (simulação). O creator vê no extrato." className="space-y-3">
                  <p className="text-sm">Valor: <b>{formatarReais(c.saldo)}</b> (comissões liberadas)</p>
                  <Selecao rotulo="Forma" name="forma" opcoes={[{ valor: 'pix', rotulo: 'Pix' }, { valor: 'transferencia', rotulo: 'Transferência' }, { valor: 'outro', rotulo: 'Outro' }]} />
                  <Campo rotulo="Data do pagamento" type="date" name="pagoEm" defaultValue="2026-11-25" />
                  <Campo rotulo="Comprovante" type="file" accept="image/*,application/pdf" />
                  <div className="flex justify-end"><Botao type="submit">Registrar pagamento</Botao></div>
                </FormSimulado>
              </Modal>
            )}</Td>
          </tr>
        ))}
      </Tabela>
    </div>
  );
}

function Faturas({ lojaId }: { lojaId: string }) {
  return (
    <div className="space-y-4">
      <Aviso tom="info">Valores de exemplo. A cobrança real da Weethub entra depois de 02/12.</Aviso>
      <Tabela colunas={['Competência', 'Vencimento', 'Valor', 'Status', '']} alinharDireita={[2]}>
        {faturasDaLoja(lojaId).map((f) => (
          <tr key={f.id}>
            <Td>{f.competencia}</Td><Td>{formatarData(f.vencimento)}</Td><Td direita>{formatarReais(f.valor)}</Td>
            <Td><Etiqueta tom={f.status === 'paga' ? 'sucesso' : 'aviso'}>{f.status === 'paga' ? 'Paga' : 'Em aberto'}</Etiqueta></Td>
            <Td><BotaoEmBreve tamanho="p" variante="secundario" mensagem="Baixando a fatura (simulação).">Baixar</BotaoEmBreve></Td>
          </tr>
        ))}
      </Tabela>
    </div>
  );
}
