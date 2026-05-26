"use client";

import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Badge } from "@/components/ui/Badge";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Calendar, ExternalLink, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const EASYBIZY_URL = "https://schedule.easybizy.net/saritelkayam/welcome";

export default function BookPage() {
  const { t } = useTranslation();
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Timeout after 10s — if iframe hasn't loaded, show fallback
    timerRef.current = setTimeout(() => {
      if (!iframeReady) setIframeError(true);
    }, 10000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [iframeReady]);

  return (
    <FadeInSection>
      {/* Page header */}
      <section className="bg-cream-100 py-8 md:py-16">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="accent">{t.bookBadge}</Badge>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-800 mt-4 mb-4">
              {t.bookTitle}
            </h1>
            <SectionDivider className="mb-4" />
            <p className="font-body text-charcoal-500">{t.bookSubtitle}</p>
          </div>
        </Container>
      </section>

      {/* Embedded scheduler */}
      <section className="py-8 md:py-16 bg-white">
        <Container>
          <div className="relative w-full overflow-hidden rounded-2xl border border-cream-200 shadow-soft">
            {/* Loading overlay */}
            {!iframeReady && !iframeError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white min-h-[600px]">
                <Loader2
                  size={48}
                  className="text-rose-400 animate-spin mb-4"
                />
                <p className="font-body text-charcoal-500">{t.bookLoading}</p>
              </div>
            )}

            {/* Error/fallback overlay */}
            {iframeError && !iframeReady && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-cream-100 min-h-[600px] p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                  <Calendar size={28} className="text-rose-400" />
                </div>
                <p className="font-body text-lg text-charcoal-600 mb-2">
                  {t.bookErrorTitle}
                </p>
                <p className="font-body text-sm text-charcoal-500 mb-6">
                  {t.bookErrorMsg}
                </p>
                <a
                  href={EASYBIZY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-body text-sm text-rose-400 hover:text-rose-600 transition-colors"
                >
                  <ExternalLink size={16} />
                  {t.bookOpenExternal}
                </a>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={EASYBIZY_URL}
              title={t.bookTitle}
              className="w-full border-0"
              style={{ minHeight: "700px" }}
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              onLoad={() => setIframeReady(true)}
              onError={() => setIframeError(true)}
            />
          </div>
        </Container>
      </section>
    </FadeInSection>
  );
}
