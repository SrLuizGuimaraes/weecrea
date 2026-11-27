'use client';
// Ações simuladas para as telas de mockup. Dono: M2.
// <BotaoEmBreve>Conectar Nuvemshop</BotaoEmBreve>  → mostra "Em breve" sem fazer nada
// <FormSimulado mensagem="Campanha salva (simulação)">...campos...<Botao type="submit">Salvar</Botao></FormSimulado>
// <BotaoCopiar texto="MARINA10" />
import { Check, Copy } from 'lucide-react';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Botao } from './botao';
import { useToast } from './toast';

export function BotaoEmBreve({ mensagem = 'Em breve: esta ação ainda está em construção.', ...resto }:
  ComponentProps<typeof Botao> & { mensagem?: string }) {
  const toast = useToast();
  return <Botao {...resto} onClick={() => toast(mensagem, 'info')} />;
}

export function FormSimulado({ mensagem = 'Salvo (simulação: ainda não grava de verdade).', children, className }:
  { mensagem?: string; children: ReactNode; className?: string }) {
  const toast = useToast();
  return (
    <form className={className} onSubmit={(e) => { e.preventDefault(); toast(mensagem, 'info'); }}>
      {children}
    </form>
  );
}

export function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo?: string }) {
  const toast = useToast();
  const [ok, setOk] = useState(false);
  return (
    <Botao variante="secundario" tamanho="p" onClick={async () => {
      try { await navigator.clipboard.writeText(texto); } catch { /* sem permissão */ }
      setOk(true); toast(`${rotulo ?? texto} copiado`); setTimeout(() => setOk(false), 1500);
    }}>
      {ok ? <Check size={14} /> : <Copy size={14} />}{rotulo ?? 'Copiar'}
    </Botao>
  );
}
