'use client';
// Conteúdos do creator: vídeos enviados e envio de novos. Dono: M8. Estado da demonstração (o arquivo fica só no navegador).
import { Upload } from 'lucide-react';
import { useState } from 'react';
import { Botao, CabecalhoPagina, Campo, EtiquetaStatus, Modal, Selecao, Tabela, Td, Vazio } from '@/componentes';
import { useToast } from '@/componentes/toast';
import type { Rede } from '@/contratos/tipos';
import { formatarData } from '@/lib/datas';
import { useDemo } from '@/lib/demo/estado';
import { formatarNumero } from '@/lib/demo/util';
import { lerVideo } from '@/lib/miniatura';
import { atualizarMetricas, enviarVideo } from '@/modulos/m8-biblioteca/acoes';
import { conteudosDoCreator } from '@/modulos/m8-biblioteca/dados';

export function TelaConteudos({ creatorId }: { creatorId: string }) {
  const { D, mudar } = useDemo();
  const toast = useToast();
  const [progresso, setProgresso] = useState<string | null>(null);
  const [campanhaId, setCampanhaId] = useState('');
  const d = conteudosDoCreator(D, creatorId);
  const escolhida = d.campanhasAceitas.find((k) => k.id === campanhaId) ?? d.campanhasAceitas[0];
  const pedeLink = escolhida?.entrega !== 'entregar_arquivo';
  const pedeArquivo = escolhida?.entrega !== 'publicar';
  return (
    <>
      <CabecalhoPagina titulo="Conteúdos" descricao="Envie os vídeos das campanhas que você aceitou e acompanhe a análise da loja."
        acoes={
          <Modal titulo="Enviar vídeo" gatilho={<Botao disabled={!d.campanhasAceitas.length}><Upload size={16} />Enviar vídeo</Botao>}>
            {(fechar) => (
              <form className="space-y-3" onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const arquivo = f.get('arquivo') as File | null;
                const link = String(f.get('link') ?? '').trim();
                if (pedeLink && pedeArquivo && (!link || !arquivo?.size)) return toast('Esta campanha pede o link da publicação e o arquivo.', 'perigo');
                let extra = {};
                if (arquivo && arquivo.size) {
                  setProgresso('Lendo o vídeo…');
                  const info = await lerVideo(arquivo).catch(() => null);
                  setProgresso(null);
                  extra = { arquivoUrl: URL.createObjectURL(arquivo), tamanhoBytes: arquivo.size, ...(info ? { miniaturaUrl: URL.createObjectURL(info.miniatura), duracaoSeg: info.duracaoSeg } : {}) };
                }
                const k = escolhida!;
                if (mudar((dd) => { enviarVideo(dd, { lojaId: k.lojaId, origem: 'creator', creatorId, campanhaId: k.id, rede: f.get('rede') as Rede,
                  formato: f.get('rede') === 'tiktok' ? 'tiktok' : (f.get('formato') as 'reels'), ...(link ? { link } : {}), ...extra }); }, 'Vídeo enviado. Ele entra em análise na loja.')) fechar();
              }}>
                <Selecao rotulo="Campanha" name="campanhaId" value={escolhida?.id ?? ''} onChange={(e) => setCampanhaId(e.target.value)}
                  opcoes={d.campanhasAceitas.map((k) => ({ valor: k.id, rotulo: k.nome }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Selecao rotulo="Rede" name="rede" opcoes={[{ valor: 'instagram', rotulo: 'Instagram' }, { valor: 'tiktok', rotulo: 'TikTok' }]} />
                  <Selecao rotulo="Formato" name="formato" opcoes={[{ valor: 'reels', rotulo: 'Reels' }, { valor: 'story', rotulo: 'Story' }, { valor: 'feed', rotulo: 'Feed' }]} />
                </div>
                {pedeLink && <Campo rotulo="Link da publicação" name="link" type="url" required={!pedeArquivo} placeholder="https://instagram.com/reel/..." />}
                {pedeArquivo && <Campo rotulo="Arquivo do vídeo" name="arquivo" type="file" accept="video/*" required={!pedeLink} ajuda="A miniatura é tirada aqui no navegador." />}
                <div className="flex justify-end"><Botao type="submit" disabled={!!progresso}>{progresso ?? 'Enviar'}</Botao></div>
              </form>
            )}
          </Modal>
        } />
      {!d.campanhasAceitas.length && <p className="mb-4 text-sm text-suave">Aceite uma campanha ativa para enviar vídeos.</p>}
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
                  {(fechar) => (
                    <form className="space-y-3" onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const n = (k: string) => (f.get(k) === '' ? undefined : Number(f.get(k)));
                      if (mudar((dd) => atualizarMetricas(dd, creatorId, v.id, { views: n('views'), curtidas: n('curtidas'), comentarios: n('comentarios') }), 'Métricas atualizadas')) fechar();
                    }}>
                      <Campo rotulo="Views" name="views" type="number" min="0" defaultValue={v.views} />
                      <Campo rotulo="Curtidas" name="curtidas" type="number" min="0" defaultValue={v.curtidas} />
                      <Campo rotulo="Comentários" name="comentarios" type="number" min="0" defaultValue={v.comentarios} />
                      <div className="flex justify-end"><Botao type="submit">Salvar</Botao></div>
                    </form>
                  )}
                </Modal>
              </Td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
