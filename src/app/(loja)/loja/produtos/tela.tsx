'use client';
// Produtos e cupons. Dono: M3. Estado da demonstração (a Nuvemshop é simulada).
import { Package, RefreshCw } from 'lucide-react';
import { Abas, Botao, CabecalhoPagina, EtiquetaStatus, Pessoa, Tabela, Td } from '@/componentes';
import { useToast } from '@/componentes/toast';
import { formatarReais } from '@/dominio/dinheiro';
import { useDemo } from '@/lib/demo/estado';
import { mudarCupom } from '@/modulos/m3-nuvemshop/acoes';
import { cuponsDaLoja, produtosDaLoja } from '@/modulos/m3-nuvemshop/dados';

export function TelaProdutos({ lojaId, aba: a }: { lojaId: string; aba?: string }) {
  const { D, mudar } = useDemo();
  const toast = useToast();
  const aba = a === 'cupons' ? 'cupons' : 'produtos';
  const produtos = produtosDaLoja(D, lojaId);
  const cupons = cuponsDaLoja(D, lojaId);
  const conectada = D.lojas.find((l) => l.id === lojaId)!.nuvemshopConectada;
  return (
    <>
      <CabecalhoPagina titulo="Produtos e cupons" descricao="Produtos importados da Nuvemshop e o cupom de cada creator."
        acoes={<Botao variante="secundario" onClick={() => toast(conectada ? `${produtos.length} produtos conferidos com a Nuvemshop (simulado).` : 'Conecte a Nuvemshop em Conexões para importar produtos.', conectada ? 'sucesso' : 'perigo')}>
          <RefreshCw size={16} />Sincronizar produtos</Botao>} />
      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'produtos', rotulo: `Produtos (${produtos.length})`, href: '?aba=produtos' },
        { chave: 'cupons', rotulo: `Cupons (${cupons.length})`, href: '?aba=cupons' },
      ]} /></div>
      {aba === 'produtos' ? (
        <Tabela colunas={['Produto', 'Categoria', 'Preço', 'Vendidos', 'Em campanhas ativas']} alinharDireita={[2, 3, 4]}>
          {produtos.map(({ produto: p, vendidos, campanhas }) => (
            <tr key={p.id}>
              <Td><div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-superficie-2 text-suave">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.imagemUrl ? <img src={p.imagemUrl} alt="" className="size-10 rounded-lg object-cover" /> : <Package size={18} />}
                </div>
                <div><p className="font-medium">{p.nome}</p><p className="text-xs text-suave">Nuvemshop #{p.nuvemshopId}</p></div>
              </div></Td>
              <Td>{p.categoria ?? '—'}</Td><Td direita>{formatarReais(p.precoCentavos)}</Td><Td direita>{vendidos}</Td><Td direita>{campanhas}</Td>
            </tr>
          ))}
        </Tabela>
      ) : (
        <Tabela colunas={['Cupom', 'Creator', 'Status', 'Pedidos', '']} alinharDireita={[3]}>
          {cupons.map(({ cupom: c, creator, usos }) => (
            <tr key={c.id}>
              <Td className="font-mono">{c.codigo}</Td><Td><Pessoa nome={creator.nome} /></Td>
              <Td><EtiquetaStatus status={c.status} />{c.status === 'erro_sync' && <div className="text-xs text-perigo">Não foi criado na Nuvemshop.</div>}</Td>
              <Td direita>{usos}</Td>
              <Td><div className="flex justify-end gap-2">
                {c.status === 'erro_sync' && <Botao tamanho="p" onClick={() => mudar((d) => mudarCupom(d, lojaId, c.id, 'tentar'), 'Cupom criado na Nuvemshop')}>Tentar de novo</Botao>}
                {c.status === 'ativo' && <Botao tamanho="p" variante="secundario" onClick={() => mudar((d) => mudarCupom(d, lojaId, c.id, 'pausar'), 'Cupom pausado na loja')}>Pausar</Botao>}
                {c.status === 'pausado' && <Botao tamanho="p" variante="secundario" onClick={() => mudar((d) => mudarCupom(d, lojaId, c.id, 'reativar'), 'Cupom reativado na loja')}>Reativar</Botao>}
                {(c.status === 'ativo' || c.status === 'pausado') && <Botao tamanho="p" variante="fantasma" onClick={() => mudar((d) => mudarCupom(d, lojaId, c.id, 'desativar'), 'Cupom desativado')}>Desativar</Botao>}
              </div></Td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
