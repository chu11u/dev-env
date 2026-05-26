"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslation, type Translations } from "@/lib/i18n";

type NavLabelKey = keyof Pick<
  Translations,
  | "navHome"
  | "navServices"
  | "navTestimonials"
  | "navBlog"
  | "navShop"
  | "navBook"
  | "navContact"
>;

const navLinks = [
  { labelKey: "navHome" as NavLabelKey, href: "/" },
  { labelKey: "navServices" as NavLabelKey, href: "/services" },
  { labelKey: "navTestimonials" as NavLabelKey, href: "/testimonials" },
  { labelKey: "navBlog" as NavLabelKey, href: "/blog" },
  { labelKey: "navShop" as NavLabelKey, href: "/shop" },
  { labelKey: "navBook" as NavLabelKey, href: "/book" },
  { labelKey: "navContact" as NavLabelKey, href: "/contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, locale, setLocale, isRtl } = useTranslation();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <header
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cream-200"
      role="banner"
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label={isRtl ? "ניווט ראשי" : "Main navigation"}
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            className="font-heading text-xl font-semibold text-charcoal-800 hover:text-rose-400 transition-colors"
            aria-label={
              isRtl ? "שרית אלקיים - דף הבית" : "Sarit Elkayam - Home"
            }
          >
            {t.siteNameFull}
          </a>

          {/* Desktop nav + lang toggle */}
          <ul className="hidden md:flex items-center gap-8" role="menubar">
            {navLinks.map((link) => (
              <li key={link.href} role="menuitem">
                <a
                  href={link.href}
                  className="font-body text-sm text-charcoal-600 hover:text-rose-400 transition-colors p-3"
                >
                  {t[link.labelKey]}
                </a>
              </li>
            ))}

            {/* Language toggle */}
            <li role="menuitem">
              <button
                onClick={() => setLocale(locale === "he" ? "en" : "he")}
                className="font-body text-sm text-charcoal-600 hover:text-rose-400 transition-colors p-3 border border-cream-200 rounded-full px-3 py-1"
                aria-label="Toggle language"
              >
                {locale === "he" ? "English" : "עברית"}
              </button>
            </li>
          </ul>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-3 text-charcoal-600 hover:text-rose-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? t.closeMenu : t.openMenu}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              className="md:hidden border-t border-cream-200"
              role="menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <ul className="flex flex-col gap-1 pt-3 pb-4">
                {navLinks.map((link) => (
                  <li key={link.href} role="menuitem">
                    <a
                      href={link.href}
                      className="block py-3 px-4 font-body text-sm text-charcoal-600 hover:text-rose-400 transition-colors min-h-[44px] flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      {t[link.labelKey]}
                    </a>
                  </li>
                ))}

                {/* Mobile lang toggle */}
                <li role="menuitem">
                  <button
                    onClick={() => setLocale(locale === "he" ? "en" : "he")}
                    className="block py-3 px-4 font-body text-sm text-charcoal-600 hover:text-rose-400 transition-colors min-h-[44px] flex items-center"
                  >
                    {locale === "he" ? "English" : "עברית"}
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

export default Header;
