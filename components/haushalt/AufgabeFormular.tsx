'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { HaushaltsAufgabe, HaushaltsKategorie } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface Props {
  onHinzufuegen: (aufgabe: HaushaltsAufgabe) => void;
}

const kategorieOptionen: { value: HaushaltsKategorie; label: string }[] = [
  { value: 'reinigung', label: 'Reinigung' },
  { value: 'waesche', label: 'Wäsche' },
  { value: 'kueche', label: 'Küche' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

export default function AufgabeFormular({ onHinzufuegen }: Props) {
  const [offen, setOffen] = useState(false);
  const [name, setName] = useState('');
  const [intervall, setIntervall] = useState(7);
  const [kategorie, setKategorie] = useState<HaushaltsKategorie>('reinigung');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    onHinzufuegen({
      id: generateId(),
      name: name.trim(),
      intervallTage: intervall,
      letzteErledigung: null,
      kategorie,
    });

    setName('');
    setIntervall(7);
    setKategorie('reinigung');
    setOffen(false);
  }

  if (!offen) {
    return (
      <button
        onClick={() => setOffen(true)}
        className="w-full flex items-center gap-2 justify-center py-3 px-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors font-medium"
      >
        <Plus size={18} />
        Aufgabe hinzufügen
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-indigo-200 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-700">Neue Aufgabe</p>
        <button
          type="button"
          onClick={() => setOffen(false)}
          className="text-slate-400 hover:text-slate-600 p-1"
        >
          <X size={18} />
        </button>
      </div>

      <input
        type="text"
        placeholder="z.B. Fenster putzen"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Alle X Tage</label>
          <input
            type="number"
            min={1}
            max={365}
            value={intervall}
            onChange={(e) => setIntervall(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Kategorie</label>
          <select
            value={kategorie}
            onChange={(e) => setKategorie(e.target.value as HaushaltsKategorie)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
          >
            {kategorieOptionen.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
      >
        Hinzufügen
      </button>
    </form>
  );
}
