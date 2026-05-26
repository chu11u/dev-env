"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";

/**
 * Displays the site logo. Falls back to text if the image is missing.
 *
 * Logo files:
 *   public/assets/logo/logo.png          — default (light bg)
 *   public/assets/logo/logo-dark.png    — dark variant (dark bg)
 *
 * Both default to `logo.png` if the dark variant is missing.
 */
export function Logo({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  const src = dark ? "/assets/logo/logo-dark.png" : "/assets/logo/logo.png";

  if (imgError) {
    return (
      <a
        href="/"
        className={`font-heading text-xl font-semibold text-charcoal-800 hover:opacity-80 transition-opacity ${className}`}
        aria-label="Sarit Elkayam - Home"
      >
        {t.siteNameFull}
      </a>
    );
  }

  return (
    <a
      href="/"
      className={`flex items-center ${className}`}
      aria-label="Sarit Elkayam - Home"
    >
      <Image
        src={src}
        alt={t.siteNameFull}
        width={240}
        height={60}
        className="h-12 w-auto"
        priority
        onError={() => setImgError(true)}
      />
    </a>
  );
}
