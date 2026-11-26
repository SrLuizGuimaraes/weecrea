// Creators da base (todas as lojas). Dono: M11. Dados de exemplo.
import { Botao, CabecalhoPagina, Cartao, EtiquetaStatus, Tabela, Td } from '@/componentes';
import { classeEntrada } from '@/componentes/campos';
import { formatarReais } from '@/dominio/dinheiro';
import { exigirWeethub } from '@/lib/acesso';
import { dados, formatarNumero } from '@/lib/dados-exemplo';
import { creatorsDaBase } from '@/modulos/m11-weethub/dados';

export default async function CreatorsDaBase({ searchParams }: { searchParams: Promise<{ uf?: string; status?: string; loja?: string; busca?: string }> }) {
  await exigirWeethub();
  const f = await searchParams;
  const lista = creatorsDaBase(f);
  const ufs = [...new Set(dados.creators.map((c) => c.uf))].sort();
  return (
    <>
      <CabecalhoPagina titulo="Creators" descricao={`${dados.creators.length} creators na base, de todas as lojas.`} />
      <Cartao className="mb-4">
        <form method="get" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input name="busca" defaultValue={f.busca} placeholder="Buscar por nome" className={classeEntrada} />
          <select name="loja" defaultValue={f.loja ?? ''} className={classeEntrada} aria-label="Loja">
            <option value="">Todas as lojas</option>{dados.lojas.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
          <select name="status" defaultValue={f.status ?? ''} className={classeEntrada} aria-label="Status">
            <option value="">Todos os status</option>{['aprovado', 'pendente', 'pausado', 'recusado', 'removido'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="uf" defaultValue={f.uf ?? ''} className={classeEntrada} aria-label="Estado">
            <option value="">Todos os estados</option>{ufs.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <Botao type="submit">Filtrar</Botao>
        </form>
      </Cartao>
      <Tabela colunas={['Creator', 'Perfil', 'Seguidores', 'Estado', 'Lojas', 'Vendas']} alinharDireita={[2, 5]} vazio="Nenhum creator com esses filtros.">
        {lista.map((r) => (
          <tr key={r.creator.id}>
            <Td className="font-medium">{r.creator.nome}<div className="text-xs font-normal text-suave">{r.creator.segmentos.join(', ')}</div></Td>
            <Td>{r.perfil.rede} <span className="text-suave">{r.perfil.perfil}</span></Td>
            <Td direita>{formatarNumero(r.perfil.seguidores)}</Td><Td>{r.creator.cidade}/{r.creator.uf}</Td>
            <Td><div className="flex flex-col gap-1">{r.lojas.map((l) => <span key={l.loja.id} className="flex items-center gap-1 text-xs">{l.loja.nome} <EtiquetaStatus status={l.status} /></span>)}</div></Td>
            <Td direita>{formatarReais(r.vendas)}</Td>
          </tr>
        ))}
      </Tabela>
    </>
  );
}
