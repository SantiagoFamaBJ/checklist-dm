'use client';

import { useEffect, useState } from 'react';
import { Congreso, ChecklistItem } from '@/lib/types';

type CongresoConChecklist = Congreso & { checklist: ChecklistItem[] };

export default function CongresosPage() {
  const [congresos, setCongresos] = useState<CongresoConChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'propio' | 'tercero'>('tercero');
  const [fecha, setFecha] = useState('');
  const [notas, setNotas] = useState('');
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const res = await fetch('/api/congresos');
    setCongresos(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function crear() {
    if (!nombre.trim()) return;
    await fetch('/api/congresos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, tipo, fecha: fecha || null, notas }),
    });
    setNombre('');
    setFecha('');
    setNotas('');
    setShowForm(false);
    load();
  }

  async function toggleItem(itemId: string, done: boolean) {
    await fetch(`/api/checklist/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !done }),
    });
    load();
  }

  async function agregarItem(congresoId: string) {
    const text = newItemText[congresoId];
    if (!text?.trim()) return;
    await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ congreso_id: congresoId, item: text }),
    });
    setNewItemText((s) => ({ ...s, [congresoId]: '' }));
    load();
  }

  async function borrarCongreso(id: string) {
    await fetch(`/api/congresos/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-2">
        <h1 className="text-lg sm:text-xl font-medium">Congresos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f15922] text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-md hover:opacity-90 whitespace-nowrap"
        >
          + Nuevo congreso
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-col gap-3">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del congreso"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'propio' | 'tercero')}
              className="border border-gray-300 rounded-md px-2 py-2 text-sm"
            >
              <option value="tercero">De un tercero</option>
              <option value="propio">Nuestro</option>
            </select>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-2 text-sm"
            />
          </div>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Notas (regalos, donaciones, contactos, etc.)"
            rows={2}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          {tipo === 'propio' && (
            <p className="text-xs text-gray-500">
              Se va a crear con checklist predeterminada: Stand, Documentos, Pagos, Promos, Logística.
            </p>
          )}
          <button
            onClick={crear}
            className="bg-[#f15922] text-white text-sm font-medium px-4 py-2 rounded-md self-start"
          >
            Guardar congreso
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : congresos.length === 0 ? (
        <p className="text-sm text-gray-500">No hay congresos cargados todavía.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {congresos.map((c) => {
            const done = c.checklist.filter((i) => i.done).length;
            const total = c.checklist.length;
            return (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{c.nombre}</div>
                    <div className="text-xs text-gray-500">
                      {c.tipo === 'propio' ? 'Nuestro' : 'De un tercero'}
                      {c.fecha ? ` · ${c.fecha}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {total > 0 && (
                      <span className="text-xs bg-green-100 text-green-800 rounded-md px-2 py-1">
                        {done}/{total} listo
                      </span>
                    )}
                    <button
                      onClick={() => borrarCongreso(c.id)}
                      className="text-xs text-gray-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {c.notas && <p className="text-xs text-gray-600 mb-2 whitespace-pre-wrap">{c.notas}</p>}

                {c.checklist.length > 0 && (
                  <div className="flex flex-col gap-1 mb-2">
                    {c.checklist.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id, item.done)} />
                        <span className={item.done ? 'line-through text-gray-400' : ''}>{item.item}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    value={newItemText[c.id] || ''}
                    onChange={(e) => setNewItemText((s) => ({ ...s, [c.id]: e.target.value }))}
                    placeholder="Agregar ítem a la checklist"
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs flex-1"
                  />
                  <button
                    onClick={() => agregarItem(c.id)}
                    className="text-xs border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
