'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Agenda' },
  { href: '/congresos', label: 'Congresos' },
  { href: '/admin', label: 'Admin' },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <span className="font-semibold text-[#f15922] text-base sm:text-lg tracking-tight">Checklist DM</span>
        <nav className="flex gap-1 bg-gray-100 p-1 rounded-full">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-[#f15922] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
