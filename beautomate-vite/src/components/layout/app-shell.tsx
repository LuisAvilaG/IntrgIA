'use client';
import { Link, useLocation } from 'react-router-dom'; // CORREGIDO
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/user-nav';
import BeAutomateLogo from '@/components/beautomate-logo';
import { Home, Settings, Users } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            to="/" // CORREGIDO
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <BeAutomateLogo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">BeAutomate</span>
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href} // CORREGIDO
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                pathname === item.href && 'text-primary bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="ml-auto flex items-center gap-2">
            <UserNav />
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
