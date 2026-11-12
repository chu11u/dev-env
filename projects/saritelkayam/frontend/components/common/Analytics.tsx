"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const WEBSITE_ID =
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ||
  "e241fe70-844a-4fed-9537-4ec515345c93";

// Umami tracker, served first-party through the /stats rewrite in next.config.js.
// Only counts traffic on the production domains; never loads on /admin.
export function Analytics() {
  const pathname = usePathname();
  if (!WEBSITE_ID || pathname?.startsWith("/admin")) return null;

  return (
    <>
      <Script id="umami-before-send" strategy="afterInteractive">
        {`window.umamiBeforeSend = function (type, payload) {
  return payload && payload.url && payload.url.indexOf("/admin") === 0 ? false : payload;
};`}
      </Script>
      <Script
        src="/stats/script.js"
        data-website-id={WEBSITE_ID}
        data-host-url="/stats"
        data-domains="saritelkayam.com,www.saritelkayam.com"
        data-before-send="umamiBeforeSend"
        strategy="afterInteractive"
      />
    </>
  );
}

type UmamiWindow = Window & {
  umami?: { track: (event: string, data?: Record<string, unknown>) => void };
};

export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  (window as UmamiWindow).umami?.track(event, data);
}

export default Analytics;
