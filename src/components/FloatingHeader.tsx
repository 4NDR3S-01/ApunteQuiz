'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Menu,
  X,
  Settings,
  BookOpen,
  Sparkles,
  HelpCircle,
  Mail,
  LayoutDashboard,
  ClipboardList,
  MessageCircleQuestion,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  ArrowUpRight,
  Headset,
  Search,
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/components/LanguageProvider';
import { useT } from '@/i18n';

// -----------------------
// Tipos
// -----------------------
type NavigationSubItem = {
  id: string;
  href: string;
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
};

type NavigationItem = {
  id: string;
  href: string;
  icon: LucideIcon;
  labelKey: string;
  submenu?: NavigationSubItem[];
};

// -----------------------
// Datos estáticos
// -----------------------
const navigation: NavigationItem[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    href: '/',
    icon: BookOpen,
    submenu: [
      {
        id: 'overview',
        href: '/#resumen',
        titleKey: 'header.nav.home.overview.title',
        descriptionKey: 'header.nav.home.overview.description',
        icon: LayoutDashboard,
      },
      {
        id: 'features',
        href: '/#features',
        titleKey: 'header.nav.home.features.title',
        descriptionKey: 'header.nav.home.features.description',
        icon: Sparkles,
      },
      {
        id: 'how',
        href: '/#como-funciona',
        titleKey: 'header.nav.home.how.title',
        descriptionKey: 'header.nav.home.how.description',
        icon: ClipboardList,
      },
    ],
  },
  {
    id: 'faq',
    labelKey: 'nav.faq',
    href: '/faq',
    icon: HelpCircle,
    submenu: [
      {
        id: 'overview',
        href: '/faq',
        titleKey: 'header.nav.faq.overview.title',
        descriptionKey: 'header.nav.faq.overview.description',
        icon: HelpCircle,
      },
      {
        id: 'generales',
        href: '/faq#generales',
        titleKey: 'header.nav.faq.generales.title',
        descriptionKey: 'header.nav.faq.generales.description',
        icon: MessageCircleQuestion,
      },
      {
        id: 'account',
        href: '/faq#cuenta',
        titleKey: 'header.nav.faq.account.title',
        descriptionKey: 'header.nav.faq.account.description',
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: 'contact',
    labelKey: 'nav.contact',
    href: '/contacto',
    icon: Mail,
    submenu: [
      {
        id: 'overview',
        href: '/contacto',
        titleKey: 'header.nav.contact.overview.title',
        descriptionKey: 'header.nav.contact.overview.description',
        icon: Mail,
      },
      {
        id: 'support',
        href: '/contacto#soporte',
        titleKey: 'header.nav.contact.support.title',
        descriptionKey: 'header.nav.contact.support.description',
        icon: Headset,
      },
      {
        id: 'training',
        href: '/contacto#capacitacion',
        titleKey: 'header.nav.contact.training.title',
        descriptionKey: 'header.nav.contact.training.description',
        icon: GraduationCap,
      },
    ],
  },
];

// -----------------------
// Utilidades puras (sin estado)
// -----------------------
const normalizeHref = (href: string) => {
  if (!href) return '/';
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  if (href === '#' || href.startsWith('#')) return '/';
  const [base] = href.split('#');
  return base || '/';
};

const isItemActive = (item: NavigationItem, pathname: string) => {
  const base = normalizeHref(item.href);
  if (base === '/') return pathname === '/';
  return pathname === base;
};

const isParentActive = (item: NavigationItem, pathname: string) => {
  if (isItemActive(item, pathname)) return true;
  return (
    item.submenu?.some((subItem) => {
      const normalizedSub = normalizeHref(subItem.href);
      if (normalizedSub === '/') return pathname === '/';
      return pathname === normalizedSub;
    }) ?? false
  );
};

// -----------------------
// Componente
// -----------------------
export default function FloatingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<string | null>(null);
  const [openMobileMenus, setOpenMobileMenus] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const closeMenuTimeoutRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();

  // ----- Efectos -----
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  // Language is handled globally by LanguageProvider; FloatingHeader consumes it via useLanguage

  useEffect(() => {
    return () => {
      if (closeMenuTimeoutRef.current) window.clearTimeout(closeMenuTimeoutRef.current);
    };
  }, []);

  // Keyboard shortcuts: '/' focuses search, Alt+1/2/3 focus nav items, Esc closes menus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // don't hijack when typing in inputs
      const active = document.activeElement as HTMLElement | null;
      const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      if ((e.key === '/' || e.key === '?') && !isTyping) {
        e.preventDefault();
        // focus the first visible search input (desktop or mobile)
        const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="search"]'));
        const visible = inputs.find((i) => i.offsetParent !== null && i.getBoundingClientRect().width > 0) ?? inputs[0];
        visible?.focus();
        return;
      }

      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setActiveDesktopMenu(null);
        (document.activeElement as HTMLElement | null)?.blur();
        return;
      }

      if (e.altKey && !isTyping) {
        const idx = { '1': 0, '2': 1, '3': 2 }[e.key as keyof Record<string, number>];
        if (typeof idx === 'number') {
          const navItem = navigation[idx];
          if (navItem) {
            const el = document.querySelector(`[data-nav="${navItem.id}"]`) as HTMLElement | null;
            if (el) {
              el.focus();
              if (navItem.submenu) setActiveDesktopMenu(navItem.id);
            }
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveDesktopMenu]);

  // ----- Helpers con estado -----
  const cancelCloseDesktopMenu = () => {
    if (closeMenuTimeoutRef.current) {
      window.clearTimeout(closeMenuTimeoutRef.current);
      closeMenuTimeoutRef.current = null;
    }
  };

  const scheduleCloseDesktopMenu = () => {
    cancelCloseDesktopMenu();
    closeMenuTimeoutRef.current = window.setTimeout(() => {
      setActiveDesktopMenu(null);
      closeMenuTimeoutRef.current = null;
    }, 120);
  };

  const closeDesktopMenu = () => {
    cancelCloseDesktopMenu();
    setActiveDesktopMenu(null);
  };

  const toggleMobileSection = (sectionId: string) => {
    setOpenMobileMenus((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  useEffect(() => {
    if (!isMobileMenuOpen) setOpenMobileMenus({});
  }, [isMobileMenuOpen]);

  // ----- Derivados (dependen de estado) -----
  const activePageName =
    navigation.find((item) => isParentActive(item, pathname))?.id ?? 'home';
  const searchPlaceholder = t('header.searchPlaceholder');
  const currentPageLabel = t('nav.home');

  useEffect(() => {
    const query = searchParams?.get('query') ?? '';
    setSearchTerm(query);
  }, [searchParams]);

  // ----- Handlers -----
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    if (trimmed) {
      router.push(`/faq?query=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/faq');
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // -----------------------
  // Render
  // -----------------------
  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50'
            : 'py-5 bg-transparent'
        }`}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label={t('header.primaryNavAria') as string}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <Link
              href="/"
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
                const hasSubmenu = Boolean(item.submenu?.length);
                const isActive = activeDesktopMenu === item.id;
                const parentActive = isParentActive(item, pathname);
                const iconClasses = `h-4 w-4 transition-transform group-hover:scale-110 ${
                  parentActive ? 'text-blue-600' : ''
                }`;
                const underlineClasses = `absolute bottom-0 left-1/2 h-0.5 ${
                  parentActive ? 'w-3/4' : 'w-0'
                } -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all`;
                return (
                  <div
                    key={item.id}
                    className="relative"
                    data-nav-wrapper={item.id}
                    onMouseEnter={() => {
                      if (hasSubmenu) {
                        cancelCloseDesktopMenu();
                        setActiveDesktopMenu(item.id);
                      }
                    }}
                    onMouseLeave={() => {
                      if (hasSubmenu) scheduleCloseDesktopMenu();
                    }}
                    onFocus={() => {
                      if (hasSubmenu) {
                        cancelCloseDesktopMenu();
                        setActiveDesktopMenu(item.id);
                      }
                    }}
                    onBlur={(event) => {
                      if (
                        hasSubmenu &&
                        !event.currentTarget.contains((event.relatedTarget as Node) ?? null)
                      ) {
                        scheduleCloseDesktopMenu();
                      }
                    }}
                  >
                    {hasSubmenu ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          cancelCloseDesktopMenu();
                          setActiveDesktopMenu((current) =>
                            current === item.id ? null : item.id,
                          );
                        }}
                        className={`group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-[color:var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                          parentActive ? 'text-blue-600' : 'text-[color:var(--text-muted)]'
                        }`}
                        data-nav={item.id}
                        aria-expanded={isActive}
                        aria-haspopup="true"
                        aria-current={parentActive ? 'page' : undefined}
                      >
                        <Icon className={iconClasses} aria-hidden="true" />
                        <span>{t(item.labelKey)}</span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            isActive
                              ? 'rotate-180 text-blue-600'
                              : 'text-[color:var(--text-muted)] group-hover:text-[color:var(--foreground)]'
                          }`}
                          aria-hidden="true"
                        />
                        <span className={underlineClasses} />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        data-nav={item.id}
                        className={`group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-[color:var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                          parentActive ? 'text-blue-600' : 'text-[color:var(--text-muted)]'
                        }`}
                        aria-current={parentActive ? 'page' : undefined}
                      >
                        <Icon className={iconClasses} aria-hidden="true" />
                        <span>{t(item.labelKey)}</span>
                        <span className={underlineClasses} />
                      </Link>
                    )}
                    {hasSubmenu ? (
                      <div
                        className={`absolute left-0 top-full mt-3 w-80 rounded-2xl border border-[color:var(--border-default)] bg-white dark:bg-slate-900 p-4 shadow-xl shadow-slate-200/30 transition ${
                          isActive
                            ? 'pointer-events-auto translate-y-0 opacity-100'
                            : 'pointer-events-none -translate-y-2 opacity-0'
                        }`}
                        onMouseEnter={cancelCloseDesktopMenu}
                        onMouseLeave={scheduleCloseDesktopMenu}
                      >
                        <div className="space-y-2">
                          {item.submenu?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const computeSubActive = (href: string) => {
                              const normalized = normalizeHref(href);
                              if (normalized !== pathname) return false;
                              if (href.includes('#')) {
                                if (typeof window === 'undefined') return false;
                                const currentHash = window.location.hash.replace('#', '');
                                const targetHash = href.split('#')[1] ?? '';
                                return targetHash === currentHash;
                              }
                              return true;
                            };
                            const subActive = computeSubActive(subItem.href);
                            const subIconClasses = `h-4 w-4 ${subActive ? 'text-blue-600' : ''}`;
                            return (
                              <Link
                                key={subItem.id}
                                href={subItem.href}
                                onClick={closeDesktopMenu}
                                className={`group/sub flex items-start gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-blue-500/10 hover:text-[color:var(--foreground)] focus:bg-blue-500/10 focus:text-[color:var(--foreground)] focus:outline-none ${
                                  subActive ? 'bg-blue-500/10 text-blue-700' : 'text-[color:var(--text-muted)]'
                                }`}
                                aria-current={subActive ? 'page' : undefined}
                              >
                                <span
                                  className={`mt-1 flex h-8 w-8 items-center justify-center rounded-lg ${
                                    subActive
                                      ? 'bg-blue-500/15 text-blue-600'
                                      : 'bg-[color:var(--surface-muted)] text-blue-600'
                                  }`}
                                >
                                  <SubIcon className={subIconClasses} aria-hidden="true" />
                                </span>
                                <span className="flex-1 space-y-1">
                                  <span className="block text-sm font-semibold text-[color:var(--foreground)]">
                                    {t(subItem.titleKey)}
                                  </span>
                                  <span className="block text-xs text-[color:var(--text-muted)]">
                                    {t(subItem.descriptionKey)}
                                  </span>
                                </span>
                                <ArrowUpRight
                                  className="mt-1 h-4 w-4 text-blue-500 transition group-hover/sub:translate-x-0.5"
                                  aria-hidden="true"
                                />
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* CTA Button - Desktop */}
            <div className="hidden items-center gap-3 md:flex">
              <LanguageSwitcher value={language} onChange={setLanguage} className="min-w-[14rem]" />
              <Link
                href="/login"
                className="rounded-lg border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition-all hover:bg-[color:var(--surface-muted)]"
              >
                {t('header.login')}
              </Link>
              <Link
                href="/register"
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {t('header.register')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface-muted)] md:hidden"
              aria-label={t(isMobileMenuOpen ? 'header.closeMenu' : 'header.openMenu') as string}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
            <div className="hidden w-full max-w-xl flex-col gap-2 md:flex md:items-end">
              <form
                onSubmit={handleSearchSubmit}
                className="relative w-full"
                role="search"
                aria-label={t('header.searchAria') as string}
              >
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input
                  type="search"
                  name="global-search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] py-3 pl-11 pr-4 text-sm text-[color:var(--foreground)] shadow-sm shadow-slate-200/40 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </form>
            </div>
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
              href="/"
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
              aria-label={t('header.closeMenu') as string}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Menu Navigation */}
          <nav
            className="flex-1 overflow-y-auto p-6 space-y-5"
            aria-label={t('header.mobileNavAria') as string}
          >
            <div className="flex justify-center">
              <LanguageSwitcher value={language} onChange={setLanguage} className="w-full" fullWidth />
            </div>
            <form
              onSubmit={handleSearchSubmit}
              className="relative"
              role="search"
              aria-label={t('header.searchAria') as string}
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
              <input
                type="search"
                name="global-search-mobile"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] py-3 pl-11 pr-4 text-sm text-[color:var(--foreground)] shadow-sm shadow-slate-200/40 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </form>
            <ul className="space-y-3">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const hasSubmenu = Boolean(item.submenu?.length);
                const isOpen = Boolean(openMobileMenus[item.id]);
                const parentActive = isParentActive(item, pathname);
                const iconWrapperClasses = `flex h-10 w-10 items-center justify-center rounded-lg ${
                  parentActive
                    ? 'bg-blue-500/15 text-blue-600'
                    : 'bg-[color:var(--surface-muted)] text-[color:var(--foreground)]'
                }`;
                const iconClasses = `h-5 w-5 ${parentActive ? 'text-blue-600' : ''}`;
                return (
                  <li
                    key={item.id}
                    style={{
                      animation: isMobileMenuOpen
                        ? `slideInRight 0.3s ease-out ${index * 0.05}s both`
                        : 'none',
                    }}
                  >
                    {hasSubmenu ? (
                      <div className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)] shadow-sm shadow-slate-200/20 dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => toggleMobileSection(item.id)}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-base font-semibold ${
                            parentActive ? 'text-blue-600' : 'text-[color:var(--foreground)]'
                          }`}
                          aria-expanded={isOpen}
                          aria-current={parentActive ? 'page' : undefined}
                        >
                            <span className="flex items-center gap-3">
                            <span className={iconWrapperClasses}>
                              <Icon className={iconClasses} aria-hidden="true" />
                            </span>
                            {t(item.labelKey)}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isOpen ? 'rotate-180 text-blue-500' : 'text-[color:var(--text-muted)]'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                        {isOpen ? (
                          <div className="space-y-2 border-t border-[color:var(--border-default)] px-4 py-4">
                            {item.submenu?.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const subActive =
                                normalizeHref(subItem.href) === pathname &&
                                !subItem.href.includes('#');
                              return (
                                <Link
                                  key={subItem.id}
                                  href={subItem.href}
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setOpenMobileMenus({});
                                  }}
                                  className={`flex items-start gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-[color:var(--foreground)] ${
                                    subActive ? 'bg-blue-500/10 text-blue-700' : 'text-[color:var(--text-muted)]'
                                  }`}
                                  aria-current={subActive ? 'page' : undefined}
                                >
                                  <span
                                    className={`mt-1 flex h-8 w-8 items-center justify-center rounded-lg ${
                                      subActive
                                        ? 'bg-blue-500/15 text-blue-600'
                                        : 'bg-[color:var(--surface-muted)] text-blue-600'
                                    }`}
                                  >
                                    <SubIcon className={`h-4 w-4 ${subActive ? 'text-blue-600' : ''}`} aria-hidden="true" />
                                  </span>
                                  <span className="flex-1 space-y-1">
                                    <span className="block text-sm font-semibold text-[color:var(--foreground)]">
                                      {t(subItem.titleKey)}
                                    </span>
                                    <span className="block text-xs text-[color:var(--text-muted)]">
                                      {t(subItem.descriptionKey)}
                                    </span>
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center gap-3 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-elevated)]/90 px-4 py-3 text-base font-semibold transition hover:bg-blue-500/10 ${
                          parentActive ? 'text-blue-600' : 'text-[color:var(--foreground)]'
                        }`}
                        aria-current={parentActive ? 'page' : undefined}
                      >
                        <span
                          className={`${iconWrapperClasses} transition group-hover:bg-blue-500/10 group-hover:text-blue-600`}
                        >
                          <Icon className={iconClasses} aria-hidden="true" />
                        </span>
                        {t(item.labelKey)}
                      </Link>
                    )}
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
              {t('header.login')}
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/40"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              {t('header.register')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
