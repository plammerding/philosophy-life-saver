'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Home, Bell, Bot } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { href: '/',            label: 'Heute',        icon: LayoutDashboard },
  { href: '/haushalt',    label: 'Haushalt',     icon: Home },
  { href: '/erinnerungen',label: 'Erinnern',     icon: Bell },
  { href: '/assistent',   label: 'Assistent',    icon: Bot },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-2xl mx-auto flex">
        {links.map(({ href, label, icon: Icon }) => {
          const aktiv = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                aktiv ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon size={22} strokeWidth={aktiv ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
