'use client';
// Entrega os dados reais (carregados no servidor, em src/lib/dados-reais.ts) às telas de cliente e
// executa Server Actions com aviso e atualização da página. Dono: M5 (compartilhado com M6 e M7).
//
//   const { D, executar } = useDados();
//   await executar(() => aprovarCreatorServidor(id), 'Creator aprovado');
import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/componentes/toast';
import type { Resultado } from '@/lib/acao';
import type { DadosExemplo } from '../../dados-exemplo/gerar';

type Contexto = {
  D: DadosExemplo;
  /** Roda a ação. Mostra o erro (e devolve null) ou o aviso, atualiza a página e devolve o dado. */
  executar: <T>(fn: () => Promise<Resultado<T>>, aviso?: string | ((dado: T) => string)) => Promise<{ dado: T } | null>;
};

const Ctx = createContext<Contexto | null>(null);

export function ProvedorDados({ D, children }: { D: DadosExemplo; children: ReactNode }) {
  const toast = useToast();
  const router = useRouter();
  const executar = useCallback(async <T,>(fn: () => Promise<Resultado<T>>, aviso?: string | ((dado: T) => string)) => {
    let r: Resultado<T>;
    try {
      r = await fn();
    } catch {
      toast('Sem conexão. Tente de novo.', 'perigo');
      return null;
    }
    if (!r.ok) { toast(r.erro, 'perigo'); return null; }
    if (aviso) toast(typeof aviso === 'function' ? aviso(r.dado) : aviso);
    router.refresh();
    return { dado: r.dado };
  }, [router, toast]);
  return <Ctx.Provider value={{ D, executar }}>{children}</Ctx.Provider>;
}

export function useDados(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error('useDados fora do ProvedorDados');
  return c;
}
