import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Home, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found | Sarit Elkayam",
  description: "The page you are looking for could not be found.",
};

export default function NotFoundPage() {
  return (
    <FadeInSection>
      <section className="bg-cream-100 min-h-[70vh] flex items-center">
        <Container>
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="font-heading text-8xl md:text-9xl font-bold text-rose-200 mb-2">
              404
            </div>

            <h1 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mb-4">
              Page Not Found
            </h1>

            <SectionDivider className="mb-4" />

            <p className="font-body text-charcoal-500 mb-8">
              The page you're looking for doesn't exist or has been moved. Don't
              worry — let's get you back to exploring our beauty services.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="primary"
                size="md"
                href="/"
                className="inline-flex items-center gap-2"
              >
                <Home size={16} /> Home
              </Button>
              <Button
                variant="outline"
                size="md"
                href="javascript:history.back()"
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Go Back
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-cream-200">
              <p className="font-body text-sm text-charcoal-400 mb-3">
                Popular pages:
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/services"
                  className="font-body text-sm text-rose-400 hover:underline"
                >
                  Services
                </a>
                <a
                  href="/testimonials"
                  className="font-body text-sm text-rose-400 hover:underline"
                >
                  Testimonials
                </a>
                <a
                  href="/blog"
                  className="font-body text-sm text-rose-400 hover:underline"
                >
                  Blog
                </a>
                <a
                  href="/contact"
                  className="font-body text-sm text-rose-400 hover:underline"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </FadeInSection>
  );
}
