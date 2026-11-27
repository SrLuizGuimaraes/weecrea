'use client';
// Configurações da loja. Abas: "Página de cadastro" e convites (M6) e "Aprovação" (critérios, M7). Estado da demonstração.
import Form from 'next/form';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Abas, AreaTexto, Aviso, Botao, CabecalhoPagina, CaixaSelecao, Campo, Cartao, Selecao } from '@/componentes';
import { BotaoCopiar } from '@/componentes/em-breve';
import type { Rede } from '@/contratos/tipos';
import { useDados } from '@/lib/dados-reais-cliente';
import { useToast } from '@/componentes/toast';
import { enviarConvitesEmailServidor, salvarPaginaCadastroServidor } from '@/modulos/m6-cadastro/servidor';
import { salvarCriteriosServidor } from '@/modulos/m7-aprovacao/servidor';

const SEGMENTOS = ['Moda', 'Beleza', 'Lifestyle', 'Casa', 'Decoração', 'Fitness', 'Gastronomia', 'Maternidade', 'Pets', 'Tecnologia', 'Dia a dia', 'Viagem'];

export function TelaConfiguracoes({ lojaId, aba: a, campanha, urlApp }: { lojaId: string; aba?: string; campanha?: string; urlApp: string }) {
  const { D, executar } = useDados();
  const toast = useToast();
  const aba = a === 'aprovacao' ? 'aprovacao' : 'pagina';
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  const campanhas = D.campanhas.filter((k) => k.lojaId === lojaId && (k.status === 'ativa' || k.status === 'agendada'));
  const link = `${urlApp}/c/${loja.slug}${campanha ? `?campanha=${campanha}` : ''}`;
  const [qr, setQr] = useState('');
  useEffect(() => { QRCode.toDataURL(`${link}${link.includes('?') ? '&' : '?'}origem=qr_code`, { margin: 1, width: 480 }).then(setQr).catch(() => setQr('')); }, [link]);
  const k = loja.criterios;
  const pendentes = D.afiliacoes.filter((x) => x.lojaId === lojaId && x.status === 'pendente').length;

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
            <form key={loja.paginaCadastro.titulo + loja.paginaCadastro.aberta} className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              await executar(() => salvarPaginaCadastroServidor({ titulo: String(f.get('titulo')), texto: String(f.get('texto')), aberta: f.get('aberta') === 'on' }), 'Página salva');
            }}>
              <Campo rotulo="Título" name="titulo" required defaultValue={loja.paginaCadastro.titulo} />
              <AreaTexto rotulo="Texto" name="texto" defaultValue={loja.paginaCadastro.texto} rows={4} />
              <CaixaSelecao name="aberta" rotulo="Inscrições abertas" defaultChecked={loja.paginaCadastro.aberta} />
              <div className="flex flex-wrap justify-between gap-2">
                <Link href={`/c/${loja.slug}`} className="self-center text-sm underline">Ver a página</Link>
                <Botao type="submit">Salvar</Botao>
              </div>
            </form>
          </Cartao>
          <Cartao titulo="Link e QR code de convite">
            <Form action="/loja/configuracoes" className="mb-3 flex items-end gap-2">
              <input type="hidden" name="aba" value="pagina" />
              <Selecao rotulo="Convidar para uma campanha (opcional)" name="campanha" defaultValue={campanha ?? ''} className="flex-1">
                <option value="">Sem campanha</option>
                {campanhas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Selecao>
              <Botao type="submit" variante="secundario">Gerar</Botao>
            </Form>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {qr ? <img src={qr} alt="QR code do convite" className="size-40 rounded-lg border border-borda bg-white p-2" /> : <div className="size-40 rounded-lg bg-superficie-2" />}
              <div className="min-w-0 space-y-2">
                <p className="break-all rounded-lg bg-superficie-2 p-2 font-mono text-xs">{link}</p>
                <div className="flex flex-wrap gap-2">
                  <BotaoCopiar texto={link} rotulo="Link" />
                  {qr && <a href={qr} download={`convite-${loja.slug}.png`} className="inline-flex h-8 items-center gap-2 rounded-controle border border-borda px-3 text-xs font-semibold"><Download size={14} />Baixar QR code</a>}
                </div>
              </div>
            </div>
          </Cartao>
          <Cartao titulo="Convite por e-mail" className="lg:col-span-2">
            <form className="space-y-3" onSubmit={async (e) => {
              e.preventDefault();
              const formulario = e.currentTarget;
              const emails = String(new FormData(formulario).get('emails') ?? '').split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean);
              const r = await executar(() => enviarConvitesEmailServidor(emails, campanha),
                (d) => `${d.enviados} convite(s) enviado(s) com o link da página${d.invalidos ? `; ${d.invalidos} endereço(s) inválido(s) ignorado(s)` : ''}.`);
              if (r) formulario.reset();
            }}>
              <AreaTexto rotulo="E-mails" name="emails" rows={3} placeholder="um@exemplo.com, outro@exemplo.com" ajuda="Até 50 endereços, separados por vírgula ou linha." />
              <div className="flex justify-end"><Botao type="submit">Enviar convites</Botao></div>
            </form>
          </Cartao>
        </div>
      ) : (
        <form key={JSON.stringify(k)} className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const criterios = {
            aprovacaoAutomatica: f.get('automatica') === 'on', seguidoresMin: Number(f.get('seguidoresMin') || 0),
            engajamentoMinBps: Math.round(Number(f.get('engajamentoMin') || 0) * 100), redesAceitas: f.getAll('redes').map(String) as Rede[],
            segmentosAceitos: f.getAll('segmentos').map(String), exigeTerProduto: f.get('exigeProduto') === 'on',
          };
          if (!criterios.redesAceitas.length) return toast('Aceite ao menos uma rede.', 'perigo');
          await executar(() => salvarCriteriosServidor(criterios),
            (n) => (criterios.aprovacaoAutomatica ? `Critérios salvos. A fila foi reavaliada: ${n} creator(s) aprovado(s) na hora.` : 'Critérios salvos.'));
        }}>
          <Aviso tom="info">Com a aprovação automática ligada, quem atende a todos os critérios entra na hora, com cupom. Os demais ficam na fila com o motivo. O sistema nunca recusa sozinho. Hoje há {pendentes} na fila.</Aviso>
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
        </form>
      )}
    </>
  );
}
