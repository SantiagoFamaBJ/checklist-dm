'use client';

import { Task } from '@/lib/types';

function priorityColor(p: number) {
  if (p >= 8) return 'bg-red-50 text-red-600';
  if (p >= 5) return 'bg-amber-50 text-amber-700';
  return 'bg-gray-100 text-gray-500';
}

export default function TaskRow({
  task,
  today,
  onAction,
  onDelete,
}: {
  task: Task;
  today: string;
  onAction: (id: string, action: string) => void;
  onDelete: (id: string) => void;
}) {
  const vencida = task.status === 'pendiente' && !!task.due_date && task.due_date < today && !task.postponed_indefinite;
  const completada = task.status === 'completada';

  let fechaLabel: string;
  if (task.postponed_indefinite) fechaLabel = 'Sin fecha (pospuesta)';
  else if (!task.due_date) fechaLabel = 'Sin fecha';
  else if (task.due_date === today) fechaLabel = 'Hoy';
  else fechaLabel = task.due_date;

  return (
    <div
      className={`flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 rounded-2xl px-3.5 py-3 bg-white shadow-sm border transition-opacity ${
        vencida ? 'border-red-200' : 'border-gray-100'
      } ${completada ? 'opacity-50' : ''}`}
    >
      <input
        type="checkbox"
        checked={completada}
        onChange={() => onAction(task.id, completada ? 'uncomplete' : 'complete')}
      />
      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${priorityColor(task.priority)}`}>
        P{task.priority}
      </span>
      <div className="flex-1 min-w-[140px]">
        <div className={`text-sm font-medium ${completada ? 'line-through' : ''}`}>{task.title}</div>
        <div className={`text-xs mt-0.5 ${vencida ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {fechaLabel} · {task.category}
        </div>
      </div>
      {!completada && (
        <div className="flex gap-1.5 shrink-0 w-full sm:w-auto justify-end order-3 sm:order-none">
          <button
            onClick={() => onAction(task.id, 'postpone_1day')}
            className="text-xs text-gray-500 border border-gray-200 rounded-full px-2.5 py-1 hover:bg-gray-50 transition-colors"
          >
            +1 día
          </button>
          <button
            onClick={() =>
              onAction(task.id, task.postponed_indefinite ? 'unpostpone_indefinite' : 'postpone_indefinite')
            }
            className="text-xs text-gray-500 border border-gray-200 rounded-full px-2.5 py-1 hover:bg-gray-50 transition-colors"
          >
            {task.postponed_indefinite ? 'Reactivar' : 'Indefinido'}
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-300 hover:text-red-500 shrink-0 px-1 transition-colors"
            aria-label="Eliminar tarea"
          >
            ✕
          </button>
        </div>
      )}
      {completada && (
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-500 shrink-0 transition-colors"
          aria-label="Eliminar tarea"
        >
          ✕
        </button>
      )}
    </div>
  );
}
