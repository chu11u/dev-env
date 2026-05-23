import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LocaleWrapper from "@/components/layout/LocaleProvider";
import "@/styles/globals.css";

const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ["latin", "hebrew"],
  variable: "--font-frank-ruhl",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "שרית אלקיים | קוסמטיקאית מקצועית",
  description:
    "קוסמטיקאית מקצועית לטיפוח היופי הטבעי שלך. תאמי תור עוד היום לטיפולי עור, איפור, וטיפולי יופי מותאמים אישית.",
  openGraph: {
    title: "שרית אלקיים | קוסמטיקאית מקצועית",
    description: "קוסמטיקאית מקצועית לטיפוח היופי הטבעי שלך.",
    type: "website",
    locale: "he_IL",
  },
  twitter: {
    card: "summary",
    title: "שרית אלקיים | קוסמטיקאית מקצועית",
    description: "קוסמטיקאית מקצועית לטיפוח היופי הטבעי שלך.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${frankRuhlLibre.variable} ${heebo.variable}`}
    >
      <body className={`font-body bg-cream-50 text-charcoal-600 antialiased`}>
        <LocaleWrapper>
          <Header />
          <main className="min-h-screen" role="main">
            {children}
          </main>
          <Footer />
        </LocaleWrapper>
      </body>
    </html>
  );
}
