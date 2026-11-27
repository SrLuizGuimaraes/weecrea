// Avatar com iniciais e cor estável por pessoa, e a linha "pessoa" (avatar + nome + detalhe). Dono: M2.
// <Pessoa nome="Marina Couto" detalhe="@marinacouto, MG" />
import type { ReactNode } from 'react';
import { cx } from './cx';

const MATIZES = [258, 338, 196, 28, 152, 300, 212, 12, 88, 232, 320, 170, 46];

function matiz(texto: string) {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return MATIZES[h % MATIZES.length];
}

export function iniciais(nome: string) {
  return nome.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function Avatar({ nome, fotoUrl, tamanho = 32, className }: { nome: string; fotoUrl?: string; tamanho?: number; className?: string }) {
  const estilo = { width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.4), background: `hsl(${matiz(nome)} 60% 45%)` };
  if (fotoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fotoUrl} alt="" style={estilo} className={cx('shrink-0 rounded-full object-cover', className)} />;
  }
  return <span aria-hidden="true" style={estilo} className={cx('inline-grid shrink-0 place-items-center rounded-full font-bold text-white', className)}>{iniciais(nome)}</span>;
}

export function Pessoa({ nome, detalhe, fotoUrl }: { nome: ReactNode & string; detalhe?: ReactNode; fotoUrl?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar nome={nome} fotoUrl={fotoUrl} />
      <div className="min-w-0"><p className="truncate">{nome}</p>{detalhe && <p className="truncate text-xs text-suave">{detalhe}</p>}</div>
    </div>
  );
}
