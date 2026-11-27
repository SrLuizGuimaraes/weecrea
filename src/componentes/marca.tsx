// Marca WEECREA. Dono: M2.
// <Logo /> troca sozinho entre as versões para fundo claro e escuro (o tema escuro vem do data-tema, como o resto do visual).
// <Simbolo /> é a estrela da marca em vetor: herda a cor do texto (currentColor), então serve em qualquer fundo.
import { cx } from './cx';

/** Logotipo horizontal (símbolo + "weecrea"). Altura define o tamanho; a largura acompanha (proporção 3:1). */
export function Logo({ className, alturaClasse = 'h-7' }: { className?: string; alturaClasse?: string }) {
  return (
    <span className={cx('inline-flex shrink-0 items-center', className)} role="img" aria-label="WEECREA">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/logo-claro.png" alt="" className={cx('block w-auto dark:hidden', alturaClasse)} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/logo-escuro.png" alt="" className={cx('hidden w-auto dark:block', alturaClasse)} />
    </span>
  );
}

/** Estrela da marca. Cor = cor do texto ao redor. */
export function Simbolo({ className, titulo }: { className?: string; titulo?: string }) {
  return (
    <svg viewBox="0 0 298.86 236.22" className={cx('inline-block shrink-0', className)} role={titulo ? 'img' : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true} fill="currentColor">
      <path d={SIMBOLO} />
    </svg>
  );
}

const SIMBOLO = 'M152.83 178.93C141.63 168.47 138.78 157.28 139.16 141.03L94.29 180.07L42.25 225.48C34.25 232.46 21.92 232.26 13.13 227.33C6.06 223.36 1.79 216.59 0.95 209.26C0 200.95 3.31 193.62 9.6 188.15L63.41 141.36L86.49 121.25L68.18 103.86L41.23 78.39C31.74 69.41 28.21 56.24 35.84 44.92C40.4 38.14 48.19 34.36 55.81 33.71C64.81 32.95 72.06 36.61 78.37 42.69L133.58 95.93C135.43 97.72 136.97 99.29 139.18 100.74L139.1 28.48C139.08 16.83 145.58 7.05 156.6 3.27C166.15 0 176.78 1.77 184.31 8.57C190.29 13.72 192.5 20.67 192.5 28.49L192.43 95.15L271.17 95.45C279.64 95.49 286.97 100.91 291.18 107.75C298.86 120.23 292.96 135.75 279.95 141.6C275.46 143.62 271.17 144.14 266.13 144.15L239.21 144.16L191.65 144.15L240.99 190.48C247.12 196.24 250.42 203.19 249.53 211.89C248.78 219.21 244.41 226.19 237.3 230.43C227.59 236.22 214.56 235.8 205.64 228.12L176.58 201.11L152.82 178.92L152.83 178.93Z';
