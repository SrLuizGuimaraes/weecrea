'use client';
// Conexões (M3) e pedidos recebidos (M4). Dados reais: a conexão e os pedidos vêm da Nuvemshop.
import { CheckCircle2, Link2 } from 'lucide-react';
import { Abas, Aviso, Botao, CabecalhoPagina, Cartao, CartaoIndicador, Etiqueta, EtiquetaStatus, Tabela, Td } from '@/componentes';
import { formatarReais } from '@/dominio/dinheiro';
import { formatarDataHora } from '@/lib/datas';
import { useDados } from '@/lib/dados-reais-cliente';
import { desconectarNuvemshopServidor } from '@/modulos/m3-nuvemshop/servidor';
import { conexaoDaLoja } from '@/modulos/m3-nuvemshop/dados';

const ERROS: Record<string, string> = {
  config: 'A conexão com a Nuvemshop ainda não foi configurada no servidor (chaves do app). Fale com o time técnico.',
  state: 'O pedido de conexão expirou ou não é desta loja. Clique em Conectar de novo.',
  em_uso: 'Esta loja da Nuvemshop já está ligada a outra loja na WEECREA.',
  troca: 'A Nuvemshop não confirmou a autorização. Tente conectar de novo.',
};

export interface ExtrasConexao { webhooks: string[] | null; ultimoAviso?: string; avisosComErro: number }

export function TelaConexoes({ lojaId, aba: a, extras, aviso, erro }: { lojaId: string; aba?: string; extras: ExtrasConexao; aviso?: string; erro?: string }) {
  const { D, executar } = useDados();
  const aba = a === 'pedidos' ? 'pedidos' : 'integracoes';
  const c = conexaoDaLoja(D, lojaId);
  const conectada = c.loja.nuvemshopConectada;
  return (
    <>
      <CabecalhoPagina titulo="Conexões" descricao="Ligue a sua loja Nuvemshop para importar produtos, criar cupons e receber os pedidos." />
      {erro && <div className="mb-4"><Aviso tom="perigo">{ERROS[erro] ?? 'Não foi possível conectar.'}</Aviso></div>}
      {aviso === 'conectada' && <div className="mb-4"><Aviso tom="info">Nuvemshop conectada. Estamos importando os produtos e os pedidos dos últimos 90 dias em segundo plano; atualize a página em alguns instantes.</Aviso></div>}
      <div className="mb-4"><Abas ativa={aba} abas={[
        { chave: 'integracoes', rotulo: 'Integrações', href: '?aba=integracoes' },
        { chave: 'pedidos', rotulo: `Pedidos recebidos (${c.pedidos})`, href: '?aba=pedidos' },
      ]} /></div>
      {aba === 'pedidos' ? <Pedidos /> : (
        <div className="space-y-4">
          <Cartao titulo={<span className="flex items-center gap-2"><Link2 size={16} />Nuvemshop</span>}
            acao={conectada ? <Etiqueta tom="sucesso"><CheckCircle2 size={12} className="mr-1" />Conectada</Etiqueta> : <Etiqueta>Desconectada</Etiqueta>}>
            {conectada ? (
              <div className="space-y-4">
                <p className="text-sm">Loja Nuvemshop <b>#{c.loja.nuvemshopStoreId}</b> ligada à <b>{c.loja.nome}</b>.</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <CartaoIndicador rotulo="Produtos importados" valor={c.produtos} />
                  <CartaoIndicador rotulo="Pedidos recebidos" valor={c.pedidos} />
                  <CartaoIndicador rotulo="Último aviso" valor={<span className="text-base">{extras.ultimoAviso ? formatarDataHora(extras.ultimoAviso) : '—'}</span>} />
                </div>
                {extras.avisosComErro > 0 && <Aviso tom="aviso">{extras.avisosComErro} aviso(s) da Nuvemshop não puderam ser processados. O sistema confere os pedidos de novo todo dia; se persistir, fale com o time técnico.</Aviso>}
                <div>
                  <p className="mb-2 text-sm font-medium">Avisos registrados na Nuvemshop (webhooks)</p>
                  {extras.webhooks === null ? <p className="text-sm text-suave">Não foi possível consultar agora.</p>
                    : extras.webhooks.length === 0 ? <Aviso tom="aviso">Nenhum aviso registrado. Sem eles os pedidos só entram na conferência diária.</Aviso>
                    : <div className="flex flex-wrap gap-2">{extras.webhooks.map((w) => <Etiqueta key={w}>{w}</Etiqueta>)}</div>}
                </div>
                <Botao variante="fantasma" onClick={() => { if (window.confirm('Desconectar a Nuvemshop? Os cupons novos ficam com erro até conectar de novo.')) executar(() => desconectarNuvemshopServidor(), 'Nuvemshop desconectada.'); }}>Desconectar</Botao>
              </div>
            ) : (
              <div className="space-y-4">
                <Aviso tom="info">Ao conectar, a WEECREA importa os produtos, registra os avisos de pedidos e passa a criar os cupons dos creators direto na sua loja.</Aviso>
                {/* Link comum (não next/link): vai para uma rota do servidor que redireciona para a Nuvemshop. */}
                <a href="/api/nuvemshop/oauth" className="inline-flex h-10 items-center justify-center rounded-controle bg-texto px-4 text-sm font-semibold text-fundo">Conectar Nuvemshop</a>
              </div>
            )}
          </Cartao>
          <div className="grid gap-4 md:grid-cols-2">
            {['Instagram', 'TikTok'].map((r) => (
              <Cartao key={r} titulo={r} acao={<Etiqueta tom="info">Fase 2</Etiqueta>}>
                <p className="text-sm text-suave">Busca automática dos vídeos que marcam a loja. Entra depois de 02/12; por enquanto os creators enviam o link em Conteúdos.</p>
                <Botao className="mt-3" variante="secundario" disabled>Conectar {r}</Botao>
              </Cartao>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Pedidos() {
  const { D } = useDados();
  const pedidos = [...D.pedidos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 50);
  const nome = (id?: string) => D.creators.find((c) => c.id === id)?.nome;
  return (
    <div className="space-y-4">
      <p className="text-sm text-suave">Os últimos 50 pedidos recebidos da Nuvemshop. A comissão de cada venda aparece no Financeiro, quando esse módulo entrar.</p>
      <Tabela colunas={['Pedido', 'Data', 'Cupom', 'Creator', 'Total', 'Estado']} alinharDireita={[4]} vazio="Nenhum pedido recebido ainda.">
        {pedidos.map((p) => (
          <tr key={p.id}>
            <Td className="font-mono text-xs">#{p.numero}</Td><Td>{formatarDataHora(p.criadoEm)}</Td>
            <Td className="font-mono text-xs">{p.cupom ?? '—'}</Td>
            <Td>{nome(p.creatorId) ?? <span className="text-suave">—</span>}{p.autocompra && <Etiqueta tom="aviso" className="ml-1">Autocompra</Etiqueta>}</Td>
            <Td direita>{formatarReais(p.totalCentavos)}</Td>
            <Td><EtiquetaStatus status={p.estado} /></Td>
          </tr>
        ))}
      </Tabela>
    </div>
  );
}
