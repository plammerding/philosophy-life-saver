export type AmpelStatus = 'gruen' | 'gelb' | 'rot';

export type HaushaltsKategorie = 'reinigung' | 'waesche' | 'kueche' | 'sonstiges';
export type ErinnerungsKategorie = 'gesundheit' | 'finanzen' | 'behoerden' | 'sonstiges';
export type ErinnerungsTyp =
  | 'einmalig'
  | 'monatlich'
  | 'zweimonatlich'
  | 'vierteljaehrlich'
  | 'halbjaehrlich'
  | 'jaehrlich'
  | 'zweijaehrlich';

export type MutationsTyp =
  | { type: 'aufgabe_add'; data: Omit<HaushaltsAufgabe, 'id'> }
  | { type: 'erinnerung_add'; data: Omit<Erinnerung, 'id'> }
  | { type: 'aufgabe_erledigt'; id: string }
  | { type: 'erinnerung_erledigt'; id: string };

export interface HaushaltsAufgabe {
  id: string;
  name: string;
  intervallTage: number;
  letzteErledigung: string | null; // ISO date string YYYY-MM-DD
  kategorie: HaushaltsKategorie;
}

export interface Erinnerung {
  id: string;
  name: string;
  typ: ErinnerungsTyp;
  naechstesFaelligkeit: string; // ISO date string YYYY-MM-DD
  erinnerungTagsVorher: number;
  kategorie: ErinnerungsKategorie;
  notizen?: string;
}
