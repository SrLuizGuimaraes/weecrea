// Configurações da loja. Abas: "Página de cadastro" e convites (dono: M6) e "Aprovação" (critérios, dono: M7).
// Dados de exemplo por enquanto; salvar só simula.
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { Abas, AreaTexto, Aviso, Botao, CabecalhoPagina, CaixaSelecao, Campo, Cartao, Selecao } from '@/componentes';
import { BotaoCopiar, FormSimulado } from '@/componentes/em-breve';
import { exigirLoja } from '@/lib/acesso';
import { dados } from '@/lib/dados-exemplo';
import { urlDoApp } from '@/lib/link-senha';

const SEGMENTOS = ['Moda', 'Beleza', 'Lifestyle', 'Casa', 'Decoração', 'Fitness', 'Gastronomia', 'Maternidade', 'Pets', 'Tecnologia'];

export default async function Configuracoes({ searchParams }: { searchParams: Promise<{ aba?: string; campanha?: string }> }) {
  const { lojaId } = await exigirLoja();
  const { aba: a, campanha } = await searchParams;
  const aba = a === 'aprovacao' ? 'aprovacao' : 'pagina';
  const loja = dados.lojas.find((l) => l.id === lojaId)!;
  const campanhas = dados.campanhas.filter((k) => k.lojaId === lojaId && (k.status === 'ativa' || k.status === 'agendada'));
  const link = `${urlDoApp()}/c/${loja.slug}${campanha ? `?campanha=${campanha}` : ''}`;
  const qr = await QRCode.toDataURL(link, { margin: 1, width: 480 });
  const k = loja.criterios;
  return (
    <>
      <CabecalhoPagina titulo="Configurações" descricao="Página de cadastro, convites e critérios de aprovação." />
      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'pagina', rotulo: 'Página de cadastro', href: '?aba=pagina' },
        { chave: 'aprovacao', rotulo: 'Aprovação', href: '?aba=aprovacao' },
      ]} /></div>

      {aba === 'pagina' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Cartao titulo="Página de cadastro">
            <FormSimulado mensagem="Página salva (simulação)." className="space-y-4">
              <Campo rotulo="Título" name="titulo" defaultValue={loja.paginaCadastro.titulo} />
              <AreaTexto rotulo="Texto" name="texto" defaultValue={loja.paginaCadastro.texto} rows={4} />
              <CaixaSelecao name="aberta" rotulo="Inscrições abertas" defaultChecked={loja.paginaCadastro.aberta} />
              <div className="flex flex-wrap justify-between gap-2">
                <a href={`/c/${loja.slug}`} target="_blank" rel="noreferrer" className="self-center text-sm underline">Ver a página</a>
                <Botao type="submit">Salvar</Botao>
              </div>
            </FormSimulado>
          </Cartao>
          <Cartao titulo="Link e QR code de convite">
            <form method="get" className="mb-3 flex items-end gap-2">
              <input type="hidden" name="aba" value="pagina" />
              <Selecao rotulo="Convidar para uma campanha (opcional)" name="campanha" defaultValue={campanha ?? ''} className="flex-1">
                <option value="">Sem campanha</option>
                {campanhas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Selecao>
              <Botao type="submit" variante="secundario">Gerar</Botao>
            </form>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code do convite" className="size-40 rounded-lg border border-borda bg-white p-2" />
              <div className="min-w-0 space-y-2">
                <p className="break-all rounded-lg bg-superficie-2 p-2 font-mono text-xs">{link}</p>
                <div className="flex flex-wrap gap-2">
                  <BotaoCopiar texto={link} rotulo="Link" />
                  <a href={qr} download={`convite-${loja.slug}.png`} className="inline-flex h-8 items-center gap-2 rounded-lg border border-borda px-3 text-xs font-medium"><Download size={14} />Baixar QR code</a>
                </div>
              </div>
            </div>
          </Cartao>
          <Cartao titulo="Convite por e-mail" className="lg:col-span-2">
            <FormSimulado mensagem="Convites enviados (simulação)." className="space-y-3">
              <AreaTexto rotulo="E-mails" name="emails" rows={3} placeholder="um@exemplo.com, outro@exemplo.com" ajuda="Até 50 endereços, separados por vírgula ou linha." />
              <div className="flex justify-end"><Botao type="submit">Enviar convites</Botao></div>
            </FormSimulado>
          </Cartao>
        </div>
      ) : (
        <FormSimulado mensagem="Critérios salvos (simulação). Com a aprovação automática ligada, a fila seria reavaliada." className="space-y-4">
          <Aviso tom="info">Com a aprovação automática ligada, quem atende a todos os critérios entra na hora, com cupom. Os demais ficam na fila com o motivo. O sistema nunca recusa sozinho.</Aviso>
          <Cartao titulo="Critérios">
            <div className="grid gap-4 md:grid-cols-2">
              <CaixaSelecao name="automatica" rotulo="Aprovação automática" defaultChecked={k.aprovacaoAutomatica} className="md:col-span-2" />
              <Campo rotulo="Seguidores mínimos" name="seguidoresMin" type="number" min="0" defaultValue={k.seguidoresMin} ajuda="Conta a rede com mais seguidores entre as aceitas." />
              <Campo rotulo="Engajamento mínimo (%)" name="engajamentoMin" type="number" step="0.1" min="0" defaultValue={k.engajamentoMinBps / 100} />
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Redes aceitas</legend>
                <CaixaSelecao name="redes" value="instagram" rotulo="Instagram" defaultChecked={k.redesAceitas.includes('instagram')} className="mr-4" />
                <CaixaSelecao name="redes" value="tiktok" rotulo="TikTok" defaultChecked={k.redesAceitas.includes('tiktok')} />
              </fieldset>
              <CaixaSelecao name="exigeProduto" rotulo="Exigir que já tenha o produto" defaultChecked={k.exigeTerProduto} />
              <fieldset className="space-y-2 md:col-span-2">
                <legend className="text-sm font-medium">Segmentos aceitos <span className="font-normal text-suave">(nenhum marcado = todos)</span></legend>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {SEGMENTOS.map((s) => <CaixaSelecao key={s} name="segmentos" value={s} rotulo={s} defaultChecked={k.segmentosAceitos.includes(s)} />)}
                </div>
              </fieldset>
            </div>
          </Cartao>
          <div className="flex justify-end"><Botao type="submit">Salvar critérios</Botao></div>
        </FormSimulado>
      )}
    </>
  );
}
