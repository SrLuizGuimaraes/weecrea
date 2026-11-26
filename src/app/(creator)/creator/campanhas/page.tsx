// Campanhas do creator: disponíveis, participando, futuras e encerradas. Dono: M5. Aceitar só simula.
import { Abas, Botao, CabecalhoPagina, CaixaSelecao, Cartao, Etiqueta, EtiquetaStatus, Modal, Vazio } from '@/componentes';
import { FormSimulado } from '@/componentes/em-breve';
import { BarraProgresso } from '@/componentes/progresso';
import { bpsParaTexto, formatarReais } from '@/dominio/dinheiro';
import { exigirCreator } from '@/lib/acesso';
import { formatarData } from '@/lib/datas';
import { campanhasDoCreator } from '@/modulos/m5-campanhas/dados';

const ENTREGA = { publicar: 'Publicar nas redes', entregar_arquivo: 'Entregar o arquivo do vídeo', publicar_e_entregar: 'Publicar e entregar o arquivo' };

export default async function CampanhasCreator({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { creatorId } = await exigirCreator();
  const { aba: a } = await searchParams;
  const todas = campanhasDoCreator(creatorId);
  const grupos = {
    disponiveis: todas.filter((k) => k.campanha.status === 'ativa' && k.participacao?.status !== 'aceito' && k.participacao?.status !== 'recusado'),
    participando: todas.filter((k) => k.campanha.status === 'ativa' && k.participacao?.status === 'aceito'),
    futuras: todas.filter((k) => k.campanha.status === 'agendada'),
    encerradas: todas.filter((k) => k.campanha.status === 'encerrada'),
  };
  const aba = (a && a in grupos ? a : 'disponiveis') as keyof typeof grupos;
  const lista = grupos[aba];
  return (
    <>
      <CabecalhoPagina titulo="Campanhas" descricao="Aceite campanhas, leia o briefing e acompanhe a sua meta." />
      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'disponiveis', rotulo: `Disponíveis (${grupos.disponiveis.length})`, href: '?aba=disponiveis' },
        { chave: 'participando', rotulo: `Participando (${grupos.participando.length})`, href: '?aba=participando' },
        { chave: 'futuras', rotulo: `Futuras (${grupos.futuras.length})`, href: '?aba=futuras' },
        { chave: 'encerradas', rotulo: `Encerradas (${grupos.encerradas.length})`, href: '?aba=encerradas' },
      ]} /></div>
      {!lista.length ? <Vazio titulo="Nenhuma campanha aqui" /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {lista.map((r) => {
            const k = r.campanha;
            const aceita = r.participacao?.status === 'aceito';
            return (
              <Cartao key={k.id} titulo={<span id={k.id}>{k.nome}</span>} acao={<EtiquetaStatus status={aceita ? 'aceito' : r.participacao?.status === 'convidado' ? 'convidado' : k.status} />}>
                <p className="text-xs text-suave">{r.loja.nome} · {formatarData(k.inicio)} a {formatarData(k.fim)}</p>
                <div className="my-3 flex flex-wrap gap-2">
                  <Etiqueta tom="destaque">{bpsParaTexto(aceita && r.participacao?.comissaoBpsNoAceite ? r.participacao.comissaoBpsNoAceite : k.comissaoBps)} de comissão</Etiqueta>
                  {r.beneficios.map((b) => <Etiqueta key={b.id}>{b.nome}</Etiqueta>)}
                </div>
                <p className="line-clamp-2 text-sm">{k.briefing}</p>
                {aceita && k.metaIndividualCentavos && (
                  <BarraProgresso className="mt-3" valor={r.minhasVendas} total={k.metaIndividualCentavos} legenda={`Sua meta: ${formatarReais(r.minhasVendas)} de ${formatarReais(k.metaIndividualCentavos)}`} />
                )}
                <div className="mt-4 flex justify-end">
                  <Modal largura="max-w-2xl" titulo={k.nome} gatilho={<Botao tamanho="p" variante={aceita || k.status !== 'ativa' ? 'secundario' : 'primario'}>{aceita || k.status !== 'ativa' ? 'Ver briefing' : 'Ver e aceitar'}</Botao>}>
                    <div className="space-y-4 text-sm">
                      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                        <dt className="text-suave">Loja</dt><dd>{r.loja.nome}</dd>
                        <dt className="text-suave">Período</dt><dd>{formatarData(k.inicio)} a {formatarData(k.fim)}</dd>
                        <dt className="text-suave">Comissão</dt><dd>{bpsParaTexto(k.comissaoBps)} sobre as vendas com o seu cupom</dd>
                        <dt className="text-suave">Entrega</dt><dd>{ENTREGA[k.entrega]}</dd>
                        <dt className="text-suave">Produtos</dt><dd>{r.produtos.join(', ')}</dd>
                        {k.metaIndividualCentavos && <><dt className="text-suave">Sua meta</dt><dd>{formatarReais(k.metaIndividualCentavos)}</dd></>}
                      </dl>
                      <div><p className="mb-1 font-medium">Briefing</p><p className="whitespace-pre-line rounded-lg bg-superficie-2 p-3">{k.briefing}</p></div>
                      {!aceita && k.status === 'ativa' && (
                        <FormSimulado mensagem="Campanha aceita (simulação). A comissão deste momento fica garantida." className="space-y-3">
                          <CaixaSelecao required name="concordo" rotulo="Li o briefing e concordo com as regras da campanha" />
                          <div className="flex justify-end"><Botao type="submit">Aceitar campanha</Botao></div>
                        </FormSimulado>
                      )}
                    </div>
                  </Modal>
                </div>
              </Cartao>
            );
          })}
        </div>
      )}
    </>
  );
}
