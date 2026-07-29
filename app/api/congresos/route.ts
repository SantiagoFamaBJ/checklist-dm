import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CHECKLIST_DEFAULT } from '@/lib/types';

export async function GET() {
  const { data: congresos, error } = await supabase
    .from('cdm_congresos')
    .select('*')
    .order('fecha_inicio', { ascending: true, nullsFirst: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: items } = await supabase
    .from('cdm_congreso_checklist')
    .select('*')
    .order('orden');

  const result = congresos.map((c) => ({
    ...c,
    checklist: (items || []).filter((i) => i.congreso_id === c.id),
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data: congreso, error } = await supabase
    .from('cdm_congresos')
    .insert({
      nombre: body.nombre,
      tipo: body.tipo,
      fecha_inicio: body.fecha_inicio || null,
      fecha_fin: body.fecha_fin || null,
      notas: body.notas || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.tipo === 'propio') {
    const rows = CHECKLIST_DEFAULT.map((item, i) => ({
      congreso_id: congreso.id,
      item,
      orden: i,
    }));
    await supabase.from('cdm_congreso_checklist').insert(rows);
  }

  return NextResponse.json(congreso);
}
