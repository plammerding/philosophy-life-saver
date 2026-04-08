'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertCircle, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import clsx from 'clsx';
import { getHaushaltsAufgaben, getErinnerungen } from '@/lib/storage';
import { getAmpelHaushalt, getAmpelErinnerung, getTageBisErinnerung } from '@/lib/utils';
import type { HaushaltsAufgabe, Erinnerung } from '@/lib/types';

export default function Dashboard() {
  const [aufgaben, setAufgaben] = useState<HaushaltsAufgabe[]>([]);
  const [erinnerungen, setErinnerungen] = useState<Erinnerung[]>([]);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    setAufgaben(getHaushaltsAufgaben());
    setErinnerungen(getErinnerungen());
    setGeladen(true);
  }, []);

  const kritischeAufgaben = aufgaben.filter(
    (a) => getAmpelHaushalt(a) === 'rot' || getAmpelHaushalt(a) === 'gelb'
  );

  const kritischeErinnerungen = erinnerungen.filter(
    (e) => getAmpelErinnerung(e) === 'rot' || getAmpelErinnerung(e) === 'gelb'
  );

  const allesOk = kritischeAufgaben.length === 0 && kritischeErinnerungen.length === 0;
  const heute = format(new Date(), 'EEEE, d. MMMM', { locale: de });

  if (!geladen) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-slate-400 font-medium capitalize">{heute}</p>
        <h1 className="text-2xl font-bold text-slate-800 mt-1">Hey Philipp 👋</h1>
      </div>

      {/* Status-Banner */}
      {allesOk ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
          <div>
            <p className="font-semibold text-emerald-800">Alles im grünen Bereich!</p>
            <p className="text-sm text-emerald-600">Nichts dringend — gute Arbeit.</p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="text-amber-500 shrink-0" size={24} />
          <div>
            <p className="font-semibold text-amber-800">
              {kritischeAufgaben.length + kritischeErinnerungen.length} Dinge brauchen Aufmerksamkeit
            </p>
            <p className="text-sm text-amber-600">Schau dir die Liste unten an.</p>
          </div>
        </div>
      )}

      {/* Dringende Haushalt-Aufgaben */}
      {kritischeAufgaben.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700">Haushalt</h2>
            <Link
              href="/haushalt"
              className="text-sm text-indigo-600 flex items-center gap-0.5 hover:text-indigo-800"
            >
              Alle <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {kritischeAufgaben.map((aufgabe) => {
              const status = getAmpelHaushalt(aufgabe);
              return (
                <div
                  key={aufgabe.id}
                  className={clsx(
                    'flex items-center gap-3 rounded-xl px-4 py-3 border',
                    status === 'rot' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                  )}
                >
                  <div
                    className={clsx(
                      'w-2.5 h-2.5 rounded-full shrink-0',
                      status === 'rot' ? 'bg-red-500' : 'bg-amber-400'
                    )}
                  />
                  <span className="font-medium text-slate-700 flex-1">{aufgabe.name}</span>
                  <span className={clsx('text-xs font-medium', status === 'rot' ? 'text-red-600' : 'text-amber-600')}>
                    {aufgabe.letzteErledigung ? 'Überfällig' : 'Noch nie'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Dringende Erinnerungen */}
      {kritischeErinnerungen.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700">Erinnerungen</h2>
            <Link
              href="/erinnerungen"
              className="text-sm text-indigo-600 flex items-center gap-0.5 hover:text-indigo-800"
            >
              Alle <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {kritischeErinnerungen.map((erinnerung) => {
              const status = getAmpelErinnerung(erinnerung);
              const tage = getTageBisErinnerung(erinnerung);
              return (
                <div
                  key={erinnerung.id}
                  className={clsx(
                    'flex items-center gap-3 rounded-xl px-4 py-3 border',
                    status === 'rot' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                  )}
                >
                  <Clock
                    size={16}
                    className={clsx('shrink-0', status === 'rot' ? 'text-red-500' : 'text-amber-500')}
                  />
                  <span className="font-medium text-slate-700 flex-1">{erinnerung.name}</span>
                  <span className={clsx('text-xs font-medium', status === 'rot' ? 'text-red-600' : 'text-amber-600')}>
                    {tage < 0 ? `${Math.abs(tage)}d überfällig` : `in ${tage}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Links */}
      {allesOk && (
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/haushalt"
            className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 transition-colors"
          >
            <p className="font-semibold text-slate-700">🏠 Haushalt</p>
            <p className="text-sm text-slate-400 mt-1">{aufgaben.length} Aufgaben</p>
          </Link>
          <Link
            href="/erinnerungen"
            className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 transition-colors"
          >
            <p className="font-semibold text-slate-700">🔔 Erinnerungen</p>
            <p className="text-sm text-slate-400 mt-1">{erinnerungen.length} eingetragen</p>
          </Link>
        </div>
      )}
    </div>
  );
}
