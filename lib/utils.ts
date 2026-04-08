import { differenceInDays, format, parseISO, addDays, addMonths, addYears } from 'date-fns';
import { de } from 'date-fns/locale';
import type { AmpelStatus, HaushaltsAufgabe, Erinnerung } from './types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function heuteDatum(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDatum(dateStr: string): string {
  return format(parseISO(dateStr), 'd. MMMM yyyy', { locale: de });
}

export function formatDatumKurz(dateStr: string): string {
  return format(parseISO(dateStr), 'd. MMM yyyy', { locale: de });
}

// --- Haushalt ---

export function getAmpelHaushalt(aufgabe: HaushaltsAufgabe): AmpelStatus {
  if (!aufgabe.letzteErledigung) return 'rot';
  const tage = differenceInDays(new Date(), parseISO(aufgabe.letzteErledigung));
  const ratio = tage / aufgabe.intervallTage;
  if (ratio >= 1) return 'rot';
  if (ratio >= 0.7) return 'gelb';
  return 'gruen';
}

export function getTageUeberfaelligHaushalt(aufgabe: HaushaltsAufgabe): number {
  if (!aufgabe.letzteErledigung) return 999;
  const tage = differenceInDays(new Date(), parseISO(aufgabe.letzteErledigung));
  return tage - aufgabe.intervallTage;
}

export function getTageBisHaushalt(aufgabe: HaushaltsAufgabe): number {
  if (!aufgabe.letzteErledigung) return -999;
  const faelligAm = addDays(parseISO(aufgabe.letzteErledigung), aufgabe.intervallTage);
  return differenceInDays(faelligAm, new Date());
}

// --- Erinnerungen ---

export function getAmpelErinnerung(erinnerung: Erinnerung): AmpelStatus {
  const tage = differenceInDays(parseISO(erinnerung.naechstesFaelligkeit), new Date());
  if (tage < 0) return 'rot';
  if (tage <= erinnerung.erinnerungTagsVorher) return 'gelb';
  return 'gruen';
}

export function getTageBisErinnerung(erinnerung: Erinnerung): number {
  return differenceInDays(parseISO(erinnerung.naechstesFaelligkeit), new Date());
}

export function naechstesFaelligkeitsDatum(
  typ: Erinnerung['typ'],
  letztesDatum?: string
): string {
  const basis = letztesDatum ? parseISO(letztesDatum) : new Date();
  if (typ === 'jaehrlich') return format(addYears(basis, 1), 'yyyy-MM-dd');
  if (typ === 'monatlich') return format(addMonths(basis, 1), 'yyyy-MM-dd');
  return format(basis, 'yyyy-MM-dd');
}
