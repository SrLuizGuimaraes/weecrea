'use client';
// Estado de demonstração em memória. Dono: M1.
// Todas as telas leem e mudam este estado; NADA é gravado: ao recarregar a página, volta ao dados.json.
// Quando os módulos ligarem no banco, as telas trocam `useDemo()` pela leitura real e as ações viram Server Actions.
//
//   const { D, mudar } = useDemo();
//   mudar((d) => aprovarCreator(d, lojaId, creatorId), 'Creator aprovado');
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import inicial from '../../../dados-exemplo/dados.json';
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { useToast } from '@/componentes/toast';

type Contexto = {
  D: DadosExemplo;
  /** Aplica uma mudança no estado. Se a função lançar Error, mostra a mensagem e não muda nada. */
  mudar: (fn: (d: DadosExemplo) => void, aviso?: string) => boolean;
  reiniciar: () => void;
};

const Ctx = createContext<Contexto | null>(null);
const copiaInicial = () => structuredClone(inicial) as unknown as DadosExemplo;

export function ProvedorDemo({ children }: { children: ReactNode }) {
  const [D, setD] = useState<DadosExemplo>(copiaInicial);
  const atual = useRef(D);
  const toast = useToast();
  const mudar = useCallback((fn: (d: DadosExemplo) => void, aviso?: string) => {
    const novo = structuredClone(atual.current);
    try {
      fn(novo);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não foi possível.', 'perigo');
      return false;
    }
    atual.current = novo;
    setD(novo);
    if (aviso) toast(aviso);
    return true;
  }, [toast]);
  const reiniciar = useCallback(() => { const d = copiaInicial(); atual.current = d; setD(d); toast('Dados de exemplo restaurados'); }, [toast]);
  return <Ctx.Provider value={{ D, mudar, reiniciar }}>{children}</Ctx.Provider>;
}

export function useDemo(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error('useDemo fora do ProvedorDemo');
  return c;
}

/** Aviso fixo de que é demonstração, com o botão de restaurar os dados. */
export function AvisoDemonstracao() {
  const { reiniciar } = useDemo();
  return (
    <div className="rounded-controle border border-dashed border-borda p-2 text-xs text-suave">
      <p><b className="text-texto">Em construção.</b> Campanhas, cadastro e aprovação de creators já gravam no banco. As demais telas ainda usam dados de exemplo e voltam ao início ao recarregar.</p>
      <button type="button" onClick={reiniciar} className="mt-1 inline-flex items-center gap-1 underline"><RotateCcw size={12} />Restaurar agora</button>
    </div>
  );
}
