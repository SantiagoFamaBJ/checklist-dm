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
  const [sinFecha, setSinFecha] = useState(false);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState(5);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        category,
        due_date: sinFecha ? null : dueDate,
        priority,
      }),
    });
    setSaving(false);
    onCreated();
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6 shadow-sm border border-gray-100 flex flex-col gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15922]/30 focus:border-[#f15922]"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        rows={2}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15922]/30 focus:border-[#f15922]"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15922]/30"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="flex flex-col gap-1">
          <input
            type="date"
            value={dueDate}
            disabled={sinFecha}
            onChange={(e) => setDueDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f15922]/30"
          />
          <label className="flex items-center gap-1.5 text-xs text-gray-500 pl-0.5">
            <input
              type="checkbox"
              checked={sinFecha}
              onChange={(e) => setSinFecha(e.target.checked)}
              className="!w-3.5 !h-3.5"
            />
            Sin fecha definida
          </label>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3">
          <input
            type="range"
            min={1}
            max={10}
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-semibold w-6 text-center">{priority}</span>
        </div>
      </div>
      <button
        onClick={submit}
        disabled={saving}
        className="bg-[#f15922] text-white text-sm font-medium px-4 py-2 rounded-full self-start hover:bg-[#d9481a] transition-colors disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar tarea'}
      </button>
    </div>
  );
}
