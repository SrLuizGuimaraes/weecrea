'use client';
// Botões de decisão sobre o creator (M7), usados na lista e no perfil.
import { AreaTexto, Botao, Modal } from '@/componentes';
import { useDados } from '@/lib/dados-reais-cliente';
import { aprovarCreatorServidor, pausarCreatorServidor, reativarCreatorServidor, recusarCreatorServidor, removerCreatorServidor } from './servidor';

export function BotoesDecisao({ creatorId, status, tamanho = 'p' }: { lojaId?: string; creatorId: string; status: string; tamanho?: 'p' | 'm' }) {
  const { executar } = useDados();
  if (status === 'pendente') {
    return (
      <div className="flex justify-end gap-2">
        <Modal titulo="Recusar cadastro" gatilho={<Botao tamanho={tamanho} variante="secundario">Recusar</Botao>}>
          {(fechar) => (
            <form className="space-y-3" onSubmit={async (e) => {
              e.preventDefault();
              const motivo = String(new FormData(e.currentTarget).get('motivo') ?? '');
              if (await executar(() => recusarCreatorServidor(creatorId, motivo), 'Cadastro recusado. O creator recebe um e-mail cordial.')) fechar();
            }}>
              <AreaTexto rotulo="Motivo interno (opcional, só a loja vê)" name="motivo" rows={3} />
              <p className="text-xs text-suave">A pessoa pode se cadastrar de novo depois de 30 dias.</p>
              <div className="flex justify-end"><Botao type="submit" variante="perigo">Recusar</Botao></div>
            </form>
          )}
        </Modal>
        <Botao tamanho={tamanho} onClick={() => executar(() => aprovarCreatorServidor(creatorId), (d) => `Aprovado com o cupom ${d.cupom}. O creator recebeu o e-mail com o acesso.`)}>Aprovar</Botao>
      </div>
    );
  }
  if (status === 'aprovado' || status === 'pausado') {
    return (
      <div className="flex justify-end gap-2">
        {status === 'pausado'
          ? <Botao tamanho={tamanho} variante="secundario" onClick={() => executar(() => reativarCreatorServidor(creatorId), 'Creator reativado e cupom ativo de novo')}>Reativar</Botao>
          : <Botao tamanho={tamanho} variante="secundario" onClick={() => executar(() => pausarCreatorServidor(creatorId), 'Creator pausado e cupom pausado na loja')}>Pausar</Botao>}
        <Modal titulo="Remover creator" gatilho={<Botao tamanho={tamanho} variante="fantasma">Remover</Botao>}>
          {(fechar) => (
            <form className="space-y-3" onSubmit={async (e) => {
              e.preventDefault();
              const motivo = String(new FormData(e.currentTarget).get('motivo') ?? '');
              if (await executar(() => removerCreatorServidor(creatorId, motivo), 'Creator removido e cupom desativado na loja')) fechar();
            }}>
              <AreaTexto rotulo="Motivo" name="motivo" required rows={3} />
              <p className="text-xs text-suave">O cupom é desativado na loja. As comissões já geradas continuam.</p>
              <div className="flex justify-end"><Botao type="submit" variante="perigo">Remover</Botao></div>
            </form>
          )}
        </Modal>
      </div>
    );
  }
  return null;
}
