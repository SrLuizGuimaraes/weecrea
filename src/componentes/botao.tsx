// Botões. Dono: M2.
// <Botao>Salvar</Botao> · <Botao variante="secundario" tamanho="p">Cancelar</Botao> · <BotaoLink href="/x">Abrir</BotaoLink>
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cx } from './cx';

export type VarianteBotao = 'primario' | 'secundario' | 'fantasma' | 'perigo' | 'destaque';
type Tamanho = 'p' | 'm' | 'g';

const variantes: Record<VarianteBotao, string> = {
  primario: 'bg-texto text-fundo hover:opacity-90',
  destaque: 'bg-destaque text-destaque-texto hover:opacity-90',
  secundario: 'border border-borda bg-superficie text-texto hover:border-texto',
  fantasma: 'text-texto hover:bg-superficie-2',
  perigo: 'bg-perigo text-white hover:opacity-90',
};
const tamanhos: Record<Tamanho, string> = { p: 'h-8 px-3 text-xs', m: 'h-10 px-4 text-sm', g: 'h-12 px-5 text-base' };

export function classesBotao(variante: VarianteBotao = 'primario', tamanho: Tamanho = 'm', largo = false) {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-controle font-semibold whitespace-nowrap transition disabled:pointer-events-none disabled:opacity-50',
    variantes[variante], tamanhos[tamanho], largo && 'w-full',
  );
}

export function Botao({ variante, tamanho, largo, className, type = 'button', ...resto }:
  ComponentProps<'button'> & { variante?: VarianteBotao; tamanho?: Tamanho; largo?: boolean }) {
  return <button type={type} className={cx(classesBotao(variante, tamanho, largo), className)} {...resto} />;
}

export function BotaoLink({ variante, tamanho, largo, className, ...resto }:
  ComponentProps<typeof Link> & { variante?: VarianteBotao; tamanho?: Tamanho; largo?: boolean }) {
  return <Link className={cx(classesBotao(variante, tamanho, largo), className)} {...resto} />;
}
