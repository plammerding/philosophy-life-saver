import type { HaushaltsAufgabe, Erinnerung } from './types';
import { generateId } from './utils';

const KEYS = {
  haushalt: 'pls_haushalt',
  erinnerungen: 'pls_erinnerungen',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const standardHaushalt: HaushaltsAufgabe[] = [
  { id: generateId(), name: 'Saugen', intervallTage: 7, letzteErledigung: null, kategorie: 'reinigung' },
  { id: generateId(), name: 'Wäsche waschen', intervallTage: 4, letzteErledigung: null, kategorie: 'waesche' },
  { id: generateId(), name: 'Bad putzen', intervallTage: 7, letzteErledigung: null, kategorie: 'reinigung' },
  { id: generateId(), name: 'Küche reinigen', intervallTage: 3, letzteErledigung: null, kategorie: 'kueche' },
  { id: generateId(), name: 'Aufräumen', intervallTage: 3, letzteErledigung: null, kategorie: 'reinigung' },
];

const standardErinnerungen: Erinnerung[] = [
  {
    id: generateId(),
    name: 'Zahnarzt',
    typ: 'jaehrlich',
    naechstesFaelligkeit: '2026-06-01',
    erinnerungTagsVorher: 30,
    kategorie: 'gesundheit',
  },
];

export function getHaushaltsAufgaben(): HaushaltsAufgabe[] {
  const stored = safeGet<HaushaltsAufgabe[] | null>(KEYS.haushalt, null);
  if (!stored) {
    safeSet(KEYS.haushalt, standardHaushalt);
    return standardHaushalt;
  }
  return stored;
}

export function saveHaushaltsAufgaben(aufgaben: HaushaltsAufgabe[]): void {
  safeSet(KEYS.haushalt, aufgaben);
}

export function getErinnerungen(): Erinnerung[] {
  const stored = safeGet<Erinnerung[] | null>(KEYS.erinnerungen, null);
  if (!stored) {
    safeSet(KEYS.erinnerungen, standardErinnerungen);
    return standardErinnerungen;
  }
  return stored;
}

export function saveErinnerungen(erinnerungen: Erinnerung[]): void {
  safeSet(KEYS.erinnerungen, erinnerungen);
}
