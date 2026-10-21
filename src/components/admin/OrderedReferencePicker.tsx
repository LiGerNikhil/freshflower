"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";

export function OrderedReferencePicker({ label, options, value, onChange }: {
  label: string; options: { id: string; name: string }[]; value: string[]; onChange: (ids: string[]) => void;
}) {
  function move(index: number, direction: number) {
    const next = [...value];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  }
  return <div>
    <label className="block text-sm font-semibold">{label}
      <select value="" onChange={(event) => { if (event.target.value) onChange([...value, event.target.value]); }} className="mt-2 w-full rounded-md border border-ink/10 bg-white p-3 text-sm">
        <option value="">Add selection…</option>
        {options.filter((option) => !value.includes(option.id)).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
    </label>
    <ol className="mt-2 space-y-2">{value.map((id, index) => {
      const name = options.find((option) => option.id === id)?.name ?? `Missing: ${id}`;
      return <li key={id} className="flex items-center gap-2 rounded-md border border-ink/10 bg-white/60 p-2 text-sm"><span className="min-w-0 flex-1">{index + 1}. {name}</span>
        <button type="button" aria-label={`Move ${name} up`} disabled={index === 0} onClick={() => move(index, -1)} className="p-2 disabled:opacity-30"><ArrowUp size={14} /></button>
        <button type="button" aria-label={`Move ${name} down`} disabled={index === value.length - 1} onClick={() => move(index, 1)} className="p-2 disabled:opacity-30"><ArrowDown size={14} /></button>
        <button type="button" aria-label={`Remove ${name}`} onClick={() => onChange(value.filter((entry) => entry !== id))} className="p-2"><X size={14} /></button>
      </li>;
    })}</ol>
  </div>;
}
