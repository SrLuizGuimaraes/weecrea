// Gráficos simples em SVG/CSS, sem biblioteca. Dono: M2.
// <GraficoColunas pontos={[{ rotulo: '01/11', valor: 1200, texto: 'R$ 12,00' }]} />
// <BarrasHorizontais itens={[{ rotulo: 'Marina', valor: 5000, texto: 'R$ 50,00' }]} />
// <MapaBrasil valores={{ SP: 4, MG: 2 }} />
import type { ReactNode } from 'react';
import { cx } from './cx';

export interface Ponto { rotulo: string; valor: number; texto?: string }

export function GraficoColunas({ pontos, altura = 160 }: { pontos: Ponto[]; altura?: number }) {
  const max = Math.max(1, ...pontos.map((p) => p.valor));
  const passo = Math.max(1, Math.ceil(pontos.length / 8));
  return (
    <div>
      <div className="flex items-end gap-[2px]" style={{ height: altura }} role="img" aria-label="Gráfico de colunas">
        {pontos.map((p, i) => (
          <div key={i} className="group relative flex h-full flex-1 items-end">
            <div className="w-full rounded-t-sm bg-destaque/80 transition group-hover:bg-destaque"
              style={{ height: `${Math.max(p.valor > 0 ? 2 : 0, (p.valor / max) * 100)}%` }} />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-texto px-2 py-1 text-xs text-fundo group-hover:block">
              {p.rotulo}: {p.texto ?? p.valor}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-[2px] text-[10px] text-suave">
        {pontos.map((p, i) => <span key={i} className="flex-1 truncate text-center">{i % passo === 0 ? p.rotulo : ''}</span>)}
      </div>
    </div>
  );
}

export function BarrasHorizontais({ itens, vazio = 'Sem dados no período.' }: { itens: (Ponto & { detalhe?: ReactNode })[]; vazio?: string }) {
  if (!itens.length) return <p className="text-sm text-suave">{vazio}</p>;
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <ul className="space-y-2">
      {itens.map((i, n) => (
        <li key={n} className="text-sm">
          <div className="mb-1 flex justify-between gap-2">
            <span className="truncate">{i.rotulo}</span>
            <span className="shrink-0 tabular-nums text-suave">{i.texto ?? i.valor}</span>
          </div>
          <div className="h-2 rounded-full bg-superficie-2">
            <div className="h-2 rounded-full bg-destaque" style={{ width: `${(i.valor / max) * 100}%` }} />
          </div>
          {i.detalhe && <div className="mt-0.5 text-xs text-suave">{i.detalhe}</div>}
        </li>
      ))}
    </ul>
  );
}

// Mapa do Brasil em grade (cada estado é um quadrado na posição aproximada).
const GRADE: [string, number, number][] = [
  ['RR', 0, 2], ['AP', 0, 4],
  ['AM', 1, 1], ['PA', 1, 3], ['MA', 1, 5], ['CE', 1, 6], ['RN', 1, 7],
  ['AC', 2, 0], ['RO', 2, 1], ['TO', 2, 4], ['PI', 2, 5], ['PB', 2, 7],
  ['MT', 3, 2], ['GO', 3, 3], ['DF', 3, 4], ['BA', 3, 5], ['PE', 3, 6], ['AL', 3, 7],
  ['MS', 4, 2], ['MG', 4, 4], ['ES', 4, 5], ['SE', 4, 6],
  ['PR', 5, 3], ['SP', 5, 4], ['RJ', 5, 5],
  ['SC', 6, 3],
  ['RS', 7, 3],
];

export function MapaBrasil({ valores, rotuloValor = (n: number) => String(n) }: { valores: Record<string, number>; rotuloValor?: (n: number) => string }) {
  const max = Math.max(1, ...Object.values(valores));
  return (
    <div className="grid grid-cols-8 gap-1" role="img" aria-label="Mapa do Brasil por estado">
      {Array.from({ length: 8 * 8 }, (_, i) => {
        const linha = Math.floor(i / 8), coluna = i % 8;
        const uf = GRADE.find(([, l, c]) => l === linha && c === coluna);
        if (!uf) return <div key={i} />;
        const v = valores[uf[0]] ?? 0;
        const intensidade = v ? 0.15 + (v / max) * 0.85 : 0;
        return (
          <div key={i} title={`${uf[0]}: ${rotuloValor(v)}`}
            className={cx('flex aspect-square flex-col items-center justify-center rounded-md border text-[10px] leading-tight',
              v ? 'border-transparent' : 'border-borda text-suave')}
            style={v ? { background: `color-mix(in srgb, var(--cor-destaque) ${Math.round(intensidade * 100)}%, transparent)`, color: intensidade > 0.55 ? 'var(--cor-destaque-texto)' : undefined } : undefined}>
            <span className="font-semibold">{uf[0]}</span>
            {v > 0 && <span className="tabular-nums">{v}</span>}
          </div>
        );
      })}
    </div>
  );
}
