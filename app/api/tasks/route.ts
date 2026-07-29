import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('cdm_tasks')
    .select('*')
    .order('postponed_indefinite', { ascending: true })
    .order('due_date', { ascending: true })
    .order('priority', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase
    .from('cdm_tasks')
    .insert({
      title: body.title,
      description: body.description || null,
      category: body.category,
      due_date: body.due_date,
      priority: body.priority ?? 5,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
