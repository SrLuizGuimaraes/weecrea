'use client';
// Tema claro e escuro. Dono: M2.
// <ScriptTema /> vai no <head> do layout raiz (evita piscar). <BotaoTema /> troca e guarda a escolha.
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const CHAVE = 'weecrea-tema';

const codigo = `(function(){try{var t=localStorage.getItem('${CHAVE}');if(t!=='claro'&&t!=='escuro'){t=matchMedia('(prefers-color-scheme: dark)').matches?'escuro':'claro'}document.documentElement.dataset.tema=t}catch(e){document.documentElement.dataset.tema='claro'}})();`;

export function ScriptTema() {
  return <script dangerouslySetInnerHTML={{ __html: codigo }} />;
}

export function BotaoTema({ className }: { className?: string }) {
  const [tema, setTema] = useState<'claro' | 'escuro' | null>(null);
  useEffect(() => {
    setTema(document.documentElement.dataset.tema === 'escuro' ? 'escuro' : 'claro');
  }, []);
  function trocar() {
    const novo = tema === 'escuro' ? 'claro' : 'escuro';
    document.documentElement.dataset.tema = novo;
    try { localStorage.setItem(CHAVE, novo); } catch { /* navegação privada */ }
    setTema(novo);
  }
  return (
    <button type="button" onClick={trocar} aria-label={tema === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro'}
      className={`inline-flex size-9 items-center justify-center rounded-lg border border-borda bg-superficie text-texto hover:bg-superficie-2 ${className ?? ''}`}>
      {tema === 'escuro' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
