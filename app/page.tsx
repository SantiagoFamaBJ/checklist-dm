'use client';

import { useEffect, useMemo, useState } from 'react';
import { Task } from '@/lib/types';
import TaskForm from './task-form';
import TaskRow from './task-row';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function AgendaPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const [tRes, cRes] = await Promise.all([fetch('/api/tasks'), fetch('/api/categorias')]);
    setTasks(await tRes.json());
    const cats = await cRes.json();
    setCategorias(cats.map((c: { nombre: string }) => c.nombre));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const today = todayStr();

  const pendientes = tasks.filter((t) => t.status === 'pendiente');
  const completadasHoy = tasks.filter((t) => t.status === 'completada' && t.completed_at?.startsWith(today));
  const vencidas = pendientes.filter((t) => t.due_date < today && !t.postponed_indefinite);
  const deHoy = pendientes.filter((t) => t.due_date === today);

  const filtradas = useMemo(() => {
    return pendientes.filter((t) => {
      const matchCat = categoryFilter === 'Todas' || t.category === categoryFilter;
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [pendientes, categoryFilter, search]);

  async function handleAction(id: string, action: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-2">
        <h1 className="text-lg sm:text-xl font-medium">Agenda</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f15922] text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-md hover:opacity-90 whitespace-nowrap"
        >
          + Nueva tarea
        </button>
      </div>

      {showForm && (
        <TaskForm
          categorias={categorias}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs text-gray-500">Completadas hoy</div>
          <div className="text-lg sm:text-2xl font-medium">{completadasHoy.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs text-gray-500">Pendientes hoy</div>
          <div className="text-lg sm:text-2xl font-medium">{deHoy.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs text-gray-500">Vencidas</div>
          <div className="text-lg sm:text-2xl font-medium text-red-600">{vencidas.length}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tarea..."
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-[160px]"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
        >
          <option value="Todas">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : filtradas.length === 0 ? (
        <p className="text-sm text-gray-500">No hay tareas pendientes con este filtro.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map((t) => (
            <TaskRow key={t.id} task={t} today={today} onAction={handleAction} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {completadasHoy.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Completadas hoy</h2>
          <div className="flex flex-col gap-2">
            {completadasHoy.map((t) => (
              <TaskRow key={t.id} task={t} today={today} onAction={handleAction} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
