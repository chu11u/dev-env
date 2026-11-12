"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { trackEvent } from "@/components/common/Analytics";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  date: string;
  readTime: number;
  category?: string;
  coverImage?: string;
}

const SCROLL_MILESTONES = [25, 50, 75, 100];

/** Sends blog-scroll (25/50/75/100% of the article) and blog-read-time events. */
function useReadingAnalytics(slug: string) {
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reached = new Set<number>();
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const pct =
        total <= 0 ? 100 : Math.min(100, (-rect.top / total) * 100);
      for (const m of SCROLL_MILESTONES) {
        if (pct >= m && !reached.has(m)) {
          reached.add(m);
          trackEvent("blog-scroll", { post: slug, depth: m });
        }
      }
    };

    let visibleMs = 0;
    let visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
    let sent = false;
    const flush = () => {
      if (visibleSince) visibleMs += Date.now() - visibleSince;
      visibleSince = 0;
      const seconds = Math.round(visibleMs / 1000);
      if (!sent && seconds >= 3) {
        sent = true;
        trackEvent("blog-read-time", { post: slug, seconds });
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else if (!sent) visibleSince = Date.now();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [slug]);

  return articleRef;
}

function isBookingLink(href: string) {
  return /(^|\/\/[^/]*saritelkayam\.com)\/book\b|easybizy/i.test(href);
}

export default function BlogPostContent({ post }: { post: BlogPost }) {
  const { t, locale, isRtl } = useTranslation();
  const dateLocale = locale === "he" ? "he-IL" : "en-US";
  const articleRef = useReadingAnalytics(post.slug);

  // Simple markdown rendering: convert headers, paragraphs, lists, links
  const renderMarkdown = (md: string) => {
    const lines = md.split("\n");
    const elements: React.ReactNode[] = [];
    let inList = false;

    lines.forEach((line, i) => {
      if (line.match(/^######\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
        }
        elements.push(
          <h6
            key={i}
            className="font-heading text-base font-semibold text-charcoal-700 mt-6 mb-2"
          >
            {line.replace(/^######\s/, "")}
          </h6>,
        );
      } else if (line.match(/^#####\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
        }
        elements.push(
          <h5
            key={i}
            className="font-heading text-lg font-semibold text-charcoal-700 mt-6 mb-2"
          >
            {line.replace(/^#####\s/, "")}
          </h5>,
        );
      } else if (line.match(/^####\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
        }
        elements.push(
          <h4
            key={i}
            className="font-heading text-xl font-semibold text-charcoal-800 mt-8 mb-3"
          >
            {line.replace(/^####\s/, "")}
          </h4>,
        );
      } else if (line.match(/^###\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
        }
        elements.push(
          <h3
            key={i}
            className="font-heading text-xl md:text-2xl font-semibold text-charcoal-800 mt-8 mb-3"
          >
            {line.replace(/^###\s/, "")}
          </h3>,
        );
      } else if (line.match(/^##\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
        }
        elements.push(
          <h2
            key={i}
            className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mt-8 mb-4"
          >
            {line.replace(/^##\s/, "")}
          </h2>,
        );
      } else if (line.match(/^#\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
        }
        elements.push(
          <h1
            key={i}
            className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mt-8 mb-4"
          >
            {line.replace(/^#\s/, "")}
          </h1>,
        );
      } else if (line.match(/^- /)) {
        if (!inList) {
          elements.push(
            <ul
              key={`list-${i}`}
              className="list-disc list-inside space-y-1 my-4 text-charcoal-600 font-body"
            >
              <li key={i}>{renderInlineMarkdown(line.replace(/^- /, ""))}</li>
            </ul>,
          );
          inList = true;
        } else {
          elements.push(
            <li key={i} className="text-charcoal-600 font-body">
              {renderInlineMarkdown(line.replace(/^- /, ""))}
            </li>,
          );
        }
      } else if (line.match(/^\d+\.\s/)) {
        if (!inList) {
          elements.push(
            <ol
              key={`olist-${i}`}
              className="list-decimal list-inside space-y-1 my-4 text-charcoal-600 font-body"
            >
              <li key={i}>
                {renderInlineMarkdown(line.replace(/^\d+\.\s/, ""))}
              </li>
            </ol>,
          );
          inList = true;
        } else {
          elements.push(
            <li key={i} className="text-charcoal-600 font-body">
              {renderInlineMarkdown(line.replace(/^\d+\.\s/, ""))}
            </li>,
          );
        }
      } else if (line.trim() === "") {
        if (inList) {
          elements.push(<></>);
          inList = false;
        }
        elements.push(<br key={i} />);
      } else {
        if (inList) {
          elements.push(<></>);
          inList = false;
        }
        elements.push(
          <p
            key={i}
            className="font-body text-charcoal-600 leading-relaxed mb-4"
          >
            {renderInlineMarkdown(line)}
          </p>,
        );
      }
    });

    return elements;
  };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    const parts: (string | React.ReactNode)[] = [];
    let remaining = text;

    while (remaining) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const idx = boldMatch.index ?? 0;
        parts.push(remaining.slice(0, idx));
        parts.push(
          <strong
            key={parts.length}
            className="font-semibold text-charcoal-700"
          >
            {boldMatch[1]}
          </strong>,
        );
        remaining = remaining.slice(idx + boldMatch[0].length);
        continue;
      }

      // Italic
      const italicMatch = remaining.match(/\*(.+?)\*/);
      if (italicMatch) {
        const idx = italicMatch.index ?? 0;
        parts.push(remaining.slice(0, idx));
        parts.push(<em key={parts.length}>{italicMatch[1]}</em>);
        remaining = remaining.slice(idx + italicMatch[0].length);
        continue;
      }

      // Inline code
      const codeMatch = remaining.match(/`([^`]+)`/);
      if (codeMatch) {
        const idx = codeMatch.index ?? 0;
        parts.push(remaining.slice(0, idx));
        parts.push(
          <code
            key={parts.length}
            className="bg-cream-200 text-rose-600 px-1.5 py-0.5 rounded text-sm"
          >
            {codeMatch[1]}
          </code>,
        );
        remaining = remaining.slice(idx + codeMatch[0].length);
        continue;
      }

      // Links
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const idx = linkMatch.index ?? 0;
        parts.push(remaining.slice(0, idx));
        parts.push(
          <a
            key={parts.length}
            href={linkMatch[2]}
            className="text-rose-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...(isBookingLink(linkMatch[2])
              ? {
                  "data-umami-event": "book-click",
                  "data-umami-event-post": post.slug,
                  "data-umami-event-placement": "inline-link",
                }
              : {})}
          >
            {linkMatch[1]}
          </a>,
        );
        remaining = remaining.slice(idx + linkMatch[0].length);
        continue;
      }

      parts.push(remaining);
      break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  return (
    <>
      {/* Post header */}
      <FadeInSection>
        <section className="bg-cream-100 py-8 md:py-12 lg:py-16">
          <Container>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                {post.category && (
                  <Badge variant="default">{post.category}</Badge>
                )}
                <span className="flex items-center gap-1 font-body text-xs text-charcoal-400">
                  <Calendar size={12} />{" "}
                  {new Date(post.date).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1 font-body text-xs text-charcoal-400">
                  <Clock size={12} /> {post.readTime} {t.blogReadTime}
                </span>
              </div>

              <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-charcoal-800 mb-4">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="font-body text-base md:text-lg text-charcoal-500 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              <SectionDivider className="mt-6" />
            </div>
          </Container>
        </section>
      </FadeInSection>

      {post.coverImage ? (
        <FadeInSection>
          <section className="bg-cream-50 pb-2 md:pb-4">
            <Container>
              <div className="max-w-3xl mx-auto">
                <figure className="overflow-hidden rounded-2xl bg-cream-200">
                  {/* Plain img — /uploads is proxied to backend; avoid next/image optimizer 404s */}
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-auto max-h-[28rem] object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </figure>
              </div>
            </Container>
          </section>
        </FadeInSection>
      ) : null}

      {/* Post content */}
      <FadeInSection>
        <article ref={articleRef} className="py-8 md:py-16 lg:py-20">
          <Container>
            <div className="max-w-3xl mx-auto prose-lg">
              {renderMarkdown(post.content)}
            </div>
          </Container>
        </article>
      </FadeInSection>

      {/* Booking CTA */}
      <FadeInSection>
        <section className="bg-cream-50 pb-8 md:pb-12">
          <Container>
            <div className="max-w-3xl mx-auto rounded-2xl bg-rose-50 border border-rose-100 px-6 py-8 md:px-10 text-center">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mb-3">
                {t.blogCtaTitle}
              </h2>
              <p className="font-body text-charcoal-600 mb-6">
                {t.blogCtaText}
              </p>
              <Button
                variant="primary"
                size="lg"
                href={`/book?from=${encodeURIComponent(post.slug)}`}
                data-umami-event="book-click"
                data-umami-event-post={post.slug}
                data-umami-event-placement="post-cta"
              >
                {t.blogCtaButton}
              </Button>
            </div>
          </Container>
        </section>
      </FadeInSection>

      {/* Back to blog */}
      <FadeInSection>
        <section className="bg-cream-100 py-8 md:py-12">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <Button
                variant="outline"
                size="md"
                href="/blog"
                className={`inline-flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <ArrowLeft size={16} /> {t.blogBackToBlog}
              </Button>
            </div>
          </Container>
        </section>
      </FadeInSection>
    </>
  );
}
