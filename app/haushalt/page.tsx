'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { getHaushaltsAufgaben, saveHaushaltsAufgaben } from '@/lib/storage';
import { getAmpelHaushalt, heuteDatum } from '@/lib/utils';
import type { HaushaltsAufgabe } from '@/lib/types';
import AufgabeKarte from '@/components/haushalt/AufgabeKarte';
import AufgabeFormular from '@/components/haushalt/AufgabeFormular';
import VorlagenModal from '@/components/VorlagenModal';

export default function HaushaltsSeite() {
  const [aufgaben, setAufgaben] = useState<HaushaltsAufgabe[]>([]);
  const [vorlagenOffen, setVorlagenOffen] = useState(false);

  useEffect(() => {
    setAufgaben(getHaushaltsAufgaben());
  }, []);

  function handleErledigt(id: string) {
    const aktualisiert = aufgaben.map((a) =>
      a.id === id ? { ...a, letzteErledigung: heuteDatum() } : a
    );
    setAufgaben(aktualisiert);
    saveHaushaltsAufgaben(aktualisiert);
  }

  function handleLoeschen(id: string) {
    const aktualisiert = aufgaben.filter((a) => a.id !== id);
    setAufgaben(aktualisiert);
    saveHaushaltsAufgaben(aktualisiert);
  }

  function handleHinzufuegen(aufgabe: HaushaltsAufgabe) {
    const aktualisiert = [...aufgaben, aufgabe];
    setAufgaben(aktualisiert);
    saveHaushaltsAufgaben(aktualisiert);
  }

  const rangfolge = { rot: 0, gelb: 1, gruen: 2 };
  const sortiert = [...aufgaben].sort(
    (a, b) => rangfolge[getAmpelHaushalt(a)] - rangfolge[getAmpelHaushalt(b)]
  );

  const rotAnzahl = aufgaben.filter((a) => getAmpelHaushalt(a) === 'rot').length;
  const gelbAnzahl = aufgaben.filter((a) => getAmpelHaushalt(a) === 'gelb').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🏠 Haushalt</h1>
          <p className="text-sm text-slate-400 mt-1">
            {rotAnzahl > 0 && <span className="text-red-500 font-medium">{rotAnzahl} überfällig</span>}
            {rotAnzahl > 0 && gelbAnzahl > 0 && <span className="text-slate-300"> · </span>}
            {gelbAnzahl > 0 && <span className="text-amber-500 font-medium">{gelbAnzahl} bald fällig</span>}
            {rotAnzahl === 0 && gelbAnzahl === 0 && (
              <span className="text-emerald-500 font-medium">Alles erledigt ✓</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setVorlagenOffen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
        >
          <BookOpen size={15} />
          Vorlagen
        </button>
      </div>

      <div className="space-y-3">
        {sortiert.map((aufgabe) => (
          <AufgabeKarte
            key={aufgabe.id}
            aufgabe={aufgabe}
            onErledigt={handleErledigt}
            onLoeschen={handleLoeschen}
          />
        ))}
      </div>

      <AufgabeFormular onHinzufuegen={handleHinzufuegen} />

      {vorlagenOffen && (
        <VorlagenModal
          initialTab="haushalt"
          onAufgabeHinzufuegen={handleHinzufuegen}
          onSchliessen={() => setVorlagenOffen(false)}
        />
      )}
    </div>
  );
}
