'use client';

import { useState } from 'react';
import { Check, Trash2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { getAmpelErinnerung, getTageBisErinnerung, formatDatum } from '@/lib/utils';
import type { Erinnerung } from '@/lib/types';

const kategorieLabel: Record<Erinnerung['kategorie'], string> = {
  gesundheit: '🏥 Gesundheit',
  finanzen: '💰 Finanzen',
  behoerden: '🏛️ Behörden',
  sonstiges: '📌 Sonstiges',
};

const typLabel: Record<Erinnerung['typ'], string> = {
  einmalig:        'einmalig',
  monatlich:       'monatlich',
  zweimonatlich:   'alle 2 Monate',
  vierteljaehrlich:'vierteljährlich',
  halbjaehrlich:   'halbjährlich',
  jaehrlich:       'jährlich',
  zweijaehrlich:   'alle 2 Jahre',
};

interface Props {
  erinnerung: Erinnerung;
  onLoeschen: (id: string) => void;
  onErledigt: (id: string) => void;
}

export default function ErinnerungKarte({ erinnerung, onLoeschen, onErledigt }: Props) {
  const [animiert, setAnimiert] = useState(false);
  const status = getAmpelErinnerung(erinnerung);
  const tage = getTageBisErinnerung(erinnerung);

  function handleErledigt() {
    setAnimiert(true);
    setTimeout(() => {
      onErledigt(erinnerung.id);
      setAnimiert(false);
    }, 350);
  }

  const farben = {
    rot:   { border: 'border-red-200',     bg: 'bg-red-50',   dot: 'bg-red-500',   badge: 'bg-red-100 text-red-700' },
    gelb:  { border: 'border-amber-200',   bg: 'bg-amber-50', dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' },
    gruen: { border: 'border-emerald-100', bg: 'bg-white',    dot: 'bg-emerald-400',badge: 'bg-emerald-50 text-emerald-700' },
  };
  const f = farben[status];

  function tagText(): string {
    if (tage < 0) return `${Math.abs(tage)} Tage überfällig`;
    if (tage === 0) return 'Heute!';
    if (tage === 1) return 'Morgen';
    return `In ${tage} Tagen`;
  }

  return (
    <div className={clsx('ampel-card rounded-2xl border p-4', f.border, f.bg, animiert && 'scale-95 opacity-60')}>
      <div className="flex items-start gap-3">
        <div className={clsx('w-3 h-3 rounded-full shrink-0 mt-1', f.dot)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-slate-800">{erinnerung.name}</p>
            <button
              onClick={() => onLoeschen(erinnerung.id)}
              className="text-slate-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', f.badge)}>
              {tagText()}
            </span>
            <span className="text-xs text-slate-400">{formatDatum(erinnerung.naechstesFaelligkeit)}</span>
          </div>

          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs text-slate-400">{kategorieLabel[erinnerung.kategorie]}</span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-400">{typLabel[erinnerung.typ]}</span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-400">Erinnerung {erinnerung.erinnerungTagsVorher}d vorher</span>
          </div>

          {erinnerung.notizen && (
            <p className="text-xs text-slate-500 mt-2 italic">{erinnerung.notizen}</p>
          )}

          {/* Erledigt-Button */}
          <button
            onClick={handleErledigt}
            className={clsx(
              'mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-sm transition-all',
              erinnerung.typ === 'einmalig'
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            )}
          >
            {erinnerung.typ === 'einmalig' ? (
              <><Check size={14} strokeWidth={2.5} /> Erledigt & löschen</>
            ) : (
              <><RefreshCw size={14} strokeWidth={2.5} /> Erledigt — neu einplanen</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
