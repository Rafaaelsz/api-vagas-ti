'use client';

import { BriefcaseBusiness, Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/', label: 'Início' },
  { href: '/vagas', label: 'Vagas' },
  { href: '/empresas', label: 'Empresas' },
  { href: '/estatisticas', label: 'Estatísticas' },
  { href: '/sobre', label: 'Sobre' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-fit items-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <BriefcaseBusiness className="size-5" aria-hidden />
          </span>
          <span>Vagas TI</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground',
                pathname === item.href && 'bg-muted text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action="/vagas" className="ml-auto hidden w-full max-w-xs items-center gap-2 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input name="search" placeholder="Buscar vagas" className="h-9 pl-9" />
          </div>
        </form>

        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        <Button type="button" variant="outline" size="icon" className="ml-auto md:ml-0 lg:hidden" onClick={() => setIsOpen(true)} aria-label="Abrir menu">
          <Menu className="size-5" aria-hidden />
        </Button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setIsOpen(false)}>
              <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
                <BriefcaseBusiness className="size-5" aria-hidden />
              </span>
              <span>Vagas TI</span>
            </Link>
            <Button type="button" variant="outline" size="icon" onClick={() => setIsOpen(false)} aria-label="Fechar menu">
              <X className="size-5" aria-hidden />
            </Button>
          </div>

          <div className="space-y-5 p-4">
            <form action="/vagas" className="relative" onSubmit={() => setIsOpen(false)}>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input name="search" placeholder="Buscar vagas" className="pl-9" />
            </form>

            <nav className="grid gap-1" aria-label="Navegação mobile">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground',
                    pathname === item.href && 'bg-muted text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <ThemeToggle />
          </div>
        </div>
      ) : null}
    </header>
  );
}
