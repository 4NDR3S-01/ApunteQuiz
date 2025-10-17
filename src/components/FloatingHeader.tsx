'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, Sparkles, HelpCircle, Mail } from 'lucide-react';

const navigation = [
  { name: 'Inicio', href: '#', icon: BookOpen },
  { name: 'Características', href: '#features', icon: Sparkles },
  { name: 'Cómo funciona', href: '#como-funciona', icon: Sparkles },
  { name: 'FAQ', href: '#faq', icon: HelpCircle },
  { name: 'Contacto', href: 'mailto:ac20102003@gmail.com', icon: Mail },
];

export default function FloatingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50'
            : 'py-5 bg-transparent'
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="#" 
              className="group flex items-center gap-2 text-xl font-bold text-[color:var(--foreground)] transition-transform hover:scale-105"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30 transition-all group-hover:shadow-xl group-hover:shadow-blue-500/40">
                <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
                ApunteQuiz
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 md:flex">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--foreground)]"
                  >
                    <Icon className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
                    <span>{item.name}</span>
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all group-hover:w-3/4" />
                  </Link>
                );
              })}
            </div>

            {/* CTA Button - Desktop */}
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="rounded-lg border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition-all hover:bg-[color:var(--surface-muted)]"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Registrarse
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface-muted)] md:hidden"
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm transform border-l border-[color:var(--border-default)] bg-[color:var(--background)] shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between border-b border-[color:var(--border-default)] p-6">
            <Link 
              href="#" 
              className="flex items-center gap-2 text-xl font-bold text-[color:var(--foreground)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
                ApunteQuiz
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]"
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Menu Navigation */}
          <nav className="flex-1 overflow-y-auto p-6" aria-label="Navegación móvil">
            <ul className="space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.name}
                    style={{
                      animation: isMobileMenuOpen
                        ? `slideInRight 0.3s ease-out ${index * 0.05}s both`
                        : 'none',
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center gap-3 rounded-xl border border-transparent p-4 text-base font-medium text-[color:var(--text-muted)] transition-all hover:border-[color:var(--border-default)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--foreground)]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--surface-muted)] transition-colors group-hover:bg-blue-500/10">
                        <Icon className="h-5 w-5 transition-colors group-hover:text-blue-500" aria-hidden="true" />
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="border-t border-[color:var(--border-default)] p-6 space-y-3">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] px-6 py-3 text-base font-medium text-[color:var(--foreground)] transition-all hover:bg-[color:var(--surface-muted)]"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/40"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              Registrarse gratis
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
