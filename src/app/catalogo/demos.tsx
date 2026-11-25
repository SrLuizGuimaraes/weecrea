'use client';
import { useState } from 'react';
import { Botao } from '@/componentes/botao';
import { Chip } from '@/componentes/etiquetas';
import { Modal } from '@/componentes/modal';
import { useToast } from '@/componentes/toast';
import { AreaTexto } from '@/componentes/campos';

export function DemoToast() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Botao variante="secundario" onClick={() => toast('Cupom copiado')}>Toast de sucesso</Botao>
      <Botao variante="secundario" onClick={() => toast('Não foi possível salvar', 'perigo')}>Toast de erro</Botao>
    </div>
  );
}

export function DemoModal() {
  return (
    <Modal gatilho={<Botao variante="secundario">Abrir janela</Botao>} titulo="Reprovar vídeo">
      {(fechar) => (
        <div className="space-y-4">
          <AreaTexto rotulo="Motivo" placeholder="Explique o que precisa mudar" required />
          <div className="flex justify-end gap-2">
            <Botao variante="fantasma" onClick={fechar}>Cancelar</Botao>
            <Botao variante="perigo" onClick={fechar}>Reprovar</Botao>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function DemoChips() {
  const [rede, setRede] = useState('todas');
  return (
    <div className="flex flex-wrap gap-2">
      {['todas', 'instagram', 'tiktok'].map((r) => (
        <Chip key={r} ativo={rede === r} onClick={() => setRede(r)}>{r === 'todas' ? 'Todas' : r === 'instagram' ? 'Instagram' : 'TikTok'}</Chip>
      ))}
    </div>
  );
}
