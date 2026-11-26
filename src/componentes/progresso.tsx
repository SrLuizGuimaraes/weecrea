// Barra de progresso de meta. Dono: M2.
// <BarraProgresso valor={realizado} total={meta} legenda="R$ 1.200 de R$ 3.000" />
import { cx } from './cx';

export function BarraProgresso({ valor, total, legenda, className }: { valor: number; total: number; legenda?: string; className?: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((valor / total) * 100)) : 0;
  return (
    <div className={className}>
      <div className="h-2 rounded-full bg-superficie-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={cx('h-2 rounded-full', pct >= 100 ? 'bg-sucesso' : 'bg-destaque')} style={{ width: `${pct}%` }} />
      </div>
      {legenda && <p className="mt-1 flex justify-between text-xs text-suave"><span>{legenda}</span><span>{pct}%</span></p>}
    </div>
  );
}
