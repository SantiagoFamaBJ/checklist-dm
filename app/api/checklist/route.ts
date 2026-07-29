import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase
    .from('cdm_congreso_checklist')
    .insert({ congreso_id: body.congreso_id, item: body.item, orden: body.orden ?? 99 })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
