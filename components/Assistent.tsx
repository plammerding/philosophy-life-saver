'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, Check } from 'lucide-react';
import clsx from 'clsx';
import { getHaushaltsAufgaben, getErinnerungen, saveHaushaltsAufgaben, saveErinnerungen } from '@/lib/storage';
import { generateId, heuteDatum, naechstesFaelligkeitsDatum } from '@/lib/utils';
import type { MutationsTyp, HaushaltsAufgabe, Erinnerung } from '@/lib/types';

interface ChatNachricht {
  id: string;
  rolle: 'user' | 'assistant';
  text: string;
  mutations?: MutationsTyp[];
}

const schnellPrompts = [
  'Was sollte ich jährlich erledigen?',
  'Füge Zahnarzt in 6 Monaten hinzu',
  'Was fehlt in meinem Haushalt?',
  'Was ist heute dringend?',
];

const mutationsLabel: Record<MutationsTyp['type'], string> = {
  aufgabe_add:       '+ Aufgabe hinzugefügt',
  erinnerung_add:    '+ Erinnerung hinzugefügt',
  aufgabe_erledigt:  '✓ Aufgabe erledigt',
  erinnerung_erledigt: '✓ Erinnerung neu eingeplant',
};

function applyMutation(mutation: MutationsTyp) {
  if (mutation.type === 'aufgabe_add') {
    const aufgaben = getHaushaltsAufgaben();
    aufgaben.push({ ...mutation.data, id: generateId() });
    saveHaushaltsAufgaben(aufgaben);
  } else if (mutation.type === 'erinnerung_add') {
    const erinnerungen = getErinnerungen();
    erinnerungen.push({ ...mutation.data, id: generateId() });
    saveErinnerungen(erinnerungen);
  } else if (mutation.type === 'aufgabe_erledigt') {
    const aufgaben = getHaushaltsAufgaben().map((a: HaushaltsAufgabe) =>
      a.id === mutation.id ? { ...a, letzteErledigung: heuteDatum() } : a
    );
    saveHaushaltsAufgaben(aufgaben);
  } else if (mutation.type === 'erinnerung_erledigt') {
    const erinnerungen = getErinnerungen().map((e: Erinnerung) => {
      if (e.id !== mutation.id) return e;
      if (e.typ === 'einmalig') return null;
      return { ...e, naechstesFaelligkeit: naechstesFaelligkeitsDatum(e.typ, heuteDatum()) };
    }).filter(Boolean) as Erinnerung[];
    saveErinnerungen(erinnerungen);
  }
}

export default function Assistent() {
  const [nachrichten, setNachrichten] = useState<ChatNachricht[]>([]);
  const [eingabe, setEingabe] = useState('');
  const [laden, setLaden] = useState(false);
  const [apiKeyFehlt, setApiKeyFehlt] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [nachrichten]);

  async function senden(text: string) {
    const eingabeText = text.trim();
    if (!eingabeText || laden) return;

    const neueNachricht: ChatNachricht = { id: generateId(), rolle: 'user', text: eingabeText };
    const aktuelleNachrichten = [...nachrichten, neueNachricht];
    setNachrichten(aktuelleNachrichten);
    setEingabe('');
    setLaden(true);

    try {
      const state = {
        aufgaben: getHaushaltsAufgaben(),
        erinnerungen: getErinnerungen(),
      };

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: aktuelleNachrichten.map((n) => ({ role: n.rolle, content: n.text })),
          state,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error?.includes('ANTHROPIC_API_KEY')) setApiKeyFehlt(true);
        throw new Error(err.error ?? 'Fehler');
      }

      const data = await res.json() as { reply: string; mutations: MutationsTyp[] };

      // Mutations anwenden
      for (const mutation of data.mutations ?? []) {
        applyMutation(mutation);
      }

      setNachrichten((prev) => [
        ...prev,
        {
          id: generateId(),
          rolle: 'assistant',
          text: data.reply,
          mutations: data.mutations?.length ? data.mutations : undefined,
        },
      ]);
    } catch (err) {
      setNachrichten((prev) => [
        ...prev,
        {
          id: generateId(),
          rolle: 'assistant',
          text: 'Fehler bei der Verbindung zum Assistenten. Bitte prüf den API Key in `.env.local`.',
        },
      ]);
    } finally {
      setLaden(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      senden(eingabe);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* API Key Warnung */}
      {apiKeyFehlt && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 text-sm text-amber-800">
          <strong>API Key fehlt.</strong> Trage deinen Anthropic API Key in{' '}
          <code className="bg-amber-100 px-1 rounded">.env.local</code> ein.
        </div>
      )}

      {/* Schnell-Prompts */}
      {nachrichten.length === 0 && (
        <div className="mb-4">
          <p className="text-sm text-slate-500 mb-3 font-medium">Was kann ich für dich tun?</p>
          <div className="flex flex-wrap gap-2">
            {schnellPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => senden(prompt)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat-Verlauf */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {nachrichten.map((nachricht) => (
          <div key={nachricht.id} className={clsx('flex', nachricht.rolle === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={clsx('max-w-[80%] space-y-2')}>
              <div
                className={clsx(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  nachricht.rolle === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                )}
              >
                {nachricht.text}
              </div>
              {/* Mutation-Chips */}
              {nachricht.mutations && nachricht.mutations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 ml-1">
                  {nachricht.mutations.map((m, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-full"
                    >
                      <Check size={10} strokeWidth={3} />
                      {m.type === 'aufgabe_add' && `Aufgabe: ${'name' in (m.data ?? {}) ? (m.data as HaushaltsAufgabe).name : ''}`}
                      {m.type === 'erinnerung_add' && `Erinnerung: ${'name' in (m.data ?? {}) ? (m.data as Erinnerung).name : ''}`}
                      {m.type === 'aufgabe_erledigt' && mutationsLabel[m.type]}
                      {m.type === 'erinnerung_erledigt' && mutationsLabel[m.type]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Lade-Indikator */}
        {laden && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 size={16} className="text-slate-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Eingabe */}
      <div className="flex gap-2 items-end bg-white border border-slate-200 rounded-2xl p-2">
        <textarea
          ref={inputRef}
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Schreib mir was du brauchst..."
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none text-sm"
          style={{ maxHeight: '120px' }}
        />
        <button
          onClick={() => senden(eingabe)}
          disabled={!eingabe.trim() || laden}
          className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
