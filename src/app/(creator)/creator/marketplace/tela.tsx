'use client';
// Marketplace: lojas da WEECREA em que o creator ainda não está, para se candidatar. Estado da demonstração.
// (Tela do protótipo, fora do guia; usa as mesmas regras da página de cadastro: R-22, R-23 e R-25.)
import Link from 'next/link';
import { Abas, Botao, CabecalhoPagina, CaixaSelecao, Cartao, Etiqueta, EtiquetaStatus, Modal, Vazio } from '@/componentes';
import { useToast } from '@/componentes/toast';
import { bpsParaTexto } from '@/dominio/dinheiro';
import { useDemo } from '@/lib/demo/estado';
import { candidatarALoja } from '@/modulos/m6-cadastro/acoes';

export function TelaMarketplace({ creatorId, aba: a }: { creatorId: string; aba?: string }) {
  const { D, mudar } = useDemo();
  const toast = useToast();
  const aba = a === 'minhas' ? 'minhas' : 'descobrir';
  const minhas = D.afiliacoes.filter((x) => x.creatorId === creatorId);
  const lojas = D.lojas.filter((l) => l.status === 'ativa' || l.status === 'implantacao');
  const descobrir = lojas.filter((l) => !minhas.some((m) => m.lojaId === l.id && m.status !== 'recusado' && m.status !== 'removido'));
  return (
    <>
      <CabecalhoPagina titulo="Marketplace" descricao="Lojas da WEECREA que buscam creators. Candidate-se com o seu perfil." />
      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'descobrir', rotulo: `Descobrir (${descobrir.length})`, href: '?aba=descobrir' },
        { chave: 'minhas', rotulo: `Minhas lojas (${minhas.length})`, href: '?aba=minhas' },
      ]} /></div>
      {aba === 'minhas' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {minhas.map((m) => {
            const l = D.lojas.find((x) => x.id === m.lojaId)!;
            const cupom = D.cupons.find((c) => c.lojaId === l.id && c.creatorId === creatorId);
            return (
              <Cartao key={m.id} titulo={l.nome} acao={<EtiquetaStatus status={m.status} />}>
                <p className="text-sm text-suave">{bpsParaTexto(m.comissaoPropriaBps ?? l.comissaoPadraoBps)} de comissão · cupom de {l.cupomDescontoPct}%</p>
                {cupom && <p className="mt-2 font-mono text-sm">Seu cupom: <b>{cupom.codigo}</b></p>}
                {m.status === 'pendente' && <p className="mt-2 text-sm text-aviso">Em análise{m.falhasCriterios[0] ? `: ${m.falhasCriterios[0]}` : ''}</p>}
                {(m.status === 'aprovado' || m.status === 'pausado') && <Link href={`/creator/inicio?loja=${l.id}`} className="mt-3 inline-block text-sm underline">Ver meus números</Link>}
              </Cartao>
            );
          })}
        </div>
      ) : !descobrir.length ? <Vazio titulo="Você já está em todas as lojas abertas" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {descobrir.map((l) => {
            const ativas = D.campanhas.filter((k) => k.lojaId === l.id && k.status === 'ativa' && k.visibilidade === 'aberta');
            const fechada = !l.paginaCadastro.aberta;
            return (
              <Cartao key={l.id} titulo={l.nome} acao={fechada ? <Etiqueta>Inscrições fechadas</Etiqueta> : <Etiqueta tom="sucesso">Aberta</Etiqueta>}>
                <p className="text-sm">{l.paginaCadastro.texto || l.paginaCadastro.titulo}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Etiqueta tom="destaque">{bpsParaTexto(l.comissaoPadraoBps)} de comissão</Etiqueta>
                  <Etiqueta>Cupom de {l.cupomDescontoPct}%</Etiqueta>
                  <Etiqueta>{ativas.length} campanha(s) ativa(s)</Etiqueta>
                </div>
                {!!ativas.length && <ul className="mt-3 space-y-1 text-xs text-suave">{ativas.map((k) => <li key={k.id}>• {k.nome}: {bpsParaTexto(k.comissaoBps)}</li>)}</ul>}
                <div className="mt-4 flex justify-end">
                  <Modal titulo={`Candidatar-se à ${l.nome}`} gatilho={<Botao tamanho="p" disabled={fechada}>Quero participar</Botao>}>
                    {(fechar) => (
                      <form className="space-y-3 text-sm" onSubmit={(e) => {
                        e.preventDefault();
                        let r: ReturnType<typeof candidatarALoja> | undefined;
                        if (mudar((d) => { r = candidatarALoja(d, creatorId, l.id, new FormData(e.currentTarget).get('temProduto') === 'on'); }) && r) {
                          toast(r.status === 'aprovado' ? `Aprovado na hora! Seu cupom: ${r.cupom}` : `Cadastro em análise: ${r.motivo}`, r.status === 'aprovado' ? 'sucesso' : 'info');
                          fechar();
                        }
                      }}>
                        <p>Vamos usar o seu perfil (redes, seguidores, segmentos e bio). Confira em <Link href="/creator/perfil" className="underline">Perfil</Link>.</p>
                        <CaixaSelecao name="temProduto" rotulo={`Já tenho produto da ${l.nome}`} />
                        <div className="flex justify-end"><Botao type="submit">Enviar candidatura</Botao></div>
                      </form>
                    )}
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
