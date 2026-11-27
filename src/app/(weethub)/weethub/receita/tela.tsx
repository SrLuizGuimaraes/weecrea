'use client';
// Receita da Weethub por empresa. Dono: M11. Valores de exemplo (a cobrança real vem depois de 02/12).
import { Aviso, CabecalhoPagina, Cartao, CartaoIndicador, EtiquetaStatus, Tabela, Td } from '@/componentes';
import { GraficoColunas } from '@/componentes/graficos';
import { formatarReais } from '@/dominio/dinheiro';
import { useDemo } from '@/lib/demo/estado';
import { receita } from '@/modulos/m11-weethub/dados';

const MES: Record<string, string> = { '2026-09': 'Set/26', '2026-10': 'Out/26', '2026-11': 'Nov/26' };

export function TelaReceita() {
  const { D } = useDemo();
  const lista = receita(D);
  const meses = lista[0]?.porMes.map((m) => m.mes) ?? [];
  const totalMes = meses.map((m) => lista.reduce((s, e) => s + (e.porMes.find((x) => x.mes === m)?.valor ?? 0), 0));
  return (
    <>
      <CabecalhoPagina titulo="Receita" descricao="Mensalidades das empresas." />
      <div className="mb-4"><Aviso tom="info">Valores de exemplo. Planos, faturas e inadimplência reais entram depois de 02/12.</Aviso></div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <CartaoIndicador rotulo="Receita do mês" valor={formatarReais(totalMes.at(-1) ?? 0)} />
        <CartaoIndicador rotulo="Receita do trimestre" valor={formatarReais(totalMes.reduce((s, v) => s + v, 0))} />
        <CartaoIndicador rotulo="Ticket médio por empresa" valor={formatarReais(lista.length ? Math.round((totalMes.at(-1) ?? 0) / lista.length) : 0)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Cartao titulo="Por mês"><GraficoColunas pontos={meses.map((m, i) => ({ rotulo: MES[m] ?? m, valor: totalMes[i] ?? 0, texto: formatarReais(totalMes[i] ?? 0) }))} /></Cartao>
        <Cartao titulo="Por empresa">
          <Tabela colunas={['Empresa', 'Status', ...meses.map((m) => MES[m] ?? m)]} alinharDireita={meses.map((_, i) => i + 2)}>
            {lista.map((e) => (
              <tr key={e.loja.id}>
                <Td className="font-medium">{e.loja.nome}</Td><Td><EtiquetaStatus status={e.loja.status} /></Td>
                {e.porMes.map((m) => <Td key={m.mes} direita>{formatarReais(m.valor)}</Td>)}
              </tr>
            ))}
          </Tabela>
        </Cartao>
      </div>
    </>
  );
}
