"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";

// ─── Dictionaries ────────────────────────────────────────────────

const he = {
  // ── Site identity
  siteName: "שרית אלקיים",
  siteNameFull: "שרית אלקיים",
  tagline: "קוסמטיקאית מקצועית לטיפוח היופי הטבעי שלך",
  copyright: "כל הזכויות שמורות",

  // ── Navigation
  navHome: "דף הבית",
  navServices: "טיפולים",
  navTestimonials: "המלצות",
  navBlog: "בלוג",
  navContact: "צור קשר",
  navShop: "חנות",
  navBook: "תיאום תור",
  openMenu: "פתח תפריט",
  closeMenu: "סגור תפריט",

  // ── Hero
  heroBadge: "קוסמטיקאית מקצועית",
  heroTitle: "יופי שמדגיש את הברק הטבעי שלך",
  heroSubtitle:
    "טיפולי עור מותאמים אישית, איפור מקצועי וטיפולי יופי — כי את מגיעה להיראות ולהרגיש יוצא דופן",
  heroCta: "תאמי תור",
  heroViewServices: "צפי בטיפולים",

  // ── Services Preview
  servicesTitle: "טיפולים בולטים",
  servicesSubtitle:
    "הכירי את הטיפולים שישדרגו את העור שלך ויגבירו את הביטחון העצמי שלך",
  servicesLearnMore: "מידע נוסף",
  servicesViewAll: "צפי בכל הטיפולים",
  servicesDuration: "משך",
  servicesPrice: "מחיר",
  servicesBadgePopular: "הכי פופולרי",
  servicesBadgeEssential: "חיוני",
  servicesBadgePremium: "פרימיום",
  servicesSignatureFacial: "פילינג סיגניצ'ר",
  servicesSignatureFacialDesc:
    "פילינג מפנק ומעמיק המותאם לסוג העור שלך, הכולל קילוף עדין, מסכה מותאמת אישית והזרמת סרום מלחלח",
  servicesSkinAnalysis: "אבחון עור וייעוץ",
  servicesSkinAnalysisDesc:
    "הערכת עור מקיפה באמצעות טכנולוגיה מתקדמת לזיהוי הצרכים הייחודיים שלך ויצירת תוכנית טיפול מותאמת אישית",
  servicesBridalMakeup: "איפור חתונה",
  servicesBridalMakeupDesc:
    "איפור מושלם ועמיד ליום המיוחד שלך. כולל מפגש הכנה ויישום ביום החתונה",
  servicesBookThis: "תאמי טיפול זה",

  // ── Testimonials
  testimonialsTitle: "מה הלקוחות אומרות",
  testimonialsSubtitle: "חוויות אמיתיות מלקוחות שסומכות על שרית עם היופי שלהן",
  testimonialsBadge: "אהבת לקוחות",
  testimonialsSubtitlePage:
    "אל תסתמכי רק על מה שאנחנו אומרות —שמעי מלקוחות אמיתיות שחוו את השינוי",
  testimonialsAverageRating: "דירוג ממוצע מ",
  testimonialsReviews: "ביקורות",
  testimonialsReady: "מוכנה להיות הלקוחה השמחה הבאה שלנו?",
  testimonialsBookAppointment: "תאמי תור",
  testimonialsViewServices: "צפי בטיפולים",

  // ── CTA Section
  ctaTitle: "מוכנה לשנות את המראה שלך?",
  ctaSubtitle:
    "תאמי תור עוד היום וחופפי טיפולי יופי אישיים שנוצרו במיוחד בשבילך",
  ctaPrimary: "תאמי עכשיו",
  ctaSecondary: "צרי קשר",

  // ── Services Page
  servicesPageTitle: "טיפולי יופי מקצועיים",
  servicesPageBadge: "הטיפולים שלנו",
  servicesPageSubtitle:
    "כל טיפול מותאם לצרכים הייחודיים שלך. כל המוצרים הם פרימיום, נבדקו דרמטולוגית, וללא ניסויים על בעלי חיים",
  servicesPageNotSure: "לא בטוחה איזה טיפול מתאים לך?",
  servicesPageRecommendation: "קבלי המלצה",
  servicesPageConsultation: "תאמי ייעוץ",
  servicesCategoryFacials: "פילינגים",
  servicesCategorySkinAnalysis: "אבחון עור",
  servicesCategoryBodyTreatments: "טיפולי גוף",
  servicesCategoryMakeup: "איפור",

  // ── Contact
  contactBadge: "צרי קשר",
  contactTitle: "צרי קשר עם שרית",
  contactSubtitle: "יש שאלות על הטיפולים שלנו? רוצה לתאם תור? נשמח לשמוע ממך",
  contactSendTitle: "שלחי הודעה",
  contactThankYou: "תודה רבה!",
  contactThankYouMsg: "ההודעה שלך נשלחה. שרית תחזור אליך תוך 24 שעות",
  contactSendAnother: "שלחי הודעה נוספת",
  contactFullName: "שם מלא",
  contactFullNamePlaceholder: "השם המלא שלך",
  contactEmail: "אימייל",
  contactEmailPlaceholder: "your@email.com",
  contactPhone: "טלפון",
  contactPhonePlaceholder: "050-000-0000",
  contactMessage: "הודעה",
  contactMessagePlaceholder:
    "ספרי לנו על מטרות העור שלך, הטיפול שמעניין אותך, או שאלות...",
  contactSendMessage: "שלחי הודעה",
  contactStudioTitle: "מידע על הסטודיו",
  contactLocation: "מיקום",
  contactLocationDetail: "תל אביב, ישראל",
  contactLocationNote: "(כתובת מדויקת תישלח עם התיאום)",
  contactEmailLabel: "אימייל",
  contactPhoneLabel: "טלפון",
  contactFollowUs: "עקבו אחרינו",
  contactHoursTitle: "שעות פעילות",
  contactSundayThursday: "ראשון – חמישי",
  contactFriday: "שישי",
  contactSaturday: "שבת",
  contactClosed: "סגור",

  // ── Shop
  shopTitle: "החנות שלנו",
  shopBadge: "מוצרים מומלצים",
  shopSubtitle:
    "מבחר מוצרי עור ויופי פרימיום, נבחרו בקפידה להתאים לטיפולים שלנו. כל המוצרים נבדקו דרמטולוגית וללא ניסויים על בעלי חיים.",
  shopAskAbout: "שאלו על המוצר",
  shopRecommendations: "קבלי המלצות מוצרים",
  shopBookTreatment: "תאמי טיפול",
  shopConsultation:
    "לא בטוחה איזה מוצר מתאים לך? פני אלינו לייעוץ אישי וקבלי המלצה מותאמת אישית",

  // ── Products Preview (home page)
  productsTitle: "מוצרים בולטים",
  productsSubtitle:
    "מבחר מוצרי עור ויופי פרימיום, נבחרו בקפידה להתאים לטיפולים שלנו",
  productsViewAll: "צפי בכל המוצרים",

  // ── Book
  bookBadge: "תיאום מקוון",
  bookTitle: "תאמי תור",
  bookSubtitle: "תאמי תור מקוון לטיפול אצל שרית אלקיים — מהר, פשוט, ונוח",
  bookLoading: "טוען מערכת התיאום...",
  bookErrorTitle: "לא ניתן לטעון את מערכת התיאום",
  bookErrorMsg:
    "המערכת לא נטענה תוך זמן סביר. לחצי כאן כדי לפתוח את מערכת התיאום בחלון חדש",
  bookOpenExternal: "פתח מערכת תיאום בחלון חדש",

  // ── Blog
  blogTitle: "טיפים וחדשים",
  blogBadge: "בלוג",
  blogSubtitle:
    "טיפים מהמומחית, שגרות טיפוח, ותובנות יופי מקוסמטיקאית מקצועית שרית אלקיים",
  blogNoPosts: "אין פוסטים בבלוג כרגע. חזרי בקרוב לטיפים לטיפוח!",
  blogReadTime: "דק' קריאה",
  blogBackToBlog: "חזרה לבלוג",
  blogCategory: "קטגוריה",
  blogPostNotFound: "פוסט הבלוג לא נמצא",
  blogReadMore: "קריאה נוספת",
  blogViewAll: "צפי בכל הפוסטים",

  // ── 404
  notFoundTitle: "הדף לא נמצא",
  notFoundSubtitle:
    "הדף שחיפשת לא קיים או הועבר. אל דאגה — נחזיר אותך לגילוי טיפולי היופי שלנו",
  notFoundHome: "דף הבית",
  notFoundGoBack: "חזרה",
  notFoundPopularPages: "דפים פופולריים:",

  // ── Language toggle
  langHebrew: "עברית",
  langEnglish: "English",

  // ── Admin Panel
  adminDashboard: "לוח בקרה",
  adminBlog: "בלוג",
  adminTestimonials: "המלצות",
  adminProducts: "מוצרים",
  adminServices: "טיפולים",
  adminSettings: "הגדרות",
  adminLogout: "התנתק",
  adminSave: "שמור",
  adminCancel: "ביטול",
  adminDelete: "מחק",
  adminAddNew: "הוסף חדש",
  adminConfirmDelete: "אשר מחיקה",
  testimonialListTitle: "ניהול המלצות",
  testimonialListSubtitle: "נהל המלצות ובקורות של לקוחות",
  testimonialNewTitle: "המלצה חדשה",
  testimonialEditTitle: "עריכת המלצה",
  productListTitle: "ניהול מוצרים",
  productListSubtitle: "נהל את מוצרי הקטלוג שלך",
  productNewTitle: "מוצר חדש",
  productEditTitle: "עריכת מוצר",
  serviceListTitle: "ניהול טיפולים",
  serviceListSubtitle: "נהל טיפולי יופי ושירותים",
  serviceNewTitle: "טיפול חדש",
  serviceEditTitle: "עריכת טיפול",
  settingsTitle: "הגדרות האתר",
  settingsSubtitle: "נהל הגדרות ותצורה של האתר",
};

const en = {
  // ── Site identity
  siteName: "Sarit Elkayam",
  siteNameFull: "Sarit Elkayam",
  tagline:
    "Professional cosmetician dedicated to enhancing your natural beauty",
  copyright: "All rights reserved",

  // ── Navigation
  navHome: "Home",
  navServices: "Services",
  navTestimonials: "Testimonials",
  navBlog: "Blog",
  navContact: "Contact",
  navShop: "Shop",
  navBook: "Book",
  openMenu: "Open menu",
  closeMenu: "Close menu",

  // ── Hero
  heroBadge: "Professional Cosmetician",
  heroTitle: "Beauty That Enhances Your Natural Glow",
  heroSubtitle:
    "Personalized skincare, makeup artistry, and beauty treatments crafted by Sarit Elkayam — because you deserve to look and feel extraordinary.",
  heroCta: "Book Your Appointment",
  heroViewServices: "View Services",

  // ── Services Preview
  servicesTitle: "Featured Services",
  servicesSubtitle:
    "Discover the treatments that will transform your skin and boost your confidence",
  servicesLearnMore: "Learn More",
  servicesViewAll: "View All Services",
  servicesDuration: "Duration",
  servicesPrice: "Price",
  servicesBadgePopular: "Most Popular",
  servicesBadgeEssential: "Essential",
  servicesBadgePremium: "Premium",
  servicesSignatureFacial: "Signature Facial",
  servicesSignatureFacialDesc:
    "A luxurious deep-cleansing facial tailored to your skin type, featuring gentle exfoliation, custom mask, and hydrating serum application.",
  servicesSkinAnalysis: "Skin Analysis & Consultation",
  servicesSkinAnalysisDesc:
    "Comprehensive skin assessment using advanced technology to identify your unique needs and create a personalized treatment plan.",
  servicesBridalMakeup: "Bridal Makeup",
  servicesBridalMakeupDesc:
    "Flawless, long-lasting makeup artistry for your special day. Includes trial session and day-of application.",
  servicesBookThis: "Book This Service",

  // ── Testimonials
  testimonialsTitle: "What Our Clients Say",
  testimonialsSubtitle:
    "Real experiences from clients who trust Sarit with their beauty",
  testimonialsBadge: "Client Love",
  testimonialsSubtitlePage:
    "Don't just take our word for it — hear from real clients who have experienced the transformation.",
  testimonialsAverageRating: "Average rating from",
  testimonialsReviews: "reviews",
  testimonialsReady: "Ready to be our next happy client?",
  testimonialsBookAppointment: "Book Your Appointment",
  testimonialsViewServices: "View Services",

  // ── CTA Section
  ctaTitle: "Ready to Transform Your Look?",
  ctaSubtitle:
    "Book your appointment today and experience personalized beauty treatments designed just for you.",
  ctaPrimary: "Book Now",
  ctaSecondary: "Contact Me",

  // ── Services Page
  servicesPageTitle: "Professional Beauty Treatments",
  servicesPageBadge: "Our Services",
  servicesPageSubtitle:
    "Each treatment is customized to your unique needs. All products are premium, dermatologically tested, and cruelty-free.",
  servicesPageNotSure: "Not sure which treatment is right for you?",
  servicesPageRecommendation: "Get a Recommendation",
  servicesPageConsultation: "Book a Consultation",
  servicesCategoryFacials: "Facials",
  servicesCategorySkinAnalysis: "Skin Analysis",
  servicesCategoryBodyTreatments: "Body Treatments",
  servicesCategoryMakeup: "Makeup",

  // ── Contact
  contactBadge: "Get in Touch",
  contactTitle: "Contact Sarit",
  contactSubtitle:
    "Have questions about our services? Want to book an appointment? We'd love to hear from you.",
  contactSendTitle: "Send a Message",
  contactThankYou: "Thank you!",
  contactThankYouMsg:
    "Your message has been sent. Sarit will get back to you within 24 hours.",
  contactSendAnother: "Send Another Message",
  contactFullName: "Full Name",
  contactFullNamePlaceholder: "Your full name",
  contactEmail: "Email",
  contactEmailPlaceholder: "your@email.com",
  contactPhone: "Phone",
  contactPhonePlaceholder: "+972-50-000-0000",
  contactMessage: "Message",
  contactMessagePlaceholder:
    "Tell us about your skin goals, the service you're interested in, or any questions...",
  contactSendMessage: "Send Message",
  contactStudioTitle: "Studio Information",
  contactLocation: "Location",
  contactLocationDetail: "Tel Aviv, Israel",
  contactLocationNote: "(Exact address shared upon booking)",
  contactEmailLabel: "Email",
  contactPhoneLabel: "Phone",
  contactFollowUs: "Follow Us",
  contactHoursTitle: "Hours",
  contactSundayThursday: "Sunday – Thursday",
  contactFriday: "Friday",
  contactSaturday: "Saturday",
  contactClosed: "Closed",

  // ── Shop
  shopTitle: "Product Shop",
  shopBadge: "Recommended Products",
  shopSubtitle:
    "A curated selection of premium skincare and beauty products to complement your treatments. All products are dermatologically tested and cruelty-free.",
  shopAskAbout: "Ask About This Product",
  shopRecommendations: "Get Product Recommendations",
  shopBookTreatment: "Book a Treatment",
  shopConsultation:
    "Not sure which product is right for you? Contact us for a personalized consultation and recommendation.",

  // ── Products Preview (home page)
  productsTitle: "Featured Products",
  productsSubtitle:
    "A curated selection of premium skincare and beauty products to complement your treatments",
  productsViewAll: "View All Products",

  // ── Book
  bookBadge: "Online Booking",
  bookTitle: "Book Your Appointment",
  bookSubtitle:
    "Book an online appointment with Sarit Elkayam — fast, simple, and convenient",
  bookLoading: "Loading booking system...",
  bookErrorTitle: "Unable to load the booking system",
  bookErrorMsg:
    "The booking system didn't load in time. Click below to open it in a new window.",
  bookOpenExternal: "Open booking in a new window",

  // ── Blog
  blogTitle: "Beauty Tips & Insights",
  blogBadge: "Blog",
  blogSubtitle:
    "Expert advice, skincare routines, and beauty insights from professional cosmetician Sarit Elkayam.",
  blogNoPosts: "No blog posts yet. Check back soon for beauty tips!",
  blogReadTime: "min read",
  blogBackToBlog: "Back to Blog",
  blogCategory: "Category",
  blogPostNotFound: "Blog Post Not Found",
  blogReadMore: "Read More",
  blogViewAll: "View All Posts",

  // ── 404
  notFoundTitle: "Page Not Found",
  notFoundSubtitle:
    "The page you're looking for doesn't exist or has been moved. Don't worry — let's get you back to exploring our beauty services.",
  notFoundHome: "Home",
  notFoundGoBack: "Go Back",
  notFoundPopularPages: "Popular pages:",

  // ── Language toggle
  langHebrew: "עברית",
  langEnglish: "English",

  // ── Admin Panel
  adminDashboard: "Dashboard",
  adminBlog: "Blog Posts",
  adminTestimonials: "Testimonials",
  adminProducts: "Products",
  adminServices: "Services",
  adminSettings: "Settings",
  adminLogout: "Logout",
  adminSave: "Save",
  adminCancel: "Cancel",
  adminDelete: "Delete",
  adminAddNew: "Add New",
  adminConfirmDelete: "Confirm Delete",
  testimonialListTitle: "Manage Testimonials",
  testimonialListSubtitle: "Manage client testimonials and reviews",
  testimonialNewTitle: "New Testimonial",
  testimonialEditTitle: "Edit Testimonial",
  productListTitle: "Manage Products",
  productListSubtitle: "Manage your product catalog",
  productNewTitle: "New Product",
  productEditTitle: "Edit Product",
  serviceListTitle: "Manage Services",
  serviceListSubtitle: "Manage beauty treatments and services",
  serviceNewTitle: "New Service",
  serviceEditTitle: "Edit Service",
  settingsTitle: "Site Settings",
  settingsSubtitle: "Manage site-wide settings and configuration",
};

const dictionaries = { he, en };

type Locale = "he" | "en";
export type Translations = typeof he;

const COOKIE_NAME = "sk_locale";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

// ─── Helpers (SSR-safe) ──────────────────────────────────────────

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)};max-age=${COOKIE_MAX_AGE};path=/;SameSite=Lax`;
}

function getInitialLocale(): Locale {
  const stored = getCookie(COOKIE_NAME);
  if (stored === "he" || stored === "en") return stored;

  // Default to Hebrew
  return "he";
}

// ─── Context ──────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  isRtl: boolean;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "he",
  t: he,
  setLocale: () => {},
  isRtl: true,
});

// ─── Provider ─────────────────────────────────────────────────────

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setCookie(COOKIE_NAME, next);
  }, []);

  // Dynamically update <html dir> and lang when locale changes
  useEffect(() => {
    const dir = locale === "he" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale,
      isRtl: locale === "he",
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within LocaleProvider");
  }
  return ctx;
}

export default useTranslation;
