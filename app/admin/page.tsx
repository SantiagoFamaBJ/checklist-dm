'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/useAdminAuth';

type Categoria = { id: string; nombre: string };

export default function AdminPage() {
  const { authed, checked, login, logout } = useAdminAuth();
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nueva, setNueva] = useState('');

  async function load() {
    const res = await fetch('/api/categorias');
    setCategorias(await res.json());
  }

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  function submitLogin() {
    if (login(pass)) {
      setError(false);
    } else {
      setError(true);
    }
  }

  async function agregarCategoria() {
    if (!nueva.trim()) return;
    await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nueva }),
    });
    setNueva('');
    load();
  }

  async function borrarCategoria(id: string) {
    await fetch('/api/categorias', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (!checked) return null;

  if (!authed) {
    return (
      <div className="max-w-xs mx-auto mt-16 flex flex-col gap-3">
        <h1 className="text-lg font-medium text-center">Acceso admin</h1>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitLogin()}
          placeholder="Contraseña"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        {error && <p className="text-xs text-red-600">Contraseña incorrecta.</p>}
        <button
          onClick={submitLogin}
          className="bg-[#f15922] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          Ingresar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-medium">Admin</h1>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600">
          Cerrar sesión
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-medium mb-3">Categorías de tareas</h2>
        <div className="flex flex-col gap-1 mb-3">
          {categorias.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm border-b border-gray-100 py-1.5">
              <span>{c.nombre}</span>
              <button onClick={() => borrarCategoria(c.id)} className="text-xs text-gray-400 hover:text-red-600">
                Eliminar
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            placeholder="Nueva categoría"
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1"
          />
          <button
            onClick={agregarCategoria}
            className="bg-[#f15922] text-white text-sm font-medium px-3 py-1.5 rounded-md"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
