'use client';

import { Task } from '@/lib/types';

function priorityColor(p: number) {
  if (p >= 8) return 'bg-red-100 text-red-800';
  if (p >= 5) return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-600';
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
  const vencida = task.status === 'pendiente' && task.due_date < today && !task.postponed_indefinite;
  const completada = task.status === 'completada';

  return (
    <div
      className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 bg-white ${
        vencida ? 'border-red-300' : 'border-gray-200'
      } ${completada ? 'opacity-50' : ''}`}
    >
      <input
        type="checkbox"
        checked={completada}
        onChange={() => onAction(task.id, completada ? 'uncomplete' : 'complete')}
      />
      <span className={`text-xs font-medium rounded px-1.5 py-0.5 ${priorityColor(task.priority)}`}>
        P{task.priority}
      </span>
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${completada ? 'line-through' : ''}`}>{task.title}</div>
        <div className="text-xs text-gray-500 truncate">
          {task.postponed_indefinite ? 'Pospuesta indefinido' : task.due_date} · {task.category}
        </div>
      </div>
      {!completada && (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onAction(task.id, 'postpone_1day')}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50"
          >
            +1 día
          </button>
          <button
            onClick={() =>
              onAction(task.id, task.postponed_indefinite ? 'unpostpone_indefinite' : 'postpone_indefinite')
            }
            className="text-xs border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50"
          >
            {task.postponed_indefinite ? 'Reactivar' : 'Indefinido'}
          </button>
        </div>
      )}
      <button onClick={() => onDelete(task.id)} className="text-xs text-gray-400 hover:text-red-600 shrink-0">
        ✕
      </button>
    </div>
  );
}
