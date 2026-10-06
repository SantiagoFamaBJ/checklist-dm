import { NextResponse } from 'next/server';

// La clave vive solo en el servidor (variable ADMIN_PASSWORD en Vercel, sin NEXT_PUBLIC_).
const PASSWORD = process.env.ADMIN_PASSWORD || 'dm2026';

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  const ok = typeof password === 'string' && password === PASSWORD;
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
