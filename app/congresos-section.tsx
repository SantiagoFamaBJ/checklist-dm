'use client';

import { useEffect, useState } from 'react';
import { Congreso, ChecklistItem } from '@/lib/types';

type CongresoConChecklist = Congreso & { checklist: ChecklistItem[] };

function rangoFechas(c: Congreso) {
  if (!c.fecha_inicio && !c.fecha_fin) return 'Sin fecha';
  if (c.fecha_inicio && c.fecha_fin && c.fecha_inicio !== c.fecha_fin) {
    return `${c.fecha_inicio} al ${c.fecha_fin}`;
  }
  return c.fecha_inicio || c.fecha_fin || 'Sin fecha';
}

export default function CongresosSection() {
  const [congresos, setCongresos] = useState<CongresoConChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'propio' | 'tercero'>('tercero');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
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
      body: JSON.stringify({
        nombre,
        tipo,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        notas,
      }),
    });
    setNombre('');
    setFechaInicio('');
    setFechaFin('');
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
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Congresos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-gray-700 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          + Nuevo congreso
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 mb-5 shadow-sm border border-gray-100 flex flex-col gap-3">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del congreso"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15922]/30"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'propio' | 'tercero')}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15922]/30"
          >
            <option value="tercero">De un tercero</option>
            <option value="propio">Nuestro</option>
          </select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 pl-0.5">Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15922]/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 pl-0.5">Finalización</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15922]/30"
              />
            </div>
          </div>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Notas (regalos, donaciones, contactos, etc.)"
            rows={2}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15922]/30"
          />
          {tipo === 'propio' && (
            <p className="text-xs text-gray-400">
              Se va a crear con checklist predeterminada: Stand, Documentos, Pagos, Promos, Logística.
            </p>
          )}
          <button
            onClick={crear}
            className="bg-[#f15922] text-white text-sm font-medium px-4 py-2 rounded-full self-start hover:bg-[#d9481a] transition-colors"
          >
            Guardar congreso
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : congresos.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No hay congresos cargados todavía.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {congresos.map((c) => {
            const done = c.checklist.filter((i) => i.done).length;
            const total = c.checklist.length;
            return (
              <div key={c.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{c.nombre}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {c.tipo === 'propio' ? 'Nuestro' : 'De un tercero'} · {rangoFechas(c)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {total > 0 && (
                      <span className="text-xs font-medium bg-green-50 text-green-700 rounded-full px-2.5 py-1">
                        {done}/{total} listo
                      </span>
                    )}
                    <button
                      onClick={() => borrarCongreso(c.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      aria-label="Eliminar congreso"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {c.notas && <p className="text-xs text-gray-500 mb-3 whitespace-pre-wrap">{c.notas}</p>}

                {c.checklist.length > 0 && (
                  <div className="flex flex-col gap-1.5 mb-3">
                    {c.checklist.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id, item.done)} />
                        <span className={item.done ? 'line-through text-gray-300' : 'text-gray-700'}>
                          {item.item}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    value={newItemText[c.id] || ''}
                    onChange={(e) => setNewItemText((s) => ({ ...s, [c.id]: e.target.value }))}
                    placeholder="Agregar ítem a la checklist"
                    className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-[#f15922]/30"
                  />
                  <button
                    onClick={() => agregarItem(c.id)}
                    className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors"
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
