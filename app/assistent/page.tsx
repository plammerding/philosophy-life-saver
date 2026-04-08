import Assistent from '@/components/Assistent';

export default function AssistentSeite() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🤖 Assistent</h1>
        <p className="text-sm text-slate-400 mt-1">Schreib mir — ich erledige den Rest.</p>
      </div>
      <Assistent />
    </div>
  );
}
