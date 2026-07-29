export type Task = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  due_date: string | null;
  priority: number;
  status: 'pendiente' | 'completada';
  postponed_indefinite: boolean;
  completed_at: string | null;
  created_at: string;
};

export type Congreso = {
  id: string;
  nombre: string;
  tipo: 'propio' | 'tercero';
  fecha: string | null;
  notas: string | null;
  created_at: string;
};

export type ChecklistItem = {
  id: string;
  congreso_id: string;
  item: string;
  done: boolean;
  orden: number;
};

export const CHECKLIST_DEFAULT = ['Stand', 'Documentos', 'Pagos', 'Promos', 'Logística'];
