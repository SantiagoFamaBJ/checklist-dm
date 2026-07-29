'use client';

import { useEffect, useState } from 'react';

const KEY = 'cdm_admin_auth';
const PASSWORD = 'DM2026';

export function useAdminAuth() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuthed(localStorage.getItem(KEY) === 'true');
    setChecked(true);
  }, []);

  function login(pass: string) {
    if (pass === PASSWORD) {
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
