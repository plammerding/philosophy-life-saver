'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Erinnerung, ErinnerungsKategorie, ErinnerungsTyp } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface Props {
  onHinzufuegen: (erinnerung: Erinnerung) => void;
}

const kategorieOptionen: { value: ErinnerungsKategorie; label: string }[] = [
  { value: 'gesundheit', label: '🏥 Gesundheit' },
  { value: 'finanzen', label: '💰 Finanzen' },
  { value: 'behoerden', label: '🏛️ Behörden' },
  { value: 'sonstiges', label: '📌 Sonstiges' },
];

const typOptionen: { value: ErinnerungsTyp; label: string }[] = [
  { value: 'jaehrlich', label: 'Jährlich' },
  { value: 'monatlich', label: 'Monatlich' },
  { value: 'einmalig', label: 'Einmalig' },
];

export default function ErinnerungFormular({ onHinzufuegen }: Props) {
  const [offen, setOffen] = useState(false);
  const [name, setName] = useState('');
  const [typ, setTyp] = useState<ErinnerungsTyp>('jaehrlich');
  const [faelligkeit, setFaelligkeit] = useState('');
  const [erinnerungTage, setErinnerungTage] = useState(14);
  const [kategorie, setKategorie] = useState<ErinnerungsKategorie>('gesundheit');
  const [notizen, setNotizen] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !faelligkeit) return;

    onHinzufuegen({
      id: generateId(),
      name: name.trim(),
      typ,
      naechstesFaelligkeit: faelligkeit,
      erinnerungTagsVorher: erinnerungTage,
      kategorie,
      notizen: notizen.trim() || undefined,
    });

    setName('');
    setTyp('jaehrlich');
    setFaelligkeit('');
    setErinnerungTage(14);
    setKategorie('gesundheit');
    setNotizen('');
    setOffen(false);
  }

  if (!offen) {
    return (
      <button
        onClick={() => setOffen(true)}
        className="w-full flex items-center gap-2 justify-center py-3 px-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors font-medium"
      >
        <Plus size={18} />
        Erinnerung hinzufügen
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-indigo-200 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-700">Neue Erinnerung</p>
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
        placeholder="z.B. Zahnarzt"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Nächste Fälligkeit</label>
          <input
            type="date"
            value={faelligkeit}
            onChange={(e) => setFaelligkeit(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Wiederholung</label>
          <select
            value={typ}
            onChange={(e) => setTyp(e.target.value as ErinnerungsTyp)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
          >
            {typOptionen.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Erinnerung X Tage vorher</label>
          <input
            type="number"
            min={1}
            max={365}
            value={erinnerungTage}
            onChange={(e) => setErinnerungTage(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Kategorie</label>
          <select
            value={kategorie}
            onChange={(e) => setKategorie(e.target.value as ErinnerungsKategorie)}
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

      <input
        type="text"
        placeholder="Notizen (optional)"
        value={notizen}
        onChange={(e) => setNotizen(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
      >
        Hinzufügen
      </button>
    </form>
  );
}
