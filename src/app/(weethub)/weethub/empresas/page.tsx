// Empresas (lojas clientes). Dono: M11. Dados de exemplo; criar empresa e convidar só simulam.
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Botao, CabecalhoPagina, Campo, Etiqueta, EtiquetaStatus, Modal, Tabela, Td } from '@/componentes';
import { FormSimulado } from '@/componentes/em-breve';
import { formatarReais } from '@/dominio/dinheiro';
import { exigirWeethub } from '@/lib/acesso';
import { empresas } from '@/modulos/m11-weethub/dados';

export default async function Empresas() {
  await exigirWeethub();
  const lista = empresas();
  return (
    <>
      <CabecalhoPagina titulo="Empresas" descricao="Lojas clientes, conexão com a Nuvemshop e resultados."
        acoes={
          <Modal titulo="Nova empresa" gatilho={<Botao><Plus size={16} />Nova empresa</Botao>}>
            <FormSimulado mensagem="Empresa criada e convite enviado ao dono (simulação)." className="space-y-3">
              <Campo rotulo="Nome da loja" required placeholder="Loja Exemplo" />
              <Campo rotulo="Endereço da página (slug)" required placeholder="loja-exemplo" ajuda="Fica em /c/loja-exemplo" />
              <Campo rotulo="Nome do dono" required />
              <Campo rotulo="E-mail do dono" type="email" required ajuda="Recebe o link para definir a senha." />
              <div className="flex justify-end"><Botao type="submit">Criar e convidar</Botao></div>
            </FormSimulado>
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
            <Td><div className="flex justify-end gap-2 text-sm">
              <Link href={`/weethub/empresas/${e.loja.id}`} className="underline">Ficha</Link>
              <Link href={`/weethub/empresas/${e.loja.id}/ver`} className="underline">Ver como cliente</Link>
            </div></Td>
          </tr>
        ))}
      </Tabela>
    </>
  );
}
