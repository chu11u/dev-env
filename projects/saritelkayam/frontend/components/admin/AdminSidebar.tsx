'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export function AdminSidebar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/admin';

  const navItems: NavItem[] = [
    { href: '/admin', label: t.adminDashboard, icon: '📊' },
    { href: '/admin/blog', label: t.adminBlog, icon: '📝' },
    { href: '/admin/testimonials', label: t.adminTestimonials, icon: '⭐' },
    { href: '/admin/products', label: t.adminProducts, icon: '🛍️' },
    { href: '/admin/services', label: t.adminServices, icon: '💆' },
    { href: '/admin/settings', label: t.adminSettings, icon: '⚙️' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return currentPath === '/admin';
    return currentPath.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin';
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 start-4 z-50 bg-white rounded-xl shadow-soft p-2.5 border border-cream-200"
        aria-label="Toggle menu"
      >
        <span className="text-xl">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 end-0 h-full w-64 bg-white border-e border-cream-200 z-50
          transform transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="p-6 border-b border-cream-200">
            <a
              href="/admin"
              className="font-heading text-lg font-bold text-charcoal-800 hover:text-rose-400 transition-colors"
            >
              {t.siteName}
            </a>
            <p className="font-body text-xs text-charcoal-400 mt-0.5">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-colors
                    ${active
                      ? 'bg-rose-50 text-rose-600 font-medium'
                      : 'text-charcoal-600 hover:bg-cream-50 hover:text-charcoal-800'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-cream-200 space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-rose-400 hover:bg-rose-50 transition-colors"
            >
              <span className="text-base">🌐</span>
              <span>{t.navHome}</span>
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-charcoal-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <span className="text-base">🚪</span>
              <span>{t.adminLogout}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
