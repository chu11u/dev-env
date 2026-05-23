"use client";

import Image from "next/image";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { Star, ShoppingBag, Heart } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  size: string;
  image: string;
  badge?: string;
  rating: number;
}

const productsEn: Product[] = [
  {
    id: "gentle-gel-cleanser",
    name: "Gentle Gel Cleanser",
    category: "Cleansers",
    description:
      "A pH-balanced gel cleanser that removes impurities without stripping the skin's natural moisture barrier. Perfect for all skin types.",
    price: "₪38",
    size: "150ml",
    image: "/assets/products/luxury-bottle.png",
    badge: "Best Seller",
    rating: 5,
  },
  {
    id: "vitamin-c-serum",
    name: "Vitamin C Brightening Serum",
    category: "Serums",
    description:
      "A potent 15% Vitamin C serum that brightens, evens skin tone, and boosts collagen production. Visible results in just 2 weeks.",
    price: "₪65",
    size: "30ml",
    image: "/assets/products/serum-bottle.png",
    badge: "Staff Pick",
    rating: 5,
  },
  {
    id: "hydrating-moisturizer",
    name: "Hydrating Day Cream",
    category: "Moisturizers",
    description:
      "Rich yet lightweight day cream with hyaluronic acid and ceramides. Provides 24-hour hydration and strengthens the skin barrier.",
    price: "₪52",
    size: "50ml",
    image: "/assets/products/cream-jar.png",
    rating: 5,
  },
  {
    id: "night-recovery-cream",
    name: "Night Recovery Cream",
    category: "Moisturizers",
    description:
      "An intensive overnight treatment that repairs and regenerates while you sleep. Contains retinol, peptides, and plant stem cells.",
    price: "₪72",
    size: "50ml",
    image: "/assets/products/cream-jar.png",
    rating: 4,
  },
  {
    id: "retinol-serum",
    name: "Retinol Renewal Serum",
    category: "Serums",
    description:
      "A gentle 0.5% retinol serum that reduces fine lines, improves texture, and reveals younger-looking skin. Ideal for retinol beginners.",
    price: "₪58",
    size: "30ml",
    image: "/assets/products/serum-bottle.png",
    rating: 5,
  },
  {
    id: "mineral-spf",
    name: "Mineral Sunscreen SPF 50",
    category: "Sun Protection",
    description:
      "A lightweight, non-comedogenic mineral sunscreen with SPF 50. Invisible on all skin tones — no white cast. Reef-safe formula.",
    price: "₪42",
    size: "50ml",
    image: "/assets/products/luxury-bottle.png",
    badge: "Essential",
    rating: 5,
  },
  {
    id: "exfoliating-toner",
    name: "Exfoliating Toner (AHA/BHA)",
    category: "Cleansers",
    description:
      "A gentle chemical exfoliant with 5% glycolic acid and 1% salicylic acid. Use 2-3 times per week for smoother, brighter skin.",
    price: "₪35",
    size: "200ml",
    image: "/assets/products/luxury-bottle.png",
    rating: 4,
  },
  {
    id: "eye-serum",
    name: "Peptide Eye Serum",
    category: "Serums",
    description:
      "A targeted eye treatment that reduces dark circles, puffiness, and fine lines. Lightweight formula absorbs instantly without irritation.",
    price: "₪48",
    size: "15ml",
    image: "/assets/products/serum-bottle.png",
    rating: 5,
  },
];

const productsHe: Product[] = [
  {
    id: "ג'ל-ניקוי-עדין",
    name: "ג'ל ניקוי עדין",
    category: "משתפים",
    description:
      "ג'ל ניקוי מאוזן pH שמסיר זיהום מבלי לפגוע במחסום הלחות הטבעי של העור. מושלם לכל סוגי העור.",
    price: "₪38",
    size: "150ml",
    image: "/assets/products/luxury-bottle.png",
    badge: "הכי נמכר",
    rating: 5,
  },
  {
    id: "סרום-ויטמין-C",
    name: "סרום ויטמין C מבהיר",
    category: "סרומים",
    description:
      "סרום ויטמין C ריכוזי של 15% שמבהיר, מיישר גוון עור ומעודד ייצור קולגן. תוצאות נראות לעין כבר בתוך 2 שבועות.",
    price: "₪65",
    size: "30ml",
    image: "/assets/products/serum-bottle.png",
    badge: "ההמלצה של הצוות",
    rating: 5,
  },
  {
    id: "קרם-לחות-יומי",
    name: "קרם לחות יומי",
    category: "קרמים",
    description:
      "קרם יום עשיר אך קליל עם חומצה היאלורונית וצראמידים. מספק לחות ל-24 שעות ומחזק את מחסום העור.",
    price: "₪52",
    size: "50ml",
    image: "/assets/products/cream-jar.png",
    rating: 5,
  },
  {
    id: "קרם-לילה-משקם",
    name: "קרם לילה משקם",
    category: "קרמים",
    description:
      "טיפול לילה אינטנסיבי שמשקם ומחדש בזמן השינה. מכיל רטינול, פפטידים ותאי גזע צמחיים.",
    price: "₪72",
    size: "50ml",
    image: "/assets/products/cream-jar.png",
    rating: 4,
  },
  {
    id: "סרום-רטינול",
    name: "סרום רטינול מחדיש",
    category: "סרומים",
    description:
      "סרום רטינול עדין של 0.5% שמפחית קמטים, משפר מרקם וחושף עור צעיר יותר. אידיאלי למתחילים בשימוש ברטינול.",
    price: "₪58",
    size: "30ml",
    image: "/assets/products/serum-bottle.png",
    rating: 5,
  },
  {
    id: "משחה-מינרלית",
    name: "משחה מינרלית SPF 50",
    category: "הגנה מהשמש",
    description:
      "משחה להגנה מהשמש מינרלית קלילה ולא קומדוגנית עם SPF 50. בלתי נראה בכל גוונים — ללא סימן לבן. נוסחה בטוחה לשוניות האלמוגים.",
    price: "₪42",
    size: "50ml",
    image: "/assets/products/luxury-bottle.png",
    badge: "חיוני",
    rating: 5,
  },
  {
    id: "טונר-מקלף",
    name: "טונר מקלף (AHA/BHA)",
    category: "משתפים",
    description:
      "חומר קילוף כימי עדין עם 5% חומצה גליקולית ו-1% חומצה סליצילית. השתמשי 2-3 פעמים בשבוע לעור חלק ובהיר יותר.",
    price: "₪35",
    size: "200ml",
    image: "/assets/products/luxury-bottle.png",
    rating: 4,
  },
  {
    id: "סרום-עיניים",
    name: "סרום פפטידים לעיניים",
    category: "סרומים",
    description:
      "טיפול ייעודי לעיניים שמפחית עיגולים כהים, נפיחות וקמטים עדינים. נוסחה קלילה שנבלעת מיידית ללא גירוי.",
    price: "₪48",
    size: "15ml",
    image: "/assets/products/serum-bottle.png",
    rating: 5,
  },
];

const categoriesEn = [
  "All",
  "Cleansers",
  "Serums",
  "Moisturizers",
  "Sun Protection",
];
const categoriesHe = ["הכול", "משתפים", "סרומים", "קרמים", "הגנה מהשמש"];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < count ? "fill-gold-500 text-gold-500" : "text-cream-300"
          }
        />
      ))}
    </div>
  );
}

function ProductCard({ product, t }: { product: Product; t: any }) {
  return (
    <Card className="overflow-hidden group">
      {/* Image */}
      <div className="relative h-56 bg-cream-100 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <div className="absolute top-3 start-3">
            <Badge variant="accent">{product.badge}</Badge>
          </div>
        )}
        {/* Wishlist */}
        <button
          className="absolute top-3 end-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart size={16} className="text-rose-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="neutral">{product.category}</Badge>
          <span className="text-xs text-charcoal-400">{product.size}</span>
        </div>

        <h3 className="font-heading text-lg font-semibold text-charcoal-800 mb-2">
          {product.name}
        </h3>

        <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-cream-200">
          <span className="font-heading text-xl font-bold text-rose-400">
            {product.price}
          </span>
          <StarRating count={product.rating} />
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            href="/contact"
            className="w-full"
          >
            <ShoppingBag size={14} className="ms-2" />
            {t.shopAskAbout}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ShopPage() {
  const { t, locale } = useTranslation();
  const products = locale === "he" ? productsHe : productsEn;
  const categories = locale === "he" ? categoriesHe : categoriesEn;

  return (
    <>
      {/* Page header */}
      <FadeInSection>
        <section className="bg-cream-100 py-8 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="accent">{t.shopBadge}</Badge>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-800 mt-4 mb-4">
                {t.shopTitle}
              </h1>
              <SectionDivider className="mb-4" />
              <p className="font-body text-charcoal-500">{t.shopSubtitle}</p>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Category filter */}
      <FadeInSection>
        <section className="bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
                    cat ===
                    (locale === "he" ? categoriesHe[0] : categoriesEn[0])
                      ? "bg-rose-400 text-white"
                      : "bg-cream-100 text-charcoal-600 hover:bg-rose-100 hover:text-rose-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Product grid */}
      <FadeInSection>
        <Section bg="cream">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} t={t} />
            ))}
          </div>
        </Section>
      </FadeInSection>

      {/* Bottom CTA */}
      <FadeInSection>
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="font-body text-lg text-charcoal-600 mb-6">
              {t.shopConsultation}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" href="/contact">
                {t.shopRecommendations}
              </Button>
              <Button variant="outline" size="lg" href="/book">
                {t.shopBookTreatment}
              </Button>
            </div>
          </div>
        </section>
      </FadeInSection>
    </>
  );
}
