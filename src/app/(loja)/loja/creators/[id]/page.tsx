// Perfil completo do creator para decidir. Dono: M7. Dados de exemplo.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { CabecalhoPagina, Cartao, CartaoIndicador, Etiqueta, EtiquetaStatus } from '@/componentes';
import { BotaoCopiar, BotaoEmBreve } from '@/componentes/em-breve';
import { formatarReais } from '@/dominio/dinheiro';
import { exigirLoja } from '@/lib/acesso';
import { formatarNumero } from '@/lib/dados-exemplo';
import { perfilNaLoja } from '@/modulos/m7-aprovacao/dados';

const ORIGEM = { link: 'Link de convite', qr_code: 'QR code', email: 'Convite por e-mail', pagina: 'Página de cadastro' };

export default async function PerfilCreator({ params }: { params: Promise<{ id: string }> }) {
  const { lojaId } = await exigirLoja();
  const { id } = await params;
  const p = perfilNaLoja(lojaId, id);
  if (!p) notFound();
  const c = p.creator;
  const pendente = p.afiliacao.status === 'pendente';
  return (
    <>
      <CabecalhoPagina titulo={c.nome} voltar={<Link href={`/loja/creators?aba=${pendente ? 'aprovacao' : 'ativos'}`}>← Creators</Link>}
        descricao={`${c.cidade}/${c.uf} · veio por ${ORIGEM[p.afiliacao.origem]}`}
        acoes={<>
          <EtiquetaStatus status={p.afiliacao.status} />
          {pendente && <>
            <BotaoEmBreve variante="secundario" mensagem="Recusado (simulação).">Recusar</BotaoEmBreve>
            <BotaoEmBreve mensagem="Aprovado (simulação): cupom criado e e-mail enviado.">Aprovar</BotaoEmBreve>
          </>}
        </>} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoIndicador rotulo="Seguidores" valor={formatarNumero(p.perfil.seguidores)} detalhe={p.perfil.rede} />
        <CartaoIndicador rotulo="Engajamento" valor={`${((c.engajamentoBps ?? 0) / 100).toLocaleString('pt-BR')}%`} />
        <CartaoIndicador rotulo="Vendas nesta loja" valor={formatarReais(p.vendas)} detalhe={`${p.pedidos} pedidos`} />
        <CartaoIndicador rotulo="Vídeos" valor={p.videos} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Sobre">
          <p className="text-sm">{c.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">{c.segmentos.map((s) => <Etiqueta key={s}>{s}</Etiqueta>)}</div>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {c.instagram && <><dt className="text-suave">Instagram</dt><dd><a className="underline" href={`https://instagram.com/${c.instagram.perfil}`} target="_blank" rel="noreferrer">@{c.instagram.perfil}</a> · {formatarNumero(c.instagram.seguidores)}</dd></>}
            {c.tiktok && <><dt className="text-suave">TikTok</dt><dd><a className="underline" href={`https://tiktok.com/@${c.tiktok.perfil}`} target="_blank" rel="noreferrer">@{c.tiktok.perfil}</a> · {formatarNumero(c.tiktok.seguidores)}</dd></>}
            <dt className="text-suave">E-mail</dt><dd>{c.email}</dd>
            <dt className="text-suave">WhatsApp</dt><dd>{c.whatsapp}</dd>
            <dt className="text-suave">Tem o produto</dt><dd>{p.afiliacao.temProduto ? 'Sim' : 'Não'}</dd>
          </dl>
        </Cartao>
        <div className="space-y-4">
          <Cartao titulo="Critérios da loja">
            <ul className="space-y-2 text-sm">
              {p.criterios.map((k) => (
                <li key={k.nome} className="flex items-center gap-2">
                  {k.ok ? <CheckCircle2 size={16} className="text-sucesso" /> : <XCircle size={16} className="text-perigo" />}{k.nome}
                </li>
              ))}
            </ul>
          </Cartao>
          {p.cupom && (
            <Cartao titulo="Cupom">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-lg">{p.cupom.codigo}</span>
                <div className="flex items-center gap-2"><EtiquetaStatus status={p.cupom.status} /><BotaoCopiar texto={p.cupom.codigo} rotulo="Cupom" /></div>
              </div>
            </Cartao>
          )}
          {!!p.campanhas.length && (
            <Cartao titulo="Campanhas">
              <ul className="space-y-2 text-sm">
                {p.campanhas.map(({ p: part, k }) => (
                  <li key={k!.id} className="flex justify-between gap-2"><Link href={`/loja/campanhas/${k!.id}`} className="underline">{k!.nome}</Link><EtiquetaStatus status={part.status} /></li>
                ))}
              </ul>
            </Cartao>
          )}
        </div>
      </div>
    </>
  );
}
