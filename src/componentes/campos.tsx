// Campos de formulário. Dono: M2.
// <Campo rotulo="E-mail" name="email" type="email" ajuda="..." erro="..." />
import type { ComponentProps, ReactNode } from 'react';
import { cx } from './cx';

export const classeEntrada =
  'w-full rounded-controle border border-borda bg-superficie px-3 py-2 text-sm text-texto placeholder:text-suave focus:border-destaque focus:outline-none disabled:opacity-60';

function Moldura({ rotulo, ajuda, erro, children, className }: { rotulo?: ReactNode; ajuda?: ReactNode; erro?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cx('block space-y-1', className)}>
      {rotulo && <span className="text-sm font-medium">{rotulo}</span>}
      {children}
      {erro ? <span className="block text-xs text-perigo">{erro}</span> : ajuda && <span className="block text-xs text-suave">{ajuda}</span>}
    </label>
  );
}

type Extra = { rotulo?: ReactNode; ajuda?: ReactNode; erro?: ReactNode };

export function Campo({ rotulo, ajuda, erro, className, ...resto }: ComponentProps<'input'> & Extra) {
  return (
    <Moldura rotulo={rotulo} ajuda={ajuda} erro={erro} className={className}>
      <input className={cx(classeEntrada, !!erro && 'border-perigo')} aria-invalid={erro ? true : undefined} {...resto} />
    </Moldura>
  );
}

export function AreaTexto({ rotulo, ajuda, erro, className, ...resto }: ComponentProps<'textarea'> & Extra) {
  return (
    <Moldura rotulo={rotulo} ajuda={ajuda} erro={erro} className={className}>
      <textarea className={cx(classeEntrada, 'min-h-24', !!erro && 'border-perigo')} aria-invalid={erro ? true : undefined} {...resto} />
    </Moldura>
  );
}

export function Selecao({ rotulo, ajuda, erro, className, opcoes, children, ...resto }:
  ComponentProps<'select'> & Extra & { opcoes?: { valor: string; rotulo: string }[] }) {
  return (
    <Moldura rotulo={rotulo} ajuda={ajuda} erro={erro} className={className}>
      <select className={cx(classeEntrada, 'pr-8')} {...resto}>
        {opcoes?.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
        {children}
      </select>
    </Moldura>
  );
}

export function CaixaSelecao({ rotulo, className, ...resto }: ComponentProps<'input'> & { rotulo?: ReactNode }) {
  return (
    <label className={cx('inline-flex cursor-pointer items-center gap-2 text-sm', className)}>
      <input type="checkbox" className="size-4 rounded border-borda accent-[var(--cor-destaque)]" {...resto} />
      {rotulo}
    </label>
  );
}
