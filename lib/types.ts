export type AmpelStatus = 'gruen' | 'gelb' | 'rot';

export type HaushaltsKategorie = 'reinigung' | 'waesche' | 'kueche' | 'sonstiges';
export type ErinnerungsKategorie = 'gesundheit' | 'finanzen' | 'behoerden' | 'sonstiges';
export type ErinnerungsTyp = 'jaehrlich' | 'monatlich' | 'einmalig';

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
