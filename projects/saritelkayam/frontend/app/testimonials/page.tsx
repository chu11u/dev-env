"use client";

import { FadeInSection } from "@/components/common/FadeInSection";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const testimonialsEn = [
  {
    name: "Rachel M.",
    service: "Signature Facial",
    rating: 5,
    date: "2026-05-10",
    text: "Sarit is absolutely amazing! My skin has never looked better. The facial was relaxing and the results were immediate. I walked out feeling like a new person. Highly recommend to anyone looking for a true professional.",
  },
  {
    name: "Dana K.",
    service: "Skin Analysis",
    rating: 5,
    date: "2026-05-05",
    text: "The skin analysis opened my eyes to what my skin really needs. Sarit's expertise and attention to detail made all the difference. She gave me a personalized routine that actually works!",
  },
  {
    name: "Maya L.",
    service: "Bridal Makeup",
    rating: 5,
    date: "2026-04-28",
    text: "Sarit did my bridal makeup and I looked flawless all day! The trial session put my mind at ease, and on the big day she was punctual, calm, and brilliant. Every photo turned out perfect.",
  },
  {
    name: "Noa T.",
    service: "Hydra-Glow Facial",
    rating: 5,
    date: "2026-04-20",
    text: "I came in with dull, dehydrated skin and left with the most radiant glow I've had in years. The Hydra-Glow treatment is a game-changer. Already booked my next session!",
  },
  {
    name: "Shirin B.",
    service: "Anti-Aging Facial",
    rating: 5,
    date: "2026-04-15",
    text: "After three sessions, the difference in my skin texture is remarkable. The microcurrent therapy feels incredible and the peptide serum is now part of my daily routine. Worth every penny.",
  },
  {
    name: "Tamir S.",
    service: "Special Event Makeup",
    rating: 4,
    date: "2026-04-10",
    text: "Got professional makeup for a gala and felt like a million bucks. Sarit is talented, kind, and really listens to what you want. The makeup lasted through the entire evening without touch-ups.",
  },
  {
    name: "Leah G.",
    service: "Acne Clarifying Facial",
    rating: 5,
    date: "2026-04-05",
    text: "I struggled with acne for years. After Sarit's clarifying facial, my skin was clearer than it has been in ages. She's gentle but thorough, and the LED therapy felt so soothing.",
  },
  {
    name: "Yael R.",
    service: "Body Scrub & Wrap",
    rating: 5,
    date: "2026-03-30",
    text: "The most relaxing treatment I have ever had! The sugar scrub and seaweed wrap left my skin feeling like silk. Plus the aromatherapy was heavenly. A true spa experience.",
  },
  {
    name: "Aviv H.",
    service: "Everyday Glam",
    rating: 5,
    date: "2026-03-22",
    text: "The Everyday Glam lesson changed my morning routine completely. Sarit taught me techniques I use every day now. The take-home guide is so helpful. Best beauty investment I've made.",
  },
];

const testimonialsHe = [
  {
    name: "רחל מ'",
    service: "פילינג סיגניצ'ר",
    rating: 5,
    date: "2026-05-10",
    text: "שרית פשוט מדהימה! העור שלי מעולם לא נראה טוב יותר. הטיפול היה מרגיע והתוצאות מידיות — יצאתי מרגישה כאדם חדש. ממליצה בחום לכל מי שמחפשת מקצוענית אמיתית.",
  },
  {
    name: "דנה כ'",
    service: "אבחון עור",
    rating: 5,
    date: "2026-05-05",
    text: "אבחון העור פתח את העיניים שלי — גיליתי מה שהעור שלי באמת צריך. המקצועיות והתשומת לב לפרטים של שרית עשו את כל ההבדל. קיבלתי שגרה מותאמת אישית שעובדת באמת!",
  },
  {
    name: "מאיה ל'",
    service: "איפור חתונה",
    rating: 5,
    date: "2026-04-28",
    text: "שרית עשתה את איפור החתונה שלי והנראיתי מושלם כל היום! מפגש ההכנה השקט את הדעת שלי, וביום הגדול היא הייתה בדיוק בזמן, רגועה ומדהימה. כל תמונה יצאה מושלמת.",
  },
  {
    name: "נועה ת'",
    service: "פילינג הידרו-ברק",
    rating: 5,
    date: "2026-04-20",
    text: "הגעתי עם עור מת ועייף ויצאתי עם הברק הזוהר ביותר שהיה לי בשנים רבות. פילינג ההידרו-ברק שינה את המראה שלי לחלוטין. כבר תאמתי את הטיפול הבא!",
  },
  {
    name: "שריין ב'",
    service: "פילינג אנטי-אייג'ינג",
    rating: 5,
    date: "2026-04-15",
    text: "לאחר שלושה טיפולים, השינוי במרקם העור שלי מדהים. טיפול המיקרו-זרם מרגיש נפלא והסרום הפפטידי הוא עכשיו חלק מהשגרה היומיומית שלי. שווה כל שקל.",
  },
  {
    name: "תמר ס'",
    service: "איפור לאירוע מיוחד",
    rating: 4,
    date: "2026-04-10",
    text: "קבלתי איפור מקצועי לגלה והרגשתי כמו מיליון דולר. שרית מוכשרת, נחמדה, ושמעה באמת מה שרציתי. האיפור החזיק לאורך כל הערב ללא ניקודים.",
  },
  {
    name: "ליאה ג'",
    service: "פילינג מנקה לאקנה",
    rating: 5,
    date: "2026-04-05",
    text: "סבלתי מאקנה שנים. אחרי הטיפול המנקה של שרית, העור שלי היה נקי יותר מכל מה שהכרתי. היא עדינה אבל יסודית, וטיפול ה-LED הרגיש כל כך מרגיע.",
  },
  {
    name: "יעל ר'",
    service: "פילינג גוף ועטיפה",
    rating: 5,
    date: "2026-03-30",
    text: "הטיפול המרנין ביותר שעשיתי אי פעם! פילינג הסוכר ועטיפת האצות השאירו את העור שלי חלק כמו משי. הארומתרפיה הייתה שמימית. חווית ספא אמיתית.",
  },
  {
    name: "אביב ה'",
    service: "איפור יומי אלגנטי",
    rating: 5,
    date: "2026-03-22",
    text: "שיעור האיפור היומי שינה את שגרת הבוקר שלי לחלוטין. שרית לימדה אותי טכניקות שאני משתמשת בהן כל יום. המדריך לקחה הביתה כל כך מועיל. ההשקעה ביופי הטובה ביותר שעשיתי.",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < count ? "fill-gold-500 text-gold-500" : "text-cream-300"
          }
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const { t, locale } = useTranslation();
  const items = locale === "he" ? testimonialsHe : testimonialsEn;
  const dateLocale = locale === "he" ? "he-IL" : "en-US";

  return (
    <>
      {/* Page header */}
      <FadeInSection>
        <section className="bg-cream-100 py-8 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="accent">{t.testimonialsBadge}</Badge>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-800 mt-4 mb-4">
                {t.testimonialsTitle}
              </h1>
              <SectionDivider className="mb-4" />
              <p className="font-body text-charcoal-500">
                {t.testimonialsSubtitlePage}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="fill-gold-500 text-gold-500"
                    />
                  ))}
                </div>
                <span className="font-body text-sm text-charcoal-500">
                  {t.testimonialsAverageRating} {items.length}{" "}
                  {t.testimonialsReviews}
                </span>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Testimonials grid */}
      <FadeInSection>
        <Section bg="white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <Card key={item.name} className="p-6 md:p-8 flex flex-col h-full">
                {/* Avatar + name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center text-white font-heading font-semibold text-xl shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-charcoal-800">
                      {item.name}
                    </p>
                    <Badge variant="default">{item.service}</Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <StarRating count={item.rating} />
                </div>

                <p className="font-body text-sm text-charcoal-600 leading-relaxed flex-1 italic">
                  "{item.text}"
                </p>

                <p className="font-body text-xs text-charcoal-400 mt-4 pt-4 border-t border-cream-200">
                  {new Date(item.date).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </Card>
            ))}
          </div>
        </Section>
      </FadeInSection>

      {/* CTA */}
      <FadeInSection>
        <Section bg="cream">
          <div className="text-center">
            <p className="font-body text-base md:text-lg text-charcoal-600 mb-6">
              {t.testimonialsReady}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" href="/book">
                {t.testimonialsBookAppointment}
              </Button>
              <Button variant="outline" size="lg" href="/services">
                {t.testimonialsViewServices}
              </Button>
            </div>
          </div>
        </Section>
      </FadeInSection>
    </>
  );
}
