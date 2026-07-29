import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = await req.json();
  const update: Record<string, unknown> = {};
  ['nombre', 'tipo', 'fecha_inicio', 'fecha_fin', 'notas'].forEach((k) => {
    if (body[k] !== undefined) update[k] = body[k];
  });

  const { data, error } = await supabase
    .from('cdm_congresos')
    .update(update)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { error } = await supabase.from('cdm_congresos').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
