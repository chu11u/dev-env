"use client";

import { FadeInSection } from "@/components/common/FadeInSection";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/layout/Section";
import { SectionDivider } from "@/components/common/SectionDivider";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { Button } from "@/components/ui/Button";
import { Clock, DollarSign, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface Service {
  title: string;
  description: string;
  duration: string;
  price: string;
  features?: string[];
}

const categoriesEn = [
  {
    name: "Facials",
    icon: "💆‍♀️",
    services: [
      {
        title: "Signature Facial",
        description:
          "A luxurious deep-cleansing facial tailored to your skin type, featuring gentle exfoliation, custom mask, and hydrating serum.",
        duration: "60 min",
        price: "₪120",
        features: [
          "Deep cleansing",
          "Custom mask",
          "Hydrating serum",
          "Moisturizer",
        ],
      },
      {
        title: "Anti-Aging Facial",
        description:
          "Advanced treatment targeting fine lines and wrinkles with collagen-boosting serums and microcurrent therapy.",
        duration: "75 min",
        price: "₪160",
        features: [
          "Microcurrent therapy",
          "Peptide serum",
          "Eye treatment",
          "Neck & décolleté",
        ],
      },
      {
        title: "Acne Clarifying Facial",
        description:
          "Targeted treatment for blemish-prone skin with deep pore cleansing, antibacterial masks, and soothing botanicals.",
        duration: "60 min",
        price: "₪130",
        features: [
          "Deep pore cleansing",
          "Antibacterial mask",
          "LED light therapy",
          "Non-comedogenic moisturizer",
        ],
      },
      {
        title: "Hydra-Glow Facial",
        description:
          "Intense hydration treatment using hyaluronic acid and vitamin C for a radiant, dewy complexion.",
        duration: "60 min",
        price: "₪140",
        features: [
          "Hydra-dermabrasion",
          "Vitamin C infusion",
          "Brightening mask",
          "SPF application",
        ],
      },
    ],
  },
  {
    name: "Skin Analysis",
    icon: "🔬",
    services: [
      {
        title: "Skin Analysis & Consultation",
        description:
          "Comprehensive skin assessment using advanced VISIA technology to identify your unique needs.",
        duration: "45 min",
        price: "₪80",
        features: [
          "VISIA 3D imaging",
          "Skin map report",
          "Personalized plan",
          "Product recommendations",
        ],
      },
      {
        title: "Follow-Up Analysis",
        description:
          "Track your skin progress and adjust your treatment plan based on measurable results.",
        duration: "30 min",
        price: "₪50",
        features: [
          "Progress comparison",
          "Plan adjustment",
          "New product suggestions",
        ],
      },
    ],
  },
  {
    name: "Body Treatments",
    icon: "✨",
    services: [
      {
        title: "Back Facial",
        description:
          "Deep cleansing treatment for back and chest acne, using specialized products and extractions.",
        duration: "60 min",
        price: "₪110",
        features: [
          "Gentle exfoliation",
          "Extractions",
          "Antibacterial treatment",
          "Soothing mask",
        ],
      },
      {
        title: "Body Scrub & Wrap",
        description:
          "Exfoliating body scrub followed by a nourishing wrap for silky, rejuvenated skin.",
        duration: "90 min",
        price: "₪150",
        features: [
          "Sugar scrub",
          "Seaweed wrap",
          "Hydrating lotion",
          "Aromatherapy",
        ],
      },
      {
        title: "Hand & Nail Treatment",
        description:
          "Luxurious hand spa with cuticle care, exfoliation, hydrating mask, and manicure.",
        duration: "45 min",
        price: "₪70",
        features: [
          "Cuticle care",
          "Exfoliating scrub",
          "Hydrating mask",
          "Gel polish option",
        ],
      },
    ],
  },
  {
    name: "Makeup",
    icon: "💄",
    services: [
      {
        title: "Bridal Makeup",
        description:
          "Flawless, long-lasting makeup for your special day. Includes trial session and day-of application.",
        duration: "90 min",
        price: "₪250",
        features: [
          "Trial session",
          "Day-of application",
          "Touch-up kit",
          "Brow shaping included",
        ],
      },
      {
        title: "Special Event Makeup",
        description:
          "Professional makeup for galas, photoshoots, or any special occasion that calls for your best look.",
        duration: "60 min",
        price: "₪150",
        features: [
          "Custom color palette",
          "Long-wear formula",
          "Setting spray",
          "Touch-up tips",
        ],
      },
      {
        title: "Everyday Glam",
        description:
          "Learn to achieve your perfect everyday look with a customized routine and application lesson.",
        duration: "60 min",
        price: "₪100",
        features: [
          "Technique lesson",
          "Product selection",
          "Step-by-step guide",
          "Take-home card",
        ],
      },
    ],
  },
];

const categoriesHe = [
  {
    name: "פילינגים",
    icon: "💆‍♀️",
    services: [
      {
        title: "פילינג סיגניצ'ר",
        description:
          "פילינג מפנק ומעמיק המותאם לסוג העור שלך, הכולל קילוף עדין, מסכה מותאמת אישית והזרמת סרום מלחלח.",
        duration: "60 דק'",
        price: "₪120",
        features: ["ניקוי עמוק", "מסכה מותאמת", "סרום מלחלח", "קרם לחות"],
      },
      {
        title: "פילינג אנטי-אייג'ינג",
        description:
          "טיפול מתקדם להפחתת קמטים עדינים וקמטים, הכולל הזרמת סרום לעידוד ייצור קולגן וטיפול במיקרו-זרם.",
        duration: "75 דק'",
        price: "₪160",
        features: [
          "טיפול במיקרו-זרם",
          "סרום פפטידים",
          "טיפול באזור העיניים",
          "טיפול בצוואר ובדקולטה",
        ],
      },
      {
        title: "פילינג מנקה לאקנה",
        description:
          "טיפול ממוקד לעור נוטה לאקנה, הכולל ניקוי עמוק של הנקבוביות, מסכה אנטיבקטריאלית ורכיבים צמחיים מרגיעים.",
        duration: "60 דק'",
        price: "₪130",
        features: [
          "ניקוי עמוק של הנקבוביות",
          "מסכה אנטיבקטריאלית",
          "טיפול באור LED",
          "קרם לחות לא קומדוגני",
        ],
      },
      {
        title: "פילינג הידרו-ברק",
        description:
          "טיפול לחות אינטנסיבי עם חומצה היאלורונית וויטמין C למראה זוהר ולחות עמוקה.",
        duration: "60 דק'",
        price: "₪140",
        features: [
          "הידרו-דרמבראזיה",
          "הזרמת ויטמין C",
          "מסכה מבהירה",
          "הגנת SPF",
        ],
      },
    ],
  },
  {
    name: "אבחון עור",
    icon: "🔬",
    services: [
      {
        title: "אבחון עור וייעוץ",
        description:
          "הערכת עור מקיפה באמצעות טכנולוגיית VISIA מתקדמת לזיהוי הצרכים הייחודיים שלך.",
        duration: "45 דק'",
        price: "₪80",
        features: [
          "דימות תלת-ממדי VISIA",
          "דוח מפת עור",
          "תוכנית טיפול מותאמת אישית",
          "המלצות מוצרים",
        ],
      },
      {
        title: "אבחון מעקב",
        description:
          "מעקב אחר התקדמות העור והתאמת תוכנית הטיפול בהתבסס על תוצאות מדידה.",
        duration: "30 דק'",
        price: "₪50",
        features: ["השוואת התקדמות", "התאמת תוכנית", "המלצות מוצרים מעודכנות"],
      },
    ],
  },
  {
    name: "טיפולי גוף",
    icon: "✨",
    services: [
      {
        title: "טיפול גב וחזה",
        description:
          "טיפול ניקוי עמוק לאקנה בגב ובחזה, באמצעות מוצרים ייעודיים וטיפול הוצאת פצעים.",
        duration: "60 דק'",
        price: "₪110",
        features: [
          "קילוף עדין",
          "הוצאת פצעים",
          "טיפול אנטיבקטריאלי",
          "מסכה מרגיעה",
        ],
      },
      {
        title: "פילינג גוף ועטיפה",
        description: "פילינג גוף מנקה לאחריו עטיפה מזינה לעור חלק וחיוני.",
        duration: "90 דק'",
        price: "₪150",
        features: ["פילינג סוכר", "עטיפת אצות", "קרם לחות לגוף", "ארומתרפיה"],
      },
      {
        title: "טיפול ידיים וציפורניים",
        description:
          "טיפול ספא מפנק לידיים הכולל טיפול בקוטיקולות, קילוף, מסכת לחות ומניקור.",
        duration: "45 דק'",
        price: "₪70",
        features: [
          "טיפול בקוטיקולות",
          "פילינג ידיים",
          "מסכת לחות",
          "אפשרות לק ג'ל",
        ],
      },
    ],
  },
  {
    name: "איפור",
    icon: "💄",
    services: [
      {
        title: "איפור חתונה",
        description:
          "איפור מושלם ועמיד ליום המיוחד שלך. כולל מפגש הכנה ויישום ביום החתונה.",
        duration: "90 דק'",
        price: "₪250",
        features: [
          "מפגש הכנה",
          "יישום ביום החתונה",
          "ערכת ניקודים",
          "עיצוב גבות כלול",
        ],
      },
      {
        title: "איפור לאירוע מיוחד",
        description:
          "איפור מקצועי לגאלות, צילומים, או כל אירוע שבו את רוצה להיראות במיטבך.",
        duration: "60 דק'",
        price: "₪150",
        features: [
          "בחירת צבעים מותאמת אישית",
          "נוסחה עמידה",
          "ספריי קיבוע",
          "טיפים לניקודים",
        ],
      },
      {
        title: "איפור יומי אלגנטי",
        description:
          "למדי להשיג את המראה היומי המושלם שלך עם שגרה מותאמת אישית ושעור יישום.",
        duration: "60 דק'",
        price: "₪100",
        features: [
          "שיעור טכניקות",
          "בחירת מוצרים",
          "מדריך צעד אחר צעד",
          "כרטיס המצא להביתה",
        ],
      },
    ],
  },
];

function ServiceCard({ service, t }: { service: Service; t: any }) {
  const { isRtl } = t;
  return (
    <div className="h-full hover:-translate-y-1 transition-transform duration-200 ease-[0.4,0,0.2,1]">
      <Card className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-charcoal-800">
            {service.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-charcoal-500">
            <span className="flex items-center gap-1">
              <Clock size={14} /> {service.duration}
            </span>
            <span className="flex items-center gap-1 font-medium text-rose-400">
              <DollarSign size={14} /> {service.price}
            </span>
          </div>
        </div>

        <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-4">
          {service.description}
        </p>

        {service.features && (
          <ul className="space-y-1.5 mb-6 flex-1">
            {service.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-charcoal-600"
              >
                <ChevronRight
                  size={12}
                  className={`text-rose-400 ${isRtl ? "rotate-180" : ""}`}
                />
                {feature}
              </li>
            ))}
          </ul>
        )}

        <Button variant="outline" size="sm" href="/book">
          {t.servicesBookThis}
        </Button>
      </Card>
    </div>
  );
}

export default function ServicesPage() {
  const { t, locale } = useTranslation();
  const categories = locale === "he" ? categoriesHe : categoriesEn;

  return (
    <>
      {/* Page header */}
      <FadeInSection>
        <section className="bg-cream-100 py-8 md:py-16 lg:py-20">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="accent">{t.servicesPageBadge}</Badge>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-800 mt-4 mb-4">
                {t.servicesPageTitle}
              </h1>
              <SectionDivider className="mb-4" />
              <p className="font-body text-charcoal-500">
                {t.servicesPageSubtitle}
              </p>
            </div>
          </Container>
        </section>
      </FadeInSection>

      {/* Category sections */}
      {categories.map((category) => (
        <FadeInSection key={category.name}>
          <Section
            title={`${category.icon} ${category.name}`}
            bg={
              category.name === "Skin Analysis" ||
              category.name === "Makeup" ||
              category.name === "אבחון עור" ||
              category.name === "איפור"
                ? "cream"
                : "white"
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.services.map((service) => (
                <ServiceCard key={service.title} service={service} t={t} />
              ))}
            </div>
          </Section>
        </FadeInSection>
      ))}

      {/* Bottom CTA */}
      <FadeInSection>
        <Section bg="cream">
          <div className="text-center">
            <p className="font-body text-charcoal-600 mb-4">
              {t.servicesPageNotSure}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" href="/contact">
                {t.servicesPageRecommendation}
              </Button>
              <Button variant="outline" href="/book">
                {t.servicesPageConsultation}
              </Button>
            </div>
          </div>
        </Section>
      </FadeInSection>
    </>
  );
}
