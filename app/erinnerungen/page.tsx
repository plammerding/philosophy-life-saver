'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { getErinnerungen, saveErinnerungen } from '@/lib/storage';
import { getAmpelErinnerung, naechstesFaelligkeitsDatum, heuteDatum } from '@/lib/utils';
import type { Erinnerung } from '@/lib/types';
import ErinnerungKarte from '@/components/erinnerungen/ErinnerungKarte';
import ErinnerungFormular from '@/components/erinnerungen/ErinnerungFormular';
import VorlagenModal from '@/components/VorlagenModal';

export default function ErinnerungenSeite() {
  const [erinnerungen, setErinnerungen] = useState<Erinnerung[]>([]);
  const [vorlagenOffen, setVorlagenOffen] = useState(false);

  useEffect(() => {
    setErinnerungen(getErinnerungen());
  }, []);

  function handleLoeschen(id: string) {
    const aktualisiert = erinnerungen.filter((e) => e.id !== id);
    setErinnerungen(aktualisiert);
    saveErinnerungen(aktualisiert);
  }

  function handleErledigt(id: string) {
    const erinnerung = erinnerungen.find((e) => e.id === id);
    if (!erinnerung) return;

    if (erinnerung.typ === 'einmalig') {
      handleLoeschen(id);
      return;
    }

    // Neu einplanen ab heute
    const naechstesDatum = naechstesFaelligkeitsDatum(erinnerung.typ, heuteDatum());
    const aktualisiert = erinnerungen.map((e) =>
      e.id === id ? { ...e, naechstesFaelligkeit: naechstesDatum } : e
    );
    setErinnerungen(aktualisiert);
    saveErinnerungen(aktualisiert);
  }

  function handleHinzufuegen(erinnerung: Erinnerung) {
    const aktualisiert = [...erinnerungen, erinnerung];
    setErinnerungen(aktualisiert);
    saveErinnerungen(aktualisiert);
  }

  const rangfolge = { rot: 0, gelb: 1, gruen: 2 };
  const sortiert = [...erinnerungen].sort(
    (a, b) => rangfolge[getAmpelErinnerung(a)] - rangfolge[getAmpelErinnerung(b)]
  );

  const rotAnzahl = erinnerungen.filter((e) => getAmpelErinnerung(e) === 'rot').length;
  const gelbAnzahl = erinnerungen.filter((e) => getAmpelErinnerung(e) === 'gelb').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🔔 Erinnerungen</h1>
          <p className="text-sm text-slate-400 mt-1">
            {rotAnzahl > 0 && <span className="text-red-500 font-medium">{rotAnzahl} überfällig</span>}
            {rotAnzahl > 0 && gelbAnzahl > 0 && <span className="text-slate-300"> · </span>}
            {gelbAnzahl > 0 && <span className="text-amber-500 font-medium">{gelbAnzahl} demnächst</span>}
            {rotAnzahl === 0 && gelbAnzahl === 0 && erinnerungen.length > 0 && (
              <span className="text-emerald-500 font-medium">Alles im grünen Bereich ✓</span>
            )}
            {erinnerungen.length === 0 && <span className="text-slate-400">Noch keine Erinnerungen</span>}
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
        {sortiert.map((erinnerung) => (
          <ErinnerungKarte
            key={erinnerung.id}
            erinnerung={erinnerung}
            onLoeschen={handleLoeschen}
            onErledigt={handleErledigt}
          />
        ))}
      </div>

      <ErinnerungFormular onHinzufuegen={handleHinzufuegen} />

      {vorlagenOffen && (
        <VorlagenModal
          initialTab="erinnerungen"
          onErinnerungHinzufuegen={handleHinzufuegen}
          onSchliessen={() => setVorlagenOffen(false)}
        />
      )}
    </div>
  );
}
