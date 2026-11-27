'use client';
// Empresas (lojas clientes). Dono: M11. Estado da demonstração: criar empresa e convidar o dono funcionam sem gravar.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Botao, CabecalhoPagina, Campo, Etiqueta, EtiquetaStatus, Modal, Tabela, Td } from '@/componentes';
import { formatarReais } from '@/dominio/dinheiro';
import { useDemo } from '@/lib/demo/estado';
import { criarEmpresa } from '@/modulos/m11-weethub/acoes';
import { empresas } from '@/modulos/m11-weethub/dados';

export function TelaEmpresas() {
  const { D, mudar } = useDemo();
  const router = useRouter();
  const lista = empresas(D);
  return (
    <>
      <CabecalhoPagina titulo="Empresas" descricao="Lojas clientes, conexão com a Nuvemshop e resultados."
        acoes={
          <Modal titulo="Nova empresa" gatilho={<Botao><Plus size={16} />Nova empresa</Botao>}>
            {(fechar) => (
              <form className="space-y-3" onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                let id = '';
                if (mudar((d) => { id = criarEmpresa(d, { nome: String(f.get('nome')), slug: String(f.get('slug') || f.get('nome')), donoNome: String(f.get('donoNome')), donoEmail: String(f.get('donoEmail')) }); },
                  `Empresa criada. Convite enviado a ${String(f.get('donoEmail'))} com o link para definir a senha (simulado).`)) { fechar(); router.push(`/weethub/empresas/${id}`); }
              }}>
                <Campo rotulo="Nome da loja" name="nome" required placeholder="Loja Exemplo" />
                <Campo rotulo="Endereço da página (slug)" name="slug" placeholder="loja-exemplo" ajuda="Fica em /c/loja-exemplo. Vazio = gerado pelo nome." />
                <Campo rotulo="Nome do dono" name="donoNome" required />
                <Campo rotulo="E-mail do dono" name="donoEmail" type="email" required ajuda="Recebe o link para definir a senha." />
                <div className="flex justify-end"><Botao type="submit">Criar e convidar</Botao></div>
              </form>
            )}
          </Modal>
        } />
      <Tabela colunas={['Empresa', 'Status', 'Nuvemshop', 'Creators', 'Campanhas ativas', 'Vendas', '']} alinharDireita={[3, 4, 5]}>
        {lista.map((e) => (
          <tr key={e.loja.id}>
            <Td><Link href={`/weethub/empresas/${e.loja.id}`} className="font-medium hover:underline">{e.loja.nome}</Link><div className="text-xs text-suave">{e.dono?.email}</div></Td>
            <Td><EtiquetaStatus status={e.loja.status} /></Td>
            <Td>{e.loja.nuvemshopConectada ? <Etiqueta tom="sucesso">Conectada</Etiqueta> : <Etiqueta>Desconectada</Etiqueta>}</Td>
            <Td direita>{e.creators}{e.pendentes ? <span className="text-xs text-aviso"> +{e.pendentes} na fila</span> : null}</Td>
            <Td direita>{e.campanhas}</Td><Td direita>{formatarReais(e.vendas)}</Td>
            <Td><div className="flex justify-end gap-3 text-sm">
              <Link href={`/weethub/empresas/${e.loja.id}`} className="underline">Ficha</Link>
              <Link href={`/weethub/empresas/${e.loja.id}/ver`} className="underline">Ver como cliente</Link>
            </div></Td>
          </tr>
        ))}
      </Tabela>
    </>
  );
}
