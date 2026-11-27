'use client';
// Janela (modal). Dono: M2.
// <Modal gatilho={<Botao>Abrir</Botao>} titulo="Reprovar vídeo">{(fechar) => <form>...</form>}</Modal>
import { X } from 'lucide-react';
import { cloneElement, isValidElement, useRef, type ReactElement, type ReactNode } from 'react';

export function Modal({ gatilho, titulo, children, largura = 'max-w-lg' }: {
  gatilho: ReactElement<{ onClick?: () => void }>;
  titulo: ReactNode;
  children: ReactNode | ((fechar: () => void) => ReactNode);
  largura?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const abrir = () => ref.current?.showModal();
  const fechar = () => ref.current?.close();
  return (
    <>
      {isValidElement(gatilho) ? cloneElement(gatilho, { onClick: abrir }) : gatilho}
      <dialog ref={ref} onClick={(e) => { if (e.target === ref.current) fechar(); }}
        className={`m-auto w-[calc(100%-2rem)] ${largura} rounded-2xl border border-borda bg-superficie p-0 text-texto backdrop:bg-black/50`}>
        <div className="flex items-center justify-between border-b border-borda px-5 py-3">
          <h2 className="font-semibold">{titulo}</h2>
          <button type="button" onClick={fechar} aria-label="Fechar" className="rounded-lg p-1 hover:bg-superficie-2"><X size={18} /></button>
        </div>
        <div className="p-5">{typeof children === 'function' ? children(fechar) : children}</div>
      </dialog>
    </>
  );
}
