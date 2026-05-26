"use client";

import { useState, useEffect } from "react";
import { Instagram, Facebook, Mail } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { getPublicSettings } from "@/lib/admin-api";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  const { t, locale } = useTranslation();

  // Fetch settings for dynamic contact info
  const [email, setEmail] = useState("hello@saritelkayam.com");
  const [instagramUrl, setInstagramUrl] = useState(
    "https://instagram.com/sarit.elkayam",
  );
  const [facebookUrl, setFacebookUrl] = useState(
    "https://facebook.com/sarit.elkayam",
  );

  useEffect(() => {
    getPublicSettings()
      .then((settings) => {
        const settingKey = (key: string) => settings.find((x) => x.key === key);
        setEmail(
          settingKey("email")?.valueHe ||
            settingKey("email")?.valueEn ||
            "hello@saritelkayam.com",
        );
        setInstagramUrl(
          settingKey("instagram")?.valueEn ||
            "https://instagram.com/sarit.elkayam",
        );
        setFacebookUrl(
          settingKey("facebook")?.valueEn ||
            "https://facebook.com/sarit.elkayam",
        );
      })
      .catch(() => {
        // Fall back to hardcoded defaults
      });
  }, []);

  return (
    <footer
      className="bg-charcoal-800 text-cream-100"
      role="contentinfo"
      lang={locale}
      dir={locale === "he" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-6">
          {/* Brand */}
          <Logo className="justify-start" dark />

          <p className="text-sm text-cream-200 text-center max-w-md">
            {t.tagline}
          </p>

          {/* Social links */}
          <div
            className="flex items-center gap-6"
            aria-label={
              locale === "he" ? "קישורי מדיה חברתית" : "Social media links"
            }
          >
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream-200 hover:text-rose-300 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream-200 hover:text-rose-300 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href={`mailto:${email}`}
              className="text-cream-200 hover:text-rose-300 transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-cream-300 pt-4 border-t border-charcoal-700 w-full text-center">
            {new Date().getFullYear()} {t.siteNameFull}. {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
