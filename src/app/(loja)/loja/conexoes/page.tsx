// Conexões: Nuvemshop. Dono: M3. Dados de exemplo; conectar e desconectar só simulam.
import { CheckCircle2, Link2 } from 'lucide-react';
import { Aviso, CabecalhoPagina, Cartao, CartaoIndicador, Etiqueta } from '@/componentes';
import { BotaoEmBreve } from '@/componentes/em-breve';
import { exigirLoja } from '@/lib/acesso';
import { formatarDataHora } from '@/lib/datas';
import { conexaoDaLoja } from '@/modulos/m3-nuvemshop/dados';

export default async function Conexoes() {
  const { lojaId } = await exigirLoja();
  const c = conexaoDaLoja(lojaId);
  const conectada = c.loja.nuvemshopConectada;
  return (
    <>
      <CabecalhoPagina titulo="Conexões" descricao="Ligue a sua loja Nuvemshop para importar produtos, criar cupons e receber os pedidos." />
      <Cartao titulo={<span className="flex items-center gap-2"><Link2 size={16} />Nuvemshop</span>}
        acao={conectada ? <Etiqueta tom="sucesso"><CheckCircle2 size={12} className="mr-1" />Conectada</Etiqueta> : <Etiqueta>Desconectada</Etiqueta>}>
        {conectada ? (
          <div className="space-y-4">
            <p className="text-sm">Loja Nuvemshop <b>#{c.loja.nuvemshopStoreId}</b> ligada à <b>{c.loja.nome}</b>.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <CartaoIndicador rotulo="Produtos importados" valor={c.produtos} />
              <CartaoIndicador rotulo="Pedidos recebidos" valor={c.pedidos} />
              <CartaoIndicador rotulo="Último aviso" valor={<span className="text-base">{c.ultimoAviso ? formatarDataHora(c.ultimoAviso) : '—'}</span>} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Avisos registrados (webhooks)</p>
              <div className="flex flex-wrap gap-2">{c.webhooks.map((w) => <Etiqueta key={w}>{w}</Etiqueta>)}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <BotaoEmBreve variante="secundario" mensagem="Buscando pedidos dos últimos 7 dias (simulação).">Conferir pedidos agora</BotaoEmBreve>
              <BotaoEmBreve variante="fantasma" mensagem="Desconectar (simulação).">Desconectar</BotaoEmBreve>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Aviso tom="info">Ao conectar, a WEECREA importa os produtos, registra os avisos de pedidos e passa a criar os cupons dos creators direto na sua loja.</Aviso>
            <BotaoEmBreve mensagem="Abrindo a autorização da Nuvemshop (simulação).">Conectar Nuvemshop</BotaoEmBreve>
          </div>
        )}
      </Cartao>
    </>
  );
}
