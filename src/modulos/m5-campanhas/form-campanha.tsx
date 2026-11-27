'use client';
// Formulário de campanha (criar e editar). Dono: M5. Salva no estado da demonstração; em campanha ativa aplica a R-13.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AreaTexto, Aviso, Botao, BotaoLink, CabecalhoPagina, CaixaSelecao, Campo, Cartao, Selecao } from '@/componentes';
import type { Campanha } from '@/contratos/tipos';
import { paraCentavos } from '@/dominio/dinheiro';
import { useDados } from '@/lib/dados-reais-cliente';
import { salvarCampanhaServidor } from './servidor';

export function FormCampanha({ lojaId, campanhaId }: { lojaId: string; campanhaId?: string }) {
  const { D, executar } = useDados();
  const router = useRouter();
  const campanha = campanhaId ? D.campanhas.find((k) => k.id === campanhaId && k.lojaId === lojaId) : undefined;
  if (campanhaId && !campanha) return <Aviso tom="perigo">Campanha não encontrada.</Aviso>;
  const produtos = D.produtos.filter((p) => p.lojaId === lojaId);
  const beneficios = D.beneficios.filter((b) => b.lojaId === lojaId);
  const ativa = campanha?.status === 'ativa';
  const reais = (c?: number) => (c === undefined ? '' : (c / 100).toFixed(2));

  async function enviar(e: React.FormEvent<HTMLFormElement>, publicar: boolean) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const metaInd = String(f.get('metaIndividual') ?? '');
    const dadosForm = {
      nome: String(f.get('nome')), inicio: String(f.get('inicio') ?? campanha?.inicio), fim: String(f.get('fim')),
      metaCentavos: f.get('meta') ? paraCentavos(String(f.get('meta'))) : 0,
      ...(metaInd ? { metaIndividualCentavos: paraCentavos(metaInd) } : {}),
      comissaoBps: Math.round(Number(f.get('comissao')) * 100),
      visibilidade: f.get('visibilidade') as Campanha['visibilidade'], entrega: f.get('entrega') as Campanha['entrega'],
      tags: String(f.get('tags') ?? '').split(',').map((t) => t.trim()).filter(Boolean),
      produtoIds: f.getAll('produtoIds').map(String),
      beneficioIds: [...new Set([...f.getAll('beneficioIds').map(String), ...(ativa ? campanha!.beneficioIds : [])])],
      briefing: String(f.get('briefing') ?? ''), publicar,
    };
    const r = await executar(() => salvarCampanhaServidor(dadosForm, campanhaId), campanha ? 'Campanha salva' : publicar ? 'Campanha publicada' : 'Rascunho salvo');
    if (r) router.push(`/loja/campanhas/${r.dado.id}`);
  }

  return (
    <>
      <CabecalhoPagina titulo={campanha ? `Editar: ${campanha.nome}` : 'Nova campanha'}
        voltar={<Link href={campanha ? `/loja/campanhas/${campanha.id}` : '/loja/campanhas'}>← {campanha ? 'Voltar para a campanha' : 'Campanhas'}</Link>} />
      <form className="space-y-6" onSubmit={(e) => enviar(e, (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value') !== 'rascunho')}>
        {ativa && (
          <Aviso tom="aviso" titulo="Campanha ativa">
            Pode aumentar a comissão, estender o prazo e incluir benefícios. Não pode reduzir a comissão, encurtar o prazo nem tirar benefícios (R-13).
          </Aviso>
        )}
        <Cartao titulo="Dados da campanha">
          <div className="grid gap-4 md:grid-cols-2">
            <Campo rotulo="Nome" name="nome" required defaultValue={campanha?.nome} placeholder="Verão 27 no linho" className="md:col-span-2" />
            <Campo rotulo="Início" name="inicio" type="date" required defaultValue={campanha?.inicio ?? D.hoje} disabled={ativa} />
            <Campo rotulo="Fim" name="fim" type="date" required defaultValue={campanha?.fim} min={ativa ? campanha?.fim : undefined} />
            <Campo rotulo="Meta geral (R$)" name="meta" type="number" step="0.01" min="0" defaultValue={reais(campanha?.metaCentavos)} />
            <Campo rotulo="Meta individual por creator (R$)" name="metaIndividual" type="number" step="0.01" min="0" defaultValue={reais(campanha?.metaIndividualCentavos)} ajuda="Opcional" />
            <Campo rotulo="Comissão (%)" name="comissao" type="number" step="0.1" min={ativa ? campanha!.comissaoBps / 100 : 0} max="100" required
              defaultValue={campanha ? campanha.comissaoBps / 100 : 10} ajuda={ativa ? 'Em campanha ativa, só pode aumentar.' : undefined} />
            <Selecao rotulo="Quem vê" name="visibilidade" defaultValue={campanha?.visibilidade ?? 'aberta'}
              opcoes={[{ valor: 'aberta', rotulo: 'Aberta para todos os aprovados' }, { valor: 'so_convidados', rotulo: 'Só convidados' }]} />
            <Selecao rotulo="Tipo de entrega" name="entrega" defaultValue={campanha?.entrega ?? 'publicar'}
              opcoes={[{ valor: 'publicar', rotulo: 'Publicar nas redes' }, { valor: 'entregar_arquivo', rotulo: 'Entregar o arquivo do vídeo' }, { valor: 'publicar_e_entregar', rotulo: 'Publicar e entregar o arquivo' }]} />
            <Campo rotulo="Tags" name="tags" defaultValue={campanha?.tags.join(', ')} placeholder="linho, verão" ajuda="Separadas por vírgula" />
          </div>
        </Cartao>
        <Cartao titulo="Produtos da campanha">
          <p className="mb-3 text-sm text-suave">Nenhum marcado = vale para todos os produtos.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {produtos.map((p) => <CaixaSelecao key={p.id} name="produtoIds" value={p.id} rotulo={p.nome} defaultChecked={campanha?.produtoIds.includes(p.id)} />)}
          </div>
        </Cartao>
        <Cartao titulo="Benefícios" acao={<Link href="/loja/campanhas?aba=beneficios" className="text-sm underline">Cadastrar benefício</Link>}>
          <div className="grid gap-2 sm:grid-cols-2">
            {beneficios.map((b) => (
              <CaixaSelecao key={b.id} name="beneficioIds" value={b.id} rotulo={b.nome} defaultChecked={campanha?.beneficioIds.includes(b.id)}
                disabled={ativa && campanha?.beneficioIds.includes(b.id)} />
            ))}
            {!beneficios.length && <p className="text-sm text-suave">Nenhum benefício cadastrado.</p>}
          </div>
        </Cartao>
        <Cartao titulo="Briefing">
          <AreaTexto name="briefing" defaultValue={campanha?.briefing} rows={6} placeholder="O que o creator deve mostrar, tom, marcações, o que evitar..." />
        </Cartao>
        <div className="flex flex-wrap justify-end gap-2">
          <BotaoLink href={campanha ? `/loja/campanhas/${campanha.id}` : '/loja/campanhas'} variante="fantasma">Cancelar</BotaoLink>
          {(!campanha || campanha.status === 'rascunho') && <Botao type="submit" value="rascunho" variante="secundario">Salvar rascunho</Botao>}
          <Botao type="submit" value="publicar">{campanha && campanha.status !== 'rascunho' ? 'Salvar' : 'Publicar'}</Botao>
        </div>
      </form>
    </>
  );
}
