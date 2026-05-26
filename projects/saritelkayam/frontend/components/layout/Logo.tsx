"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";

/**
 * Displays the site logo. Falls back to text if no logo image is available.
 *
 * Drop files at:
 *   public/assets/logo/logo.svg         — light variant (for light backgrounds)
 *   public/assets/logo/logo-dark.svg   — dark variant (for dark backgrounds)
 *
 * If the image fails to load, shows `t.siteNameFull` as styled text instead.
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

  const src = dark ? "/assets/logo/logo-dark.svg" : "/assets/logo/logo.svg";

  if (imgError) {
    // Fallback to styled text
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
        width={160}
        height={40}
        className="h-10 w-auto"
        priority
        onError={() => setImgError(true)}
      />
    </a>
  );
}
