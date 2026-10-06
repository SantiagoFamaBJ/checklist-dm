'use client';

import { useEffect, useState } from 'react';

const KEY = 'cdm_admin_auth';

export function useAdminAuth() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuthed(localStorage.getItem(KEY) === 'true');
    setChecked(true);
  }, []);

  async function login(pass: string) {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass.trim() }),
    });
    if (res.ok) {
      localStorage.setItem(KEY, 'true');
      setAuthed(true);
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem(KEY);
    setAuthed(false);
  }

  return { authed, checked, login, logout };
}
