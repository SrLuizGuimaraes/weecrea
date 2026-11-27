'use client';
// Painel Weethub. Dono: M11. Estado da demonstração.
import Link from 'next/link';
import { Building2, DollarSign, LineChart, Users } from 'lucide-react';
import { CabecalhoPagina, Cartao, CartaoIndicador, EtiquetaStatus, Tabela, Td } from '@/componentes';
import { BarrasHorizontais } from '@/componentes/graficos';
import { formatarReais } from '@/dominio/dinheiro';
import { useDemo } from '@/lib/demo/estado';
import { painelWeethub } from '@/modulos/m11-weethub/dados';

const ROTULO: Record<string, string> = { ativa: 'Ativas', implantacao: 'Em implantação', suspensa: 'Suspensas', cancelada: 'Canceladas' };

export function TelaPainelWeethub() {
  const { D } = useDemo();
  const d = painelWeethub(D);
  return (
    <>
      <CabecalhoPagina titulo="Painel Weethub" descricao="Todas as empresas da WEECREA, vendas e receita estimada." />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoIndicador rotulo="Empresas" valor={d.lista.length} detalhe={Object.entries(d.porStatus).map(([s, n]) => `${n} ${ROTULO[s]?.toLowerCase() ?? s}`).join(' · ')} icone={<Building2 size={14} />} />
        <CartaoIndicador rotulo="Vendas com creators" valor={formatarReais(d.vendas)} detalhe="Todas as lojas, pedidos pagos" icone={<DollarSign size={14} />} />
        <CartaoIndicador rotulo="Creators na base" valor={d.creators} icone={<Users size={14} />} />
        <CartaoIndicador rotulo="Receita mensal estimada" valor={formatarReais(d.receitaMensal)} detalhe="Valores de exemplo" icone={<LineChart size={14} />} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Vendas por empresa">
          <BarrasHorizontais itens={d.lista.map((e) => ({ rotulo: e.loja.nome, valor: e.vendas, texto: formatarReais(e.vendas) }))} />
        </Cartao>
        <Cartao titulo="Empresas" acao={<Link href="/weethub/empresas" className="text-sm underline">Ver todas</Link>}>
          <Tabela colunas={['Empresa', 'Status', 'Creators', 'Campanhas ativas']} alinharDireita={[2, 3]}>
            {d.lista.map((e) => (
              <tr key={e.loja.id}>
                <Td><Link href={`/weethub/empresas/${e.loja.id}`} className="font-medium hover:underline">{e.loja.nome}</Link></Td>
                <Td><EtiquetaStatus status={e.loja.status} /></Td><Td direita>{e.creators}</Td><Td direita>{e.campanhas}</Td>
              </tr>
            ))}
          </Tabela>
        </Cartao>
      </div>
    </>
  );
}
