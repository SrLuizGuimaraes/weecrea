// Datas. Dono: M1. Gravamos em UTC e mostramos no fuso de São Paulo.
// São Paulo não tem horário de verão desde 2019: o deslocamento é sempre -03:00.
import type { DataISO } from '@/contratos/tipos';

export const FUSO = 'America/Sao_Paulo';

const paraDate = (d: Date | string) => (typeof d === 'string' ? new Date(d.length === 10 ? `${d}T12:00:00-03:00` : d) : d);

const formatoDia = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Dia de calendário em São Paulo ('2026-11-25') de um instante UTC. */
export function diaEmSaoPaulo(instante: Date | string = new Date()): DataISO {
  return formatoDia.format(paraDate(instante));
}

/** Hoje em São Paulo. */
export function hojeSP(): DataISO {
  return diaEmSaoPaulo(new Date());
}

/** Soma dias a uma data de calendário ('2026-11-28' + 7 = '2026-12-05'). */
export function somarDias(dia: DataISO, dias: number): DataISO {
  const d = new Date(`${dia.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function inicioDoDiaSP(dia: DataISO): Date {
  return new Date(`${dia.slice(0, 10)}T00:00:00.000-03:00`);
}

export function fimDoDiaSP(dia: DataISO): Date {
  return new Date(`${dia.slice(0, 10)}T23:59:59.999-03:00`);
}

/** Data gravada como @db.Date (meia-noite UTC) para '2026-11-25'. */
export function diaDoBanco(d: Date): DataISO {
  return d.toISOString().slice(0, 10);
}

/** '2026-11-25' para gravar em coluna @db.Date. */
export function diaParaBanco(dia: DataISO): Date {
  return new Date(`${dia.slice(0, 10)}T00:00:00Z`);
}

const formatoData = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit', year: 'numeric' });
const formatoDataHora = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** 25/11/2026 */
export function formatarData(d: Date | string): string {
  return formatoData.format(paraDate(d));
}

/** 25/11/2026 12:05 */
export function formatarDataHora(d: Date | string): string {
  return formatoDataHora.format(paraDate(d)).replace(',', '');
}
