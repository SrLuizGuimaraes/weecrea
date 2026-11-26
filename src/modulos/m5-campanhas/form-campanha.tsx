// Formulário de campanha (criar e editar). Dono: M5. Por enquanto só simula o salvamento.
import type { Beneficio, Campanha, Produto } from '@/contratos/tipos';
import { AreaTexto, Aviso, Botao, BotaoLink, CaixaSelecao, Campo, Cartao, Selecao } from '@/componentes';
import { FormSimulado } from '@/componentes/em-breve';

export function FormCampanha({ campanha, produtos, beneficios }: { campanha?: Campanha; produtos: Produto[]; beneficios: Beneficio[] }) {
  const ativa = campanha?.status === 'ativa';
  const reais = (c?: number) => (c === undefined ? '' : (c / 100).toFixed(2));
  return (
    <FormSimulado mensagem={campanha ? 'Campanha salva (simulação).' : 'Campanha criada (simulação).'} className="space-y-6">
      {ativa && (
        <Aviso tom="aviso" titulo="Campanha ativa">
          Pode aumentar a comissão, estender o prazo e incluir benefícios. Não pode reduzir a comissão, encurtar o prazo nem tirar benefícios (R-13).
        </Aviso>
      )}
      <Cartao titulo="Dados da campanha">
        <div className="grid gap-4 md:grid-cols-2">
          <Campo rotulo="Nome" name="nome" required defaultValue={campanha?.nome} placeholder="Verão 27 no linho" className="md:col-span-2" />
          <Campo rotulo="Início" name="inicio" type="date" required defaultValue={campanha?.inicio} disabled={ativa} />
          <Campo rotulo="Fim" name="fim" type="date" required defaultValue={campanha?.fim} min={ativa ? campanha?.fim : undefined} />
          <Campo rotulo="Meta geral (R$)" name="meta" type="number" step="0.01" min="0" defaultValue={reais(campanha?.metaCentavos)} />
          <Campo rotulo="Meta individual por creator (R$)" name="metaIndividual" type="number" step="0.01" min="0" defaultValue={reais(campanha?.metaIndividualCentavos)} ajuda="Opcional" />
          <Campo rotulo="Comissão (%)" name="comissao" type="number" step="0.1" min={ativa ? (campanha!.comissaoBps / 100) : 0} max="100"
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

      <Cartao titulo="Benefícios">
        <div className="grid gap-2 sm:grid-cols-2">
          {beneficios.map((b) => (
            <CaixaSelecao key={b.id} name="beneficioIds" value={b.id} rotulo={b.nome} defaultChecked={campanha?.beneficioIds.includes(b.id)}
              disabled={ativa && campanha?.beneficioIds.includes(b.id)} />
          ))}
          {!beneficios.length && <p className="text-sm text-suave">Cadastre benefícios na aba Benefícios.</p>}
        </div>
      </Cartao>

      <Cartao titulo="Briefing">
        <AreaTexto name="briefing" defaultValue={campanha?.briefing} rows={6} placeholder="O que o creator deve mostrar, tom, marcações, o que evitar..." />
      </Cartao>

      <div className="flex flex-wrap justify-end gap-2">
        <BotaoLink href="/loja/campanhas" variante="fantasma">Cancelar</BotaoLink>
        {!ativa && <Botao type="submit" variante="secundario">Salvar rascunho</Botao>}
        <Botao type="submit">{campanha && campanha.status !== 'rascunho' ? 'Salvar' : 'Publicar'}</Botao>
      </div>
    </FormSimulado>
  );
}
