'use client';
// Mensagem rápida (toast). Dono: M2.
// O <ProvedorToast> já está no layout raiz. Em componentes cliente:
//   const toast = useToast(); toast('Cupom copiado'); toast('Falhou', 'perigo');
// Depois de uma Server Action que redireciona, use ?aviso=texto na URL: <AvisoDaUrl /> mostra e limpa.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type TomToast = 'sucesso' | 'perigo' | 'info';
type Toast = { id: number; texto: string; tom: TomToast };

const Contexto = createContext<(texto: string, tom?: TomToast) => void>(() => {});

export function useToast() {
  return useContext(Contexto);
}

export function ProvedorToast({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<Toast[]>([]);
  const mostrar = useCallback((texto: string, tom: TomToast = 'sucesso') => {
    const id = Date.now() + Math.random();
    setLista((l) => [...l, { id, texto, tom }]);
    setTimeout(() => setLista((l) => l.filter((t) => t.id !== id)), 4000);
  }, []);
  const cores: Record<TomToast, string> = { sucesso: 'bg-texto text-fundo', perigo: 'bg-perigo text-white', info: 'bg-info text-white' };
  return (
    <Contexto.Provider value={mostrar}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {lista.map((t) => (
          <div key={t.id} className={`pointer-events-auto rounded-xl px-4 py-2 text-sm shadow-lg ${cores[t.tom]}`}>{t.texto}</div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

/** Mostra ?aviso=... (ou ?erro=...) da URL como toast e limpa a URL. */
export function AvisoDaUrl() {
  const params = useSearchParams();
  const router = useRouter();
  const caminho = usePathname();
  const toast = useToast();
  useEffect(() => {
    const aviso = params.get('aviso');
    const erro = params.get('erro');
    if (!aviso && !erro) return;
    toast((aviso ?? erro)!, erro ? 'perigo' : 'sucesso');
    const resto = new URLSearchParams(params);
    resto.delete('aviso'); resto.delete('erro');
    router.replace(resto.size ? `${caminho}?${resto}` : caminho, { scroll: false });
  }, [params, router, caminho, toast]);
  return null;
}
