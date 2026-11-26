// Gráficos simples em SVG/CSS, sem biblioteca. Dono: M2.
// <GraficoColunas pontos={[{ rotulo: '01/11', valor: 1200, texto: 'R$ 12,00' }]} />
// <BarrasHorizontais itens={[{ rotulo: 'Marina', valor: 5000, texto: 'R$ 50,00' }]} />
// <MapaBrasil valores={{ SP: 4, MG: 2 }} />
import type { ReactNode } from 'react';
import { cx } from './cx';
import { ALTURA_MAPA, FORMAS_UF } from './mapa-brasil-formas';

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

// Mapa do Brasil com os 27 estados, mais escuro onde há mais creators (como o protótipo).
export function MapaBrasil({ valores, rotuloValor = (n: number) => `${n} creator${n === 1 ? '' : 's'}` }: { valores: Record<string, number>; rotuloValor?: (n: number) => string }) {
  const max = Math.max(1, ...Object.values(valores));
  return (
    <svg viewBox={`-4 -4 408 ${ALTURA_MAPA + 8}`} role="img" aria-label="Mapa do Brasil por estado" className="block h-auto w-full">
      {Object.entries(FORMAS_UF).map(([uf, f]) => {
        const n = valores[uf] ?? 0;
        const pct = n ? Math.round((0.16 + 0.84 * (n / max)) * 100) : 0;
        return (
          <path key={uf} d={f.d} strokeWidth={1} strokeLinejoin="round" stroke="var(--cor-superficie)"
            fill={n ? `color-mix(in srgb, var(--cor-destaque) ${pct}%, var(--cor-superficie))` : 'var(--cor-superficie-2)'}>
            <title>{`${uf}: ${rotuloValor(n)}`}</title>
          </path>
        );
      })}
      {Object.entries(FORMAS_UF).filter(([, f]) => f.area >= 8).map(([uf, f]) => (
        <text key={uf} x={f.x} y={f.y + 3} textAnchor="middle" fontSize={9.5} fontWeight={600} pointerEvents="none"
          fill={(valores[uf] ?? 0) / max > 0.45 ? 'var(--cor-destaque-texto)' : 'var(--cor-texto)'}>{uf}</text>
      ))}
    </svg>
  );
}
