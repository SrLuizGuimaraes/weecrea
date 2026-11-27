'use client';
// Botões de decisão sobre o creator (M7), usados na lista e no perfil.
import { AreaTexto, Botao, Modal } from '@/componentes';
import { useDemo } from '@/lib/demo/estado';
import { aprovarCreator, pausarCreator, reativarCreator, recusarCreator, removerCreator } from './acoes';

export function BotoesDecisao({ lojaId, creatorId, status, tamanho = 'p' }: { lojaId: string; creatorId: string; status: string; tamanho?: 'p' | 'm' }) {
  const { mudar } = useDemo();
  if (status === 'pendente') {
    return (
      <div className="flex justify-end gap-2">
        <Modal titulo="Recusar cadastro" gatilho={<Botao tamanho={tamanho} variante="secundario">Recusar</Botao>}>
          {(fechar) => (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (mudar((d) => recusarCreator(d, lojaId, creatorId), 'Cadastro recusado. O creator recebe um e-mail cordial (simulado).')) fechar(); }}>
              <AreaTexto rotulo="Motivo interno (opcional, só a loja vê)" name="motivo" rows={3} />
              <p className="text-xs text-suave">A pessoa pode se cadastrar de novo depois de 30 dias.</p>
              <div className="flex justify-end"><Botao type="submit" variante="perigo">Recusar</Botao></div>
            </form>
          )}
        </Modal>
        <Botao tamanho={tamanho} onClick={() => {
          let cupom = '';
          mudar((d) => { cupom = aprovarCreator(d, lojaId, creatorId); });
          if (cupom) mudar(() => {}, `Aprovado com o cupom ${cupom}. E-mail com o link de senha enviado (simulado).`);
        }}>Aprovar</Botao>
      </div>
    );
  }
  if (status === 'aprovado' || status === 'pausado') {
    return (
      <div className="flex justify-end gap-2">
        {status === 'pausado'
          ? <Botao tamanho={tamanho} variante="secundario" onClick={() => mudar((d) => reativarCreator(d, lojaId, creatorId), 'Creator reativado e cupom ativo de novo')}>Reativar</Botao>
          : <Botao tamanho={tamanho} variante="secundario" onClick={() => mudar((d) => pausarCreator(d, lojaId, creatorId), 'Creator pausado e cupom pausado na loja')}>Pausar</Botao>}
        <Modal titulo="Remover creator" gatilho={<Botao tamanho={tamanho} variante="fantasma">Remover</Botao>}>
          {(fechar) => (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (mudar((d) => removerCreator(d, lojaId, creatorId), 'Creator removido e cupom desativado na loja')) fechar(); }}>
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
