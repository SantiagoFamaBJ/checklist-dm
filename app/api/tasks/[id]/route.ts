import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = await req.json();

  const update: Record<string, unknown> = {};

  if (body.action === 'complete') {
    update.status = 'completada';
    update.completed_at = new Date().toISOString();
  } else if (body.action === 'uncomplete') {
    update.status = 'pendiente';
    update.completed_at = null;
  } else if (body.action === 'postpone_1day') {
    const { data: current } = await supabase
      .from('cdm_tasks')
      .select('due_date')
      .eq('id', params.id)
      .single();
    if (current) {
      const d = new Date(current.due_date);
      d.setDate(d.getDate() + 1);
      update.due_date = d.toISOString().split('T')[0];
      update.postponed_indefinite = false;
    }
  } else if (body.action === 'postpone_indefinite') {
    update.postponed_indefinite = true;
  } else if (body.action === 'unpostpone_indefinite') {
    update.postponed_indefinite = false;
  } else {
    // edición general (título, descripción, categoría, fecha, prioridad)
    ['title', 'description', 'category', 'due_date', 'priority'].forEach((k) => {
      if (body[k] !== undefined) update[k] = body[k];
    });
  }

  const { data, error } = await supabase
    .from('cdm_tasks')
    .update(update)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { error } = await supabase.from('cdm_tasks').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
