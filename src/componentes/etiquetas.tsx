// Chips de filtro e etiquetas de status. Dono: M2.
// <Chip href="?rede=instagram" ativo>Instagram</Chip> · <Etiqueta tom="sucesso">Pago</Etiqueta> · <EtiquetaStatus status="em_analise" />
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cx } from './cx';

export type Tom = 'neutro' | 'sucesso' | 'aviso' | 'perigo' | 'info' | 'destaque';

const tons: Record<Tom, string> = {
  neutro: 'bg-superficie-2 text-suave',
  sucesso: 'bg-sucesso-fraco text-sucesso',
  aviso: 'bg-aviso-fraco text-aviso',
  perigo: 'bg-perigo-fraco text-perigo',
  info: 'bg-info-fraco text-info',
  destaque: 'bg-destaque-fraco text-destaque-tinta',
};

export function Etiqueta({ tom = 'neutro', children, className }: { tom?: Tom; children: ReactNode; className?: string }) {
  return <span className={cx('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', tons[tom], className)}>{children}</span>;
}

/** Rótulo e cor de cada status usado no sistema. */
export const STATUS: Record<string, [string, Tom]> = {
  // afiliação
  pendente: ['Pendente', 'aviso'], aprovado: ['Aprovado', 'sucesso'], recusado: ['Recusado', 'perigo'],
  pausado: ['Pausado', 'neutro'], removido: ['Removido', 'neutro'],
  // cupom
  ativo: ['Ativo', 'sucesso'], desativado: ['Desativado', 'neutro'], erro_sync: ['Erro na loja', 'perigo'],
  // campanha
  rascunho: ['Rascunho', 'neutro'], agendada: ['Agendada', 'info'], ativa: ['Ativa', 'sucesso'],
  encerrada: ['Encerrada', 'neutro'], cancelada: ['Cancelada', 'perigo'],
  // participação
  convidado: ['Convidado', 'info'], aceito: ['Aceito', 'sucesso'],
  // pedido
  aberto: ['Aberto', 'neutro'], pago: ['Pago', 'sucesso'], cancelado: ['Cancelado', 'perigo'],
  devolvido: ['Devolvido', 'perigo'], devolvido_parcial: ['Devolvido em parte', 'aviso'],
  // comissão
  prevista: ['Em retenção', 'aviso'], liberada: ['Liberada', 'info'], paga: ['Paga', 'sucesso'], estornada: ['Estornada', 'perigo'],
  // vídeo
  em_analise: ['Em análise', 'aviso'], reprovado: ['Reprovado', 'perigo'],
  // loja
  implantacao: ['Implantação', 'info'], suspensa: ['Suspensa', 'aviso'],
};

export function EtiquetaStatus({ status }: { status: string }) {
  const [rotulo, tom] = STATUS[status] ?? [status, 'neutro'];
  return <Etiqueta tom={tom}>{rotulo}</Etiqueta>;
}

export function Chip({ ativo, href, children, onClick }: { ativo?: boolean; href?: string; children: ReactNode; onClick?: () => void }) {
  const classe = cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-sm transition',
    ativo ? 'border-texto bg-texto text-fundo' : 'border-borda bg-superficie text-texto hover:bg-superficie-2');
  if (href) return <Link href={href} className={classe} aria-current={ativo ? 'true' : undefined}>{children}</Link>;
  return <button type="button" onClick={onClick} className={classe} aria-pressed={ativo}>{children}</button>;
}
