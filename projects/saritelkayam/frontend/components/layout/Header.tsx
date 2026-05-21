"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <header
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cream-200"
      role="banner"
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            className="font-heading text-xl font-semibold text-charcoal-800 hover:text-rose-400 transition-colors"
            aria-label="Sarit Elkayam - Home"
          >
            Sarit Elkayam
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8" role="menubar">
            {navLinks.map((link) => (
              <li key={link.label} role="menuitem">
                <a
                  href={link.href}
                  className="font-body text-sm text-charcoal-600 hover:text-rose-400 transition-colors p-3"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-3 text-charcoal-600 hover:text-rose-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
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
                  <li key={link.label} role="menuitem">
                    <a
                      href={link.href}
                      className="block py-3 px-4 font-body text-sm text-charcoal-600 hover:text-rose-400 transition-colors min-h-[44px] flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

export default Header;
