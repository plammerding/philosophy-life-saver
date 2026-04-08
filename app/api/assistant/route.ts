import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { HaushaltsAufgabe, Erinnerung, MutationsTyp } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const tools: Anthropic.Tool[] = [
  {
    name: 'haushaltsaufgabe_hinzufuegen',
    description: 'Fügt eine neue Haushalt-Aufgabe hinzu',
    input_schema: {
      type: 'object' as const,
      properties: {
        name:         { type: 'string',  description: 'Name der Aufgabe, z.B. "Fenster putzen"' },
        intervallTage:{ type: 'number',  description: 'Wie oft in Tagen, z.B. 7 für wöchentlich' },
        kategorie:    { type: 'string',  enum: ['reinigung', 'waesche', 'kueche', 'sonstiges'] },
      },
      required: ['name', 'intervallTage', 'kategorie'],
    },
  },
  {
    name: 'erinnerung_hinzufuegen',
    description: 'Fügt eine neue Erinnerung hinzu',
    input_schema: {
      type: 'object' as const,
      properties: {
        name:                { type: 'string', description: 'Name der Erinnerung, z.B. "Zahnarzt"' },
        typ:                 { type: 'string', enum: ['einmalig','monatlich','zweimonatlich','vierteljaehrlich','halbjaehrlich','jaehrlich','zweijaehrlich'] },
        naechstesFaelligkeit:{ type: 'string', description: 'Datum YYYY-MM-DD, z.B. in 6 Monaten' },
        erinnerungTagsVorher:{ type: 'number', description: 'Wie viele Tage vorher erinnern' },
        kategorie:           { type: 'string', enum: ['gesundheit','finanzen','behoerden','sonstiges'] },
        notizen:             { type: 'string', description: 'Optionale Notizen' },
      },
      required: ['name', 'typ', 'naechstesFaelligkeit', 'erinnerungTagsVorher', 'kategorie'],
    },
  },
  {
    name: 'haushaltsaufgabe_erledigen',
    description: 'Markiert eine Haushalt-Aufgabe als heute erledigt',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'ID der Aufgabe' },
      },
      required: ['id'],
    },
  },
  {
    name: 'erinnerung_erledigen',
    description: 'Markiert eine Erinnerung als erledigt und plant sie neu ein',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'ID der Erinnerung' },
      },
      required: ['id'],
    },
  },
];

function buildSystemPrompt(state: { aufgaben: HaushaltsAufgabe[]; erinnerungen: Erinnerung[] }): string {
  const heute = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de });

  const aufgabenText = state.aufgaben.length === 0
    ? 'Keine Haushalt-Aufgaben eingetragen.'
    : state.aufgaben.map(a =>
        `- ${a.name} (alle ${a.intervallTage} Tage, ID: ${a.id}, zuletzt: ${a.letzteErledigung ?? 'nie'})`
      ).join('\n');

  const erinnerungenText = state.erinnerungen.length === 0
    ? 'Keine Erinnerungen eingetragen.'
    : state.erinnerungen.map(e =>
        `- ${e.name} (${e.typ}, fällig: ${e.naechstesFaelligkeit}, ID: ${e.id})`
      ).join('\n');

  return `Du bist Philipps persönlicher Alltags-Assistent in "phil.osophy life saver".
Philipp hat ADHS — antworte deshalb immer kurz, klar, direkt. Kein Blabla.

HEUTE: ${heute}

HAUSHALT-AUFGABEN:
${aufgabenText}

ERINNERUNGEN:
${erinnerungenText}

REGELN:
- Wenn Philipp sagt "füge X hinzu" oder "erinnere mich an Y" → sofort mit Tool ausführen, keine Rückfragen
- Wenn Informationen fehlen, nutze intelligente Defaults (siehe unten)
- Nach Tool-Ausführung: kurze Bestätigung, was du gemacht hast
- Nie mehr als 2-3 Vorschläge auf einmal
- Positive Verstärkung wenn etwas erledigt wird

SMART DEFAULTS:
- Zahnarzt → halbjaehrlich, 6 Monate ab heute, 30 Tage vorher, gesundheit
- Augenarzt, Hausarzt, Hautarzt → jaehrlich, 1 Jahr ab heute, 30 Tage vorher, gesundheit
- Saugen, Bad putzen → 7 Tage, reinigung
- Wäsche → 4 Tage, waesche
- Steuererklärung → jaehrlich, 1 Jahr ab heute, 60 Tage vorher, finanzen
- KFZ-HU/TÜV → zweijaehrlich, 2 Jahre ab heute, 60 Tage vorher, behoerden

Antworte immer auf Deutsch.`;
}

function executeTool(
  name: string,
  input: Record<string, unknown>
): { result: string; mutation: MutationsTyp } {
  switch (name) {
    case 'haushaltsaufgabe_hinzufuegen':
      return {
        result: `Aufgabe "${input.name}" hinzugefügt.`,
        mutation: {
          type: 'aufgabe_add',
          data: {
            name: input.name as string,
            intervallTage: input.intervallTage as number,
            kategorie: input.kategorie as HaushaltsAufgabe['kategorie'],
            letzteErledigung: null,
          },
        },
      };
    case 'erinnerung_hinzufuegen':
      return {
        result: `Erinnerung "${input.name}" hinzugefügt.`,
        mutation: {
          type: 'erinnerung_add',
          data: {
            name: input.name as string,
            typ: input.typ as Erinnerung['typ'],
            naechstesFaelligkeit: input.naechstesFaelligkeit as string,
            erinnerungTagsVorher: input.erinnerungTagsVorher as number,
            kategorie: input.kategorie as Erinnerung['kategorie'],
            notizen: input.notizen as string | undefined,
          },
        },
      };
    case 'haushaltsaufgabe_erledigen':
      return {
        result: `Aufgabe als erledigt markiert.`,
        mutation: { type: 'aufgabe_erledigt', id: input.id as string },
      };
    case 'erinnerung_erledigen':
      return {
        result: `Erinnerung als erledigt markiert.`,
        mutation: { type: 'erinnerung_erledigt', id: input.id as string },
      };
    default:
      return { result: 'Unbekanntes Tool.', mutation: null as unknown as MutationsTyp };
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY nicht gesetzt.' }, { status: 500 });
  }

  const { messages, state } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    state: { aufgaben: HaushaltsAufgabe[]; erinnerungen: Erinnerung[] };
  };

  const systemPrompt = buildSystemPrompt(state);
  const mutations: MutationsTyp[] = [];

  const verlauf: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    tools,
    messages: verlauf,
  });

  // Tool-Loop: ausführen bis keine Tools mehr benötigt werden
  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      const { result, mutation } = executeTool(
        toolUse.name,
        toolUse.input as Record<string, unknown>
      );
      if (mutation) mutations.push(mutation);
      toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: result });
    }

    verlauf.push({ role: 'assistant', content: response.content });
    verlauf.push({ role: 'user', content: toolResults });

    response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages: verlauf,
    });
  }

  const replyText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  return NextResponse.json({ reply: replyText, mutations });
}
