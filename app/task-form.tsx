'use client';

import { useState } from 'react';

export default function TaskForm({
  categorias,
  onCreated,
}: {
  categorias: string[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categorias[0] || 'Otros');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState(5);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, due_date: dueDate, priority }),
    });
    setSaving(false);
    onCreated();
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-col gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        rows={2}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-3 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-2 text-sm"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-2 text-sm"
        />
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={10}
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium w-6 text-center">{priority}</span>
        </div>
      </div>
      <button
        onClick={submit}
        disabled={saving}
        className="bg-[#f15922] text-white text-sm font-medium px-4 py-2 rounded-md self-start disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar tarea'}
      </button>
    </div>
  );
}
