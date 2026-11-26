// Financeiro do creator. Dono: M10. Dados de exemplo; dados de pagamento só simulam (CPF e Pix serão guardados cifrados).
import { Abas, Botao, CabecalhoPagina, Campo, Cartao, CartaoIndicador, Etiqueta, EtiquetaStatus, Selecao, Tabela, Td, Paginacao, paginar } from '@/componentes';
import { FormSimulado } from '@/componentes/em-breve';
import { bpsParaTexto, formatarReais } from '@/dominio/dinheiro';
import { exigirCreator } from '@/lib/acesso';
import { formatarData } from '@/lib/datas';
import { financeiroDoCreator } from '@/modulos/m10-financeiro/dados';

export default async function FinanceiroCreator({ searchParams }: { searchParams: Promise<{ aba?: string; p?: string }> }) {
  const { creatorId } = await exigirCreator();
  const { aba: a, p } = await searchParams;
  const aba = a === 'pagamentos' || a === 'dados' ? a : 'extrato';
  const f = financeiroDoCreator(creatorId);
  const pg = paginar(f.extrato, Number(p) || 1, 15);
  return (
    <>
      <CabecalhoPagina titulo="Financeiro" descricao="Suas comissões, o que está em retenção e o que já recebeu." />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <CartaoIndicador rotulo="A receber" valor={formatarReais(f.aReceber)} detalhe="Liberado pelas lojas" />
        <CartaoIndicador rotulo="Em retenção" valor={formatarReais(f.emRetencao)} detalhe={f.proximaLiberacao ? `Próxima liberação em ${formatarData(f.proximaLiberacao)}` : 'Nada em retenção'} />
        <CartaoIndicador rotulo="Recebido" valor={formatarReais(f.recebido)} />
      </div>
      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'extrato', rotulo: 'Extrato', href: '?aba=extrato' },
        { chave: 'pagamentos', rotulo: 'Pagamentos recebidos', href: '?aba=pagamentos' },
        { chave: 'dados', rotulo: 'Dados de pagamento', href: '?aba=dados' },
      ]} /></div>
      {aba === 'extrato' ? (
        <>
          <Tabela colunas={['Pedido', 'Loja', 'Campanha', 'Pago em', 'Taxa', 'Comissão', 'Status']} alinharDireita={[4, 5]}>
            {pg.itens.map(({ comissao: c, pedido, loja, campanha }) => (
              <tr key={c.id}>
                <Td className="font-mono text-xs">#{pedido.numero}</Td><Td>{loja.nome}</Td><Td className="text-suave">{campanha?.nome ?? '—'}</Td>
                <Td>{pedido.pagoEm ? formatarData(pedido.pagoEm) : '—'}</Td><Td direita>{bpsParaTexto(c.taxaBps)}</Td>
                <Td direita className={c.valorCentavos < 0 ? 'text-perigo' : ''}>{formatarReais(c.valorCentavos)}</Td>
                <Td><div className="flex flex-wrap gap-1"><EtiquetaStatus status={c.status} />{c.tipo === 'estorno' && <Etiqueta tom="perigo">Estorno</Etiqueta>}</div>
                  {c.status === 'prevista' && <div className="text-xs text-suave">libera em {formatarData(c.liberaEm)}</div>}</Td>
              </tr>
            ))}
          </Tabela>
          <div className="mt-3"><Paginacao pagina={pg.pagina} totalPaginas={pg.totalPaginas} hrefDaPagina={(n) => `?aba=extrato&p=${n}`} /></div>
        </>
      ) : aba === 'pagamentos' ? (
        <Tabela colunas={['Data', 'Loja', 'Forma', 'Valor', 'Comprovante']} alinharDireita={[3]} vazio="Nenhum pagamento ainda.">
          {f.pagamentos.map(({ pagamento: pg2, loja }) => (
            <tr key={pg2.id}>
              <Td>{formatarData(pg2.pagoEm)}</Td><Td>{loja.nome}</Td><Td>{pg2.forma === 'pix' ? 'Pix' : pg2.forma === 'transferencia' ? 'Transferência' : 'Outro'}</Td>
              <Td direita>{formatarReais(pg2.valorCentavos)}</Td><Td>{pg2.comprovanteUrl ? <a className="underline" href={pg2.comprovanteUrl}>Abrir</a> : '—'}</Td>
            </tr>
          ))}
        </Tabela>
      ) : (
        <Cartao titulo="Dados para receber">
          <FormSimulado mensagem="Dados salvos (simulação). CPF e Pix serão guardados cifrados." className="grid max-w-xl gap-4">
            <Campo rotulo="Nome completo" defaultValue={f.creator.nome} />
            <Campo rotulo="CPF" placeholder="•••.•••.•••-••" ajuda="Depois de salvo, mostramos só os 4 últimos dígitos." inputMode="numeric" />
            <Selecao rotulo="Tipo da chave Pix" opcoes={[{ valor: 'cpf', rotulo: 'CPF' }, { valor: 'email', rotulo: 'E-mail' }, { valor: 'telefone', rotulo: 'Telefone' }, { valor: 'aleatoria', rotulo: 'Chave aleatória' }]} />
            <Campo rotulo="Chave Pix" placeholder="Sua chave" />
            <div className="flex justify-end"><Botao type="submit">Salvar</Botao></div>
          </FormSimulado>
        </Cartao>
      )}
    </>
  );
}
