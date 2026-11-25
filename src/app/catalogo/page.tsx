// Catálogo de componentes. Dono: M2. Aberto sem login (não mostra dados).
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DollarSign } from 'lucide-react';
import { Botao, BotaoLink } from '@/componentes/botao';
import { AreaTexto, CaixaSelecao, Campo, Selecao } from '@/componentes/campos';
import { Etiqueta, EtiquetaStatus } from '@/componentes/etiquetas';
import { Abas, Paginacao, Tabela, Td } from '@/componentes/tabela';
import { Aviso, Cartao, CartaoIndicador, Vazio } from '@/componentes/cartoes';
import { CartaoVideo } from '@/componentes/cartao-video';
import { CabecalhoPagina } from '@/componentes/cabecalho-pagina';
import { BotaoTema } from '@/componentes/tema';
import { formatarReais } from '@/dominio/dinheiro';
import { DemoChips, DemoModal, DemoToast } from './demos';

export const metadata: Metadata = { title: 'Catálogo · WEECREA' };

function Secao({ titulo, codigo, children }: { titulo: string; codigo: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-borda bg-superficie p-4 md:p-5">
      <h2 className="font-semibold">{titulo}</h2>
      <div className="space-y-3">{children}</div>
      <pre className="overflow-x-auto rounded-lg bg-superficie-2 p-3 text-xs"><code>{codigo}</code></pre>
    </section>
  );
}

export default function Catalogo() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo de componentes</h1>
          <p className="text-sm text-suave">Importe de <code>@/componentes</code>. Troque o tema no botão ao lado.</p>
        </div>
        <BotaoTema />
      </div>

      <Secao titulo="Cabeçalho de página" codigo={`<CabecalhoPagina titulo="Campanhas" descricao="..." acoes={<BotaoLink href="/loja/campanhas/nova">Nova campanha</BotaoLink>} />`}>
        <CabecalhoPagina titulo="Campanhas" descricao="Crie campanhas e acompanhe a meta de cada uma." acoes={<BotaoLink href="#">Nova campanha</BotaoLink>} />
      </Secao>

      <Secao titulo="Botões" codigo={`<Botao>Salvar</Botao>\n<Botao variante="destaque|secundario|fantasma|perigo" tamanho="p|m|g">...</Botao>\n<BotaoLink href="/x">Abrir</BotaoLink>`}>
        <div className="flex flex-wrap items-center gap-2">
          <Botao>Primário</Botao>
          <Botao variante="destaque">Destaque</Botao>
          <Botao variante="secundario">Secundário</Botao>
          <Botao variante="fantasma">Fantasma</Botao>
          <Botao variante="perigo">Perigo</Botao>
          <Botao tamanho="p" variante="secundario">Pequeno</Botao>
          <Botao disabled>Desativado</Botao>
        </div>
      </Secao>

      <Secao titulo="Campos" codigo={`<Campo rotulo="E-mail" name="email" type="email" ajuda="..." erro="..." />\n<Selecao rotulo="UF" name="uf" opcoes={[{ valor: 'SP', rotulo: 'São Paulo' }]} />\n<AreaTexto rotulo="Briefing" name="briefing" />\n<CaixaSelecao rotulo="Aceito os termos" name="termos" />`}>
        <div className="grid gap-3 md:grid-cols-2">
          <Campo rotulo="E-mail" type="email" placeholder="voce@exemplo.com" ajuda="Usamos para o login." />
          <Campo rotulo="Seguidores" type="number" defaultValue={1200} erro="Mínimo de 5.000 seguidores." />
          <Selecao rotulo="UF" opcoes={[{ valor: 'SP', rotulo: 'São Paulo' }, { valor: 'MG', rotulo: 'Minas Gerais' }]} />
          <AreaTexto rotulo="Fale sobre você" placeholder="30 a 500 caracteres" />
          <CaixaSelecao rotulo="Aceito os termos" />
        </div>
      </Secao>

      <Secao titulo="Chips de filtro e etiquetas de status" codigo={`<Chip href="?rede=instagram" ativo>Instagram</Chip>\n<Etiqueta tom="sucesso">Texto</Etiqueta>\n<EtiquetaStatus status="em_analise" />`}>
        <DemoChips />
        <div className="flex flex-wrap gap-2">
          {['pendente', 'aprovado', 'recusado', 'ativa', 'agendada', 'encerrada', 'pago', 'cancelado', 'prevista', 'liberada', 'paga', 'estornada', 'em_analise', 'reprovado', 'erro_sync'].map((s) => (
            <EtiquetaStatus key={s} status={s} />
          ))}
          <Etiqueta tom="destaque">Destaque</Etiqueta>
        </div>
      </Secao>

      <Secao titulo="Abas, tabela e paginação" codigo={`<Abas ativa="ativas" abas={[{ chave: 'ativas', rotulo: 'Ativas', href: '?aba=ativas' }]} />\n<Tabela colunas={['Creator', 'Vendas']} alinharDireita={[1]}><tr><Td>..</Td><Td direita>..</Td></tr></Tabela>\n<Paginacao pagina={1} totalPaginas={3} hrefDaPagina={(n) => \`?p=\${n}\`} />`}>
        <Abas ativa="ativas" abas={[
          { chave: 'ativas', rotulo: 'Ativas', href: '#' }, { chave: 'futuras', rotulo: 'Futuras', href: '#' },
          { chave: 'encerradas', rotulo: 'Encerradas', href: '#' }, { chave: 'todas', rotulo: 'Todas', href: '#' },
        ]} />
        <Tabela colunas={['Creator', 'Cupom', 'Status', 'Vendas']} alinharDireita={[3]}>
          {[['Marina Couto', 'MARINA10', 'aprovado', 389900], ['Rafa Lima', 'RAFA10', 'pausado', 51250], ['Bia Torres', '—', 'pendente', 0]].map(([n, c, s, v]) => (
            <tr key={String(n)}><Td>{n}</Td><Td>{c}</Td><Td><EtiquetaStatus status={String(s)} /></Td><Td direita>{formatarReais(Number(v))}</Td></tr>
          ))}
        </Tabela>
        <Paginacao pagina={2} totalPaginas={5} hrefDaPagina={(n) => `/catalogo?p=${n}`} />
      </Secao>

      <Secao titulo="Cartões, indicador e avisos" codigo={`<CartaoIndicador rotulo="Vendas" valor={formatarReais(123456)} variacao={{ texto: '+12%', positiva: true }} detalhe="vs. período anterior" />\n<Cartao titulo="Título">...</Cartao>\n<Aviso tom="info|sucesso|aviso|perigo" titulo="...">...</Aviso>\n<Vazio titulo="Nenhum vídeo">...</Vazio>`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CartaoIndicador rotulo="Vendas" valor={formatarReais(1834590)} variacao={{ texto: '+12%', positiva: true }} detalhe="vs. período anterior" icone={<DollarSign size={14} />} />
          <CartaoIndicador rotulo="Pedidos com cupom" valor="57" />
          <CartaoIndicador rotulo="Ticket médio" valor={formatarReais(32186)} variacao={{ texto: '-3%', positiva: false }} />
          <CartaoIndicador rotulo="Comissões a pagar" valor={formatarReais(245000)} />
        </div>
        <Cartao titulo="Cartão com título" acao={<Botao tamanho="p" variante="secundario">Ação</Botao>}>Conteúdo do cartão.</Cartao>
        <Aviso tom="info" titulo="Informação">A conexão com a Nuvemshop está ativa.</Aviso>
        <Aviso tom="sucesso">Campanha publicada.</Aviso>
        <Aviso tom="aviso" titulo="Atenção">3 creators aguardam aprovação.</Aviso>
        <Aviso tom="perigo">Não foi possível criar o cupom na loja.</Aviso>
        <Vazio titulo="Nenhum vídeo ainda" acao={<Botao variante="secundario">Enviar vídeo</Botao>}>Os vídeos dos creators aparecem aqui.</Vazio>
      </Secao>

      <Secao titulo="Janela (modal) e mensagem rápida (toast)" codigo={`<Modal gatilho={<Botao>Abrir</Botao>} titulo="Título">{(fechar) => ...}</Modal>\nconst toast = useToast(); toast('Salvo'); toast('Erro', 'perigo');\n// Depois de uma Server Action: redirect('/x?toast=Salvo')`}>
        <div className="flex flex-wrap gap-2"><DemoModal /><DemoToast /></div>
      </Secao>

      <Secao titulo="Cartão de vídeo (9:16)" codigo={`<CartaoVideo miniaturaUrl={v.miniaturaUrl} perfil="@marina" rede="Instagram" formato="Reels" status="aprovado" selecao={{ name: 'videoIds', value: v.id }} />`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CartaoVideo perfil="@marinacouto" rede="Instagram" formato="Reels" status="aprovado" selecao={{ name: 'v', value: '1' }} />
          <CartaoVideo perfil="@rafalima" rede="TikTok" formato="TikTok" status="em_analise" selecao={{ name: 'v', value: '2' }} />
          <CartaoVideo perfil="@juliaandrade" rede="Instagram" formato="Story" status="reprovado" />
          <CartaoVideo perfil="@sofiabezerra" rede="Instagram" formato="Feed" rodape="Verão 27 no linho" />
        </div>
      </Secao>

      <Secao titulo="Menu lateral" codigo={`<MoldeArea menu={<MenuLateral perfil="LOJA" titulo={loja.nome} nome={usuario.nome} sair={sair} />}>{children}</MoldeArea>`}>
        <p className="text-sm text-suave">O menu das 3 áreas já está nos layouts de /loja, /creator e /weethub. No celular ele vira uma barra no topo com o botão de abrir.</p>
      </Secao>
    </main>
  );
}
