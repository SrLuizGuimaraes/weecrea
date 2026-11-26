// Conteúdos do creator: vídeos enviados e envio de novos. Dono: M8. Envio e métricas só simulam.
import { Upload } from 'lucide-react';
import { Botao, CabecalhoPagina, Campo, Modal, Selecao, Tabela, Td, Vazio, EtiquetaStatus } from '@/componentes';
import { FormSimulado } from '@/componentes/em-breve';
import { exigirCreator } from '@/lib/acesso';
import { formatarData } from '@/lib/datas';
import { formatarNumero } from '@/lib/dados-exemplo';
import { conteudosDoCreator } from '@/modulos/m8-biblioteca/dados';

export default async function Conteudos() {
  const { creatorId } = await exigirCreator();
  const d = conteudosDoCreator(creatorId);
  return (
    <>
      <CabecalhoPagina titulo="Conteúdos" descricao="Envie os vídeos das campanhas que você aceitou e acompanhe a análise da loja."
        acoes={
          <Modal titulo="Enviar vídeo" gatilho={<Botao disabled={!d.campanhasAceitas.length}><Upload size={16} />Enviar vídeo</Botao>}>
            <FormSimulado mensagem="Vídeo enviado (simulação). Ele entra em análise na loja." className="space-y-3">
              <Selecao rotulo="Campanha" name="campanhaId" opcoes={d.campanhasAceitas.map((k) => ({ valor: k.id, rotulo: k.nome }))} />
              <Selecao rotulo="Rede" name="rede" opcoes={[{ valor: 'instagram', rotulo: 'Instagram' }, { valor: 'tiktok', rotulo: 'TikTok' }]} />
              <Campo rotulo="Link da publicação" name="link" type="url" placeholder="https://instagram.com/reel/..." ajuda="Quando a campanha pede publicação." />
              <Campo rotulo="Arquivo do vídeo" name="arquivo" type="file" accept="video/*" ajuda="Quando a campanha pede o arquivo. Sobe direto, com barra de progresso." />
              <div className="flex justify-end"><Botao type="submit">Enviar</Botao></div>
            </FormSimulado>
          </Modal>
        } />
      {!d.videos.length ? <Vazio titulo="Nenhum vídeo enviado ainda">Aceite uma campanha e envie o primeiro vídeo.</Vazio> : (
        <Tabela colunas={['Campanha', 'Loja', 'Rede', 'Status', 'Views', 'Curtidas', 'Enviado em', '']} alinharDireita={[4, 5]}>
          {d.videos.map(({ video: v, campanha, loja }) => (
            <tr key={v.id}>
              <Td className="font-medium">{campanha?.nome ?? '—'}</Td><Td>{loja.nome}</Td>
              <Td>{v.rede === 'tiktok' ? 'TikTok' : v.rede === 'instagram' ? 'Instagram' : 'Arquivo'} {v.formato && <span className="text-suave">· {v.formato}</span>}</Td>
              <Td><EtiquetaStatus status={v.status} />{v.motivoReprovacao && <div className="mt-1 max-w-48 text-xs text-perigo">{v.motivoReprovacao}</div>}</Td>
              <Td direita>{v.views ? formatarNumero(v.views) : '—'}</Td><Td direita>{v.curtidas ? formatarNumero(v.curtidas) : '—'}</Td>
              <Td>{formatarData(v.enviadoEm)}</Td>
              <Td>
                <Modal titulo="Atualizar métricas" gatilho={<Botao tamanho="p" variante="secundario">Métricas</Botao>}>
                  <FormSimulado mensagem="Métricas atualizadas (simulação)." className="space-y-3">
                    <Campo rotulo="Views" type="number" min="0" defaultValue={v.views} />
                    <Campo rotulo="Curtidas" type="number" min="0" defaultValue={v.curtidas} />
                    <Campo rotulo="Comentários" type="number" min="0" defaultValue={v.comentarios} />
                    <div className="flex justify-end"><Botao type="submit">Salvar</Botao></div>
                  </FormSimulado>
                </Modal>
              </Td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
