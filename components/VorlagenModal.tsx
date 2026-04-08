'use client';

import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import clsx from 'clsx';
import type { HaushaltsAufgabe, HaushaltsKategorie, Erinnerung, ErinnerungsTyp, ErinnerungsKategorie } from '@/lib/types';
import { generateId, naechstesFaelligkeitsDatum } from '@/lib/utils';
import { format, addMonths, addYears } from 'date-fns';

interface HaushaltsVorlage {
  name: string;
  intervallTage: number;
  kategorie: HaushaltsKategorie;
}

interface ErinnerungsVorlage {
  name: string;
  typ: ErinnerungsTyp;
  monate?: number;
  jahre?: number;
  erinnerungTagsVorher: number;
  kategorie: ErinnerungsKategorie;
}

const haushaltsVorlagen: { gruppe: string; eintraege: HaushaltsVorlage[] }[] = [
  {
    gruppe: 'Reinigung',
    eintraege: [
      { name: 'Saugen',              intervallTage: 7,   kategorie: 'reinigung' },
      { name: 'Wischen',             intervallTage: 14,  kategorie: 'reinigung' },
      { name: 'Bad putzen',          intervallTage: 7,   kategorie: 'reinigung' },
      { name: 'Fenster putzen',      intervallTage: 90,  kategorie: 'reinigung' },
      { name: 'Frühjahrsputz',       intervallTage: 180, kategorie: 'reinigung' },
      { name: 'Teppich reinigen',    intervallTage: 90,  kategorie: 'reinigung' },
      { name: 'Keller aufräumen',    intervallTage: 180, kategorie: 'reinigung' },
    ],
  },
  {
    gruppe: 'Wäsche',
    eintraege: [
      { name: 'Wäsche waschen',      intervallTage: 4,  kategorie: 'waesche' },
      { name: 'Bettwäsche wechseln', intervallTage: 14, kategorie: 'waesche' },
      { name: 'Handtücher wechseln', intervallTage: 7,  kategorie: 'waesche' },
    ],
  },
  {
    gruppe: 'Küche',
    eintraege: [
      { name: 'Küche reinigen',         intervallTage: 3,  kategorie: 'kueche' },
      { name: 'Kühlschrank reinigen',   intervallTage: 30, kategorie: 'kueche' },
      { name: 'Backofen reinigen',      intervallTage: 60, kategorie: 'kueche' },
      { name: 'Waschmaschine reinigen', intervallTage: 30, kategorie: 'waesche' },
    ],
  },
  {
    gruppe: 'Sonstiges',
    eintraege: [
      { name: 'Aufräumen',           intervallTage: 3,   kategorie: 'reinigung' },
      { name: 'Heizungsfilter',      intervallTage: 365, kategorie: 'sonstiges' },
      { name: 'Rauchmelder testen',  intervallTage: 365, kategorie: 'sonstiges' },
    ],
  },
];

function futureDatum(monate?: number, jahre?: number): string {
  const base = new Date();
  if (jahre) return format(addYears(base, jahre), 'yyyy-MM-dd');
  if (monate) return format(addMonths(base, monate), 'yyyy-MM-dd');
  return format(addMonths(base, 1), 'yyyy-MM-dd');
}

const erinnerungsVorlagen: { gruppe: string; eintraege: ErinnerungsVorlage[] }[] = [
  {
    gruppe: '🏥 Gesundheit',
    eintraege: [
      { name: 'Zahnarzt',              typ: 'halbjaehrlich', monate: 6,  erinnerungTagsVorher: 30, kategorie: 'gesundheit' },
      { name: 'Augenarzt',             typ: 'jaehrlich',     jahre: 1,   erinnerungTagsVorher: 30, kategorie: 'gesundheit' },
      { name: 'Hausarzt Vorsorge',     typ: 'jaehrlich',     jahre: 1,   erinnerungTagsVorher: 30, kategorie: 'gesundheit' },
      { name: 'Hautarzt',              typ: 'jaehrlich',     jahre: 1,   erinnerungTagsVorher: 30, kategorie: 'gesundheit' },
      { name: 'Medikamente auffüllen', typ: 'monatlich',     monate: 1,  erinnerungTagsVorher: 7,  kategorie: 'gesundheit' },
    ],
  },
  {
    gruppe: '💰 Finanzen',
    eintraege: [
      { name: 'Steuererklärung',        typ: 'jaehrlich',   jahre: 1,  erinnerungTagsVorher: 60, kategorie: 'finanzen' },
      { name: 'Abos & Verträge checken',typ: 'jaehrlich',   jahre: 1,  erinnerungTagsVorher: 30, kategorie: 'finanzen' },
      { name: 'Versicherungen prüfen',  typ: 'jaehrlich',   jahre: 1,  erinnerungTagsVorher: 30, kategorie: 'finanzen' },
      { name: 'Kontoauszüge prüfen',    typ: 'monatlich',   monate: 1, erinnerungTagsVorher: 5,  kategorie: 'finanzen' },
    ],
  },
  {
    gruppe: '🏛️ Behörden',
    eintraege: [
      { name: 'KFZ-HU (TÜV)',       typ: 'zweijaehrlich', jahre: 2,   erinnerungTagsVorher: 60, kategorie: 'behoerden' },
      { name: 'Reisepass prüfen',   typ: 'jaehrlich',     jahre: 1,   erinnerungTagsVorher: 90, kategorie: 'behoerden' },
      { name: 'Personalausweis',    typ: 'jaehrlich',     jahre: 1,   erinnerungTagsVorher: 90, kategorie: 'behoerden' },
    ],
  },
  {
    gruppe: '📌 Sonstiges',
    eintraege: [
      { name: 'Rauchmelder prüfen',    typ: 'jaehrlich',   jahre: 1,  erinnerungTagsVorher: 14, kategorie: 'sonstiges' },
      { name: 'Erste-Hilfe-Set',       typ: 'zweijaehrlich',jahre: 2, erinnerungTagsVorher: 30, kategorie: 'sonstiges' },
      { name: 'Fahrrad Service',       typ: 'jaehrlich',   jahre: 1,  erinnerungTagsVorher: 14, kategorie: 'sonstiges' },
    ],
  },
];

interface Props {
  initialTab: 'haushalt' | 'erinnerungen';
  onAufgabeHinzufuegen?: (aufgabe: HaushaltsAufgabe) => void;
  onErinnerungHinzufuegen?: (erinnerung: Erinnerung) => void;
  onSchliessen: () => void;
}

export default function VorlagenModal({
  initialTab,
  onAufgabeHinzufuegen,
  onErinnerungHinzufuegen,
  onSchliessen,
}: Props) {
  const [tab, setTab] = useState<'haushalt' | 'erinnerungen'>(initialTab);
  const [hinzugefuegt, setHinzugefuegt] = useState<Set<string>>(new Set());

  function aufgabeHinzufuegen(vorlage: HaushaltsVorlage) {
    if (!onAufgabeHinzufuegen) return;
    onAufgabeHinzufuegen({
      id: generateId(),
      name: vorlage.name,
      intervallTage: vorlage.intervallTage,
      letzteErledigung: null,
      kategorie: vorlage.kategorie,
    });
    setHinzugefuegt((prev) => new Set(prev).add(vorlage.name));
  }

  function erinnerungHinzufuegen(vorlage: ErinnerungsVorlage) {
    if (!onErinnerungHinzufuegen) return;
    onErinnerungHinzufuegen({
      id: generateId(),
      name: vorlage.name,
      typ: vorlage.typ,
      naechstesFaelligkeit: futureDatum(vorlage.monate, vorlage.jahre),
      erinnerungTagsVorher: vorlage.erinnerungTagsVorher,
      kategorie: vorlage.kategorie,
    });
    setHinzugefuegt((prev) => new Set(prev).add(vorlage.name));
  }

  function intervallText(tage: number): string {
    if (tage === 1) return 'täglich';
    if (tage === 7) return 'wöchentlich';
    if (tage === 14) return 'alle 2 Wochen';
    if (tage === 30) return 'monatlich';
    if (tage === 90) return 'vierteljährlich';
    if (tage === 180) return 'halbjährlich';
    if (tage === 365) return 'jährlich';
    return `alle ${tage} Tage`;
  }

  const typLabelKurz: Record<ErinnerungsTyp, string> = {
    einmalig: 'einmalig', monatlich: 'monatlich', zweimonatlich: 'alle 2 Mo.',
    vierteljaehrlich: 'vierteljährlich', halbjaehrlich: 'halbjährlich',
    jaehrlich: 'jährlich', zweijaehrlich: 'alle 2 Jahre',
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Vorlagen</h2>
          <button onClick={onSchliessen} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-4">
          {(['haushalt', 'erinnerungen'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'py-3 px-4 text-sm font-medium border-b-2 transition-colors',
                tab === t
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              )}
            >
              {t === 'haushalt' ? '🏠 Haushalt' : '🔔 Erinnerungen'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-5">
          {tab === 'haushalt' &&
            haushaltsVorlagen.map((gruppe) => (
              <div key={gruppe.gruppe}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  {gruppe.gruppe}
                </p>
                <div className="space-y-2">
                  {gruppe.eintraege.map((vorlage) => {
                    const bereits = hinzugefuegt.has(vorlage.name);
                    return (
                      <div
                        key={vorlage.name}
                        className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5"
                      >
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{vorlage.name}</p>
                          <p className="text-xs text-slate-400">{intervallText(vorlage.intervallTage)}</p>
                        </div>
                        <button
                          onClick={() => aufgabeHinzufuegen(vorlage)}
                          disabled={bereits}
                          className={clsx(
                            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                            bereits
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          )}
                        >
                          {bereits ? <><Check size={12} /> Hinzugefügt</> : <><Plus size={12} /> Hinzufügen</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          {tab === 'erinnerungen' &&
            erinnerungsVorlagen.map((gruppe) => (
              <div key={gruppe.gruppe}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  {gruppe.gruppe}
                </p>
                <div className="space-y-2">
                  {gruppe.eintraege.map((vorlage) => {
                    const bereits = hinzugefuegt.has(vorlage.name);
                    return (
                      <div
                        key={vorlage.name}
                        className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5"
                      >
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{vorlage.name}</p>
                          <p className="text-xs text-slate-400">{typLabelKurz[vorlage.typ]} · {vorlage.erinnerungTagsVorher}d vorher erinnern</p>
                        </div>
                        <button
                          onClick={() => erinnerungHinzufuegen(vorlage)}
                          disabled={bereits}
                          className={clsx(
                            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                            bereits
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          )}
                        >
                          {bereits ? <><Check size={12} /> Hinzugefügt</> : <><Plus size={12} /> Hinzufügen</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
