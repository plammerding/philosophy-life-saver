'use client';

import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { getAmpelHaushalt, getTageBisHaushalt, formatDatumKurz } from '@/lib/utils';
import type { HaushaltsAufgabe } from '@/lib/types';

interface Props {
  aufgabe: HaushaltsAufgabe;
  onErledigt: (id: string) => void;
  onLoeschen: (id: string) => void;
}

export default function AufgabeKarte({ aufgabe, onErledigt, onLoeschen }: Props) {
  const [animiert, setAnimiert] = useState(false);
  const status = getAmpelHaushalt(aufgabe);
  const tageBis = getTageBisHaushalt(aufgabe);

  function handleErledigt() {
    setAnimiert(true);
    setTimeout(() => {
      onErledigt(aufgabe.id);
      setAnimiert(false);
    }, 350);
  }

  const statusFarben = {
    rot: {
      border: 'border-red-200',
      bg: 'bg-red-50',
      dot: 'bg-red-500',
      text: 'text-red-600',
      badge: 'bg-red-100 text-red-700',
    },
    gelb: {
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      dot: 'bg-amber-400',
      text: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
    },
    gruen: {
      border: 'border-emerald-100',
      bg: 'bg-white',
      dot: 'bg-emerald-400',
      text: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700',
    },
  };

  const f = statusFarben[status];

  function statusText(): string {
    if (!aufgabe.letzteErledigung) return 'Noch nie erledigt';
    if (tageBis < 0) return `${Math.abs(tageBis)} Tage überfällig`;
    if (tageBis === 0) return 'Heute fällig';
    if (tageBis === 1) return 'Morgen fällig';
    return `In ${tageBis} Tagen`;
  }

  return (
    <div
      className={clsx(
        'ampel-card rounded-2xl border p-4 flex items-center gap-4',
        f.border,
        f.bg,
        animiert && 'scale-95 opacity-60'
      )}
    >
      {/* Ampel-Punkt */}
      <div className={clsx('w-3 h-3 rounded-full shrink-0', f.dot)} />

      {/* Inhalt */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800">{aufgabe.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', f.badge)}>
            {statusText()}
          </span>
          <span className="text-xs text-slate-400">alle {aufgabe.intervallTage} Tage</span>
          {aufgabe.letzteErledigung && (
            <span className="text-xs text-slate-400">
              zuletzt {formatDatumKurz(aufgabe.letzteErledigung)}
            </span>
          )}
        </div>
      </div>

      {/* Aktionen */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onLoeschen(aufgabe.id)}
          className="p-2 text-slate-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
          aria-label="Löschen"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={handleErledigt}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-all',
            status === 'gruen'
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
          )}
        >
          <Check size={15} strokeWidth={2.5} />
          Erledigt
        </button>
      </div>
    </div>
  );
}
