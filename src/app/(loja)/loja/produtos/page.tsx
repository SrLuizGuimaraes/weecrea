// Produtos e cupons. Dono: M3. Dados de exemplo; sincronizar, pausar e tentar de novo só simulam.
import { Package, RefreshCw } from 'lucide-react';
import { Abas, CabecalhoPagina, EtiquetaStatus, Tabela, Td } from '@/componentes';
import { BotaoEmBreve } from '@/componentes/em-breve';
import { formatarReais } from '@/dominio/dinheiro';
import { exigirLoja } from '@/lib/acesso';
import { cuponsDaLoja, produtosDaLoja } from '@/modulos/m3-nuvemshop/dados';

export default async function ProdutosECupons({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba: a } = await searchParams;
  const aba = a === 'cupons' ? 'cupons' : 'produtos';
  const produtos = produtosDaLoja(lojaId);
  const cupons = cuponsDaLoja(lojaId);
  return (
    <>
      <CabecalhoPagina titulo="Produtos e cupons" descricao="Produtos importados da Nuvemshop e o cupom de cada creator."
        acoes={<BotaoEmBreve variante="secundario" mensagem="Sincronizando produtos com a Nuvemshop (simulação)."><RefreshCw size={16} />Sincronizar produtos</BotaoEmBreve>} />
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
              <Td className="font-mono">{c.codigo}</Td><Td>{creator.nome}</Td>
              <Td><EtiquetaStatus status={c.status} />{c.status === 'erro_sync' && <div className="text-xs text-perigo">Não foi criado na Nuvemshop.</div>}</Td>
              <Td direita>{usos}</Td>
              <Td><div className="flex justify-end gap-2">
                {c.status === 'erro_sync' && <BotaoEmBreve tamanho="p" mensagem="Tentando criar o cupom na Nuvemshop de novo (simulação).">Tentar de novo</BotaoEmBreve>}
                {c.status === 'ativo' && <BotaoEmBreve tamanho="p" variante="secundario" mensagem="Cupom pausado na loja (simulação).">Pausar</BotaoEmBreve>}
                {c.status === 'pausado' && <BotaoEmBreve tamanho="p" variante="secundario" mensagem="Cupom reativado na loja (simulação).">Reativar</BotaoEmBreve>}
                {c.status !== 'desativado' && <BotaoEmBreve tamanho="p" variante="fantasma" mensagem="Cupom desativado (simulação).">Desativar</BotaoEmBreve>}
              </div></Td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
