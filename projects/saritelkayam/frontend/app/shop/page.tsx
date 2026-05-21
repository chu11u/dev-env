import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { FadeInSection } from "@/components/common/FadeInSection";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop | Sarit Elkayam",
  description:
    "Browse our curated collection of premium skincare products and beauty essentials.",
  openGraph: {
    title: "Shop | Sarit Elkayam",
    description: "Premium beauty products recommended by Sarit Elkayam.",
  },
};

export default function ShopPage() {
  return (
    <FadeInSection>
      <section className="bg-cream-100 min-h-[60vh] flex items-center">
        <Container>
          <div className="max-w-xl mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-rose-400" />
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-4">
              Product Shop
            </h1>

            <SectionDivider className="mb-4" />

            <p className="font-body text-lg text-charcoal-500 mb-2">
              Coming Soon
            </p>
            <p className="font-body text-charcoal-500 mb-8">
              We're curating a collection of premium skincare and beauty
              products to complement your treatments. Stay tuned — our shop will
              be launching shortly.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" href="/">
                Back to Home
              </Button>
              <Button variant="outline" size="lg" href="/contact">
                Get Product Recommendations
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </FadeInSection>
  );
}
