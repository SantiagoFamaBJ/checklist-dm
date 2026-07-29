'use client';

import { useEffect, useMemo, useState } from 'react';
import { Task } from '@/lib/types';
import TaskForm from './task-form';
import TaskRow from './task-row';
import CongresosSection from './congresos-section';

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
  const vencidas = pendientes.filter((t) => t.due_date && t.due_date < today && !t.postponed_indefinite);
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

  // Al crear una tarea, limpiamos los filtros para que siempre se vea la recién creada.
  async function handleCreated() {
    setShowForm(false);
    setCategoryFilter('Todas');
    setSearch('');
    load();
  }

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
      <div className="flex items-center justify-between mb-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Agenda</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f15922] text-white text-xs sm:text-sm font-medium px-3.5 sm:px-4 py-2 rounded-full shadow-sm hover:bg-[#d9481a] transition-colors whitespace-nowrap"
        >
          + Nueva tarea
        </button>
      </div>

      {showForm && <TaskForm categorias={categorias} onCreated={handleCreated} />}

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Completadas hoy</div>
          <div className="text-xl sm:text-2xl font-semibold mt-0.5">{completadasHoy.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Pendientes hoy</div>
          <div className="text-xl sm:text-2xl font-semibold mt-0.5">{deHoy.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Vencidas</div>
          <div className="text-xl sm:text-2xl font-semibold mt-0.5 text-red-500">{vencidas.length}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:items-center">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tarea..."
            className="w-full border border-gray-200 rounded-full pl-4 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15922]/30 focus:border-[#f15922]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15922]/30"
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
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          {categoryFilter !== 'Todas' || search
            ? 'No hay tareas pendientes con este filtro.'
            : 'No tenés tareas pendientes. Creá una con el botón de arriba.'}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map((t) => (
            <TaskRow key={t.id} task={t} today={today} onAction={handleAction} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {completadasHoy.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Completadas hoy</h2>
          <div className="flex flex-col gap-2">
            {completadasHoy.map((t) => (
              <TaskRow key={t.id} task={t} today={today} onAction={handleAction} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      <CongresosSection />
    </div>
  );
}
