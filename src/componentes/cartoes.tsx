// Cartões, indicador e avisos. Dono: M2.
// <Cartao titulo="Vendas">...</Cartao> · <CartaoIndicador rotulo="Vendas" valor="R$ 1.234,56" /> · <Aviso tom="aviso">...</Aviso>
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from './cx';

export function Cartao({ titulo, acao, children, className }:
  { titulo?: ReactNode; acao?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('min-w-0 rounded-cartao border border-borda bg-superficie p-4 md:p-5', className)}>
      {(titulo || acao) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {titulo && <h2 className="text-sm font-semibold">{titulo}</h2>}
          {acao}
        </header>
      )}
      {children}
    </section>
  );
}

export function CartaoIndicador({ rotulo, valor, detalhe, variacao, icone }:
  { rotulo: string; valor: ReactNode; detalhe?: ReactNode; variacao?: { texto: string; positiva: boolean }; icone?: ReactNode }) {
  return (
    <div className="rounded-cartao border border-borda bg-superficie p-4">
      <div className="flex items-center justify-between text-xs text-suave">
        <span>{rotulo}</span>
        {icone}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{valor}</p>
      {(detalhe || variacao) && (
        <p className="mt-1 text-xs text-suave">
          {variacao && <span className={variacao.positiva ? 'text-sucesso' : 'text-perigo'}>{variacao.texto} </span>}
          {detalhe}
        </p>
      )}
    </div>
  );
}

const avisos = {
  info: ['bg-info-fraco text-info', Info],
  sucesso: ['bg-sucesso-fraco text-sucesso', CheckCircle2],
  aviso: ['bg-aviso-fraco text-aviso', AlertTriangle],
  perigo: ['bg-perigo-fraco text-perigo', XCircle],
} as const;

export function Aviso({ tom = 'info', titulo, children }: { tom?: keyof typeof avisos; titulo?: ReactNode; children?: ReactNode }) {
  const [classe, Icone] = avisos[tom];
  return (
    <div role={tom === 'perigo' ? 'alert' : 'status'} className={cx('flex gap-3 rounded-cartao px-4 py-3 text-sm', classe)}>
      <Icone size={18} className="mt-0.5 shrink-0" />
      <div className="space-y-1">
        {titulo && <p className="font-semibold">{titulo}</p>}
        {children && <div className="text-texto">{children}</div>}
      </div>
    </div>
  );
}

export function Vazio({ titulo, children, acao }: { titulo: string; children?: ReactNode; acao?: ReactNode }) {
  return (
    <div className="rounded-cartao border border-dashed border-borda p-8 text-center">
      <p className="font-medium">{titulo}</p>
      {children && <p className="mt-1 text-sm text-suave">{children}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
