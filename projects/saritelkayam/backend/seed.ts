// Seed script for Phase 8A — populate new CMS tables with existing hardcoded data
// Run: npx ts-node seed.ts (inside backend container)
import db from "./lib/db";

async function main() {
	console.log("Seeding CMS tables...");

	// ─── Testimonials ─────────────────────────────────────
	const testimonials = [
		{
			nameEn: "Rachel M.",
			nameHe: "רחל מ'",
			textEn: "Sarit is absolutely amazing! My skin has never looked better. The facial was relaxing and the results were immediate. I walked out feeling like a new person.",
			textHe: "שרית פשוט מדהימה! העור שלי מעולם לא נראה טוב יותר. הטיפול היה מרגיע והתוצאות מידיות — יצאתי מרגישה כאדם חדש.",
			serviceEn: "Signature Facial",
			serviceHe: "פילינג סיגניצ'ר",
			rating: 5,
			featured: true,
			sortOrder: 0,
		},
		{
			nameEn: "Dana K.",
			nameHe: "דנה כ'",
			textEn: "The skin analysis opened my eyes to what my skin really needs. Sarit's expertise and attention to detail made all the difference. Highly recommend!",
			textHe: "אבחון העור פתח את העיניים שלי — גיליתי מה שהעור שלי באמת צריך. המקצועיות והתשומת לב לפרטים של שרית עשו את כל ההבדל. ממליצה בחום!",
			serviceEn: "Skin Analysis",
			serviceHe: "אבחון עור",
			rating: 5,
			featured: true,
			sortOrder: 1,
		},
		{
			nameEn: "Maya L.",
			nameHe: "מאיה ל'",
			textEn: "Sarit did my bridal makeup and I looked flawless all day! The trial session put my mind at ease, and on the big day she was punctual, calm, and brilliant.",
			textHe: "שרית עשתה את איפור החתונה שלי והנראיתי מושלם כל היום! מפגש ההכנה השקט את הדעת שלי, וביום הגדול היא הייתה בדיוק בזמן, רגועה ומדהימה.",
			serviceEn: "Bridal Makeup",
			serviceHe: "איפור חתונה",
			rating: 5,
			featured: true,
			sortOrder: 2,
		},
		// Additional testimonials from testimonials/page.tsx
		{
			nameEn: "Sarah T.",
			nameHe: "שירה ת'",
			textEn: "I've been to many cosmeticians, but Sarit is on another level. The anti-aging facial was transformative — my skin feels 10 years younger!",
			textHe: "הייתי אצל הרבה קוסמטיקאיות, אבל שרית ברמה אחרת. הטיפול האנטי-אייג'ינג שינה את המראה — העור מרגיש צעיר ב-10 שנים!",
			serviceEn: "Anti-Aging Facial",
			serviceHe: "פילינג אנטי-אייג'ינג",
			rating: 5,
			featured: false,
			sortOrder: 3,
		},
		{
			nameEn: "Lea G.",
			nameHe: "ליאה ג'",
			textEn: "The acne clarifying facial completely changed my skin. After just 2 sessions, my breakouts reduced by 80%. Sarit knows exactly what works.",
			textHe: "טיפול הניקוי לאקנה שינה את העור שלי. אחרי רק 2 טיפולים, הפצעים פחתו ב-80%. שרית יודעת בדיוק מה עובד.",
			serviceEn: "Acne Clarifying Facial",
			serviceHe: "פילינג מנקה לאקנה",
			rating: 5,
			featured: false,
			sortOrder: 4,
		},
		{
			nameEn: "Niv R.",
			nameHe: "ניב ר'",
			textEn: "The hydrafacial was incredible — my skin was glowing and hydrated for weeks. I book every month now and wouldn't go anywhere else.",
			textHe: "טיפול ההידרה היה מדהים — העור היה זוהר ומלחלח למשך שבועות. אני מזמינה כל חודש ולא אתיישב אצל אף אחד אחר.",
			serviceEn: "Hydra-Glow Facial",
			serviceHe: "פילינג הידרו-ברק",
			rating: 5,
			featured: false,
			sortOrder: 5,
		},
		{
			nameEn: "Yael B.",
			nameHe: "יעל ב'",
			textEn: "The skin analysis was a game changer. I finally understand my skin type and have a clear treatment plan. The VISIA imaging was eye-opening.",
			textHe: "אבחון העור שינה את כל המשוואה. סוף סוף אני מבינה את סוג העור שלי ויש לי תוכנית טיפול ברורה. דימות ה-VISIA היה מפתיע.",
			serviceEn: "Skin Analysis & Consultation",
			serviceHe: "אבחון עור וייעוץ",
			rating: 5,
			featured: false,
			sortOrder: 6,
		},
		{
			nameEn: "Rani D.",
			nameHe: "ריקי ד'",
			textEn: "The body scrub and wrap was the most relaxing treatment I've had. My skin felt silky smooth and the aromatherapy was the cherry on top.",
			textHe: "פילינג הגוף והעטיפה היו הטיפול הכי מרגיע שחוויתי. העור מרגיש חלק וחלק והארומתרפיה הייתה הקינוח המושלם.",
			serviceEn: "Body Scrub & Wrap",
			serviceHe: "פילינג גוף ועטיפה",
			rating: 5,
			featured: false,
			sortOrder: 7,
		},
		{
			nameEn: "Tamir S.",
			nameHe: "טמיר ס'",
			textEn: "My hands have never looked this good! The hand treatment was luxurious and the gel polish lasted for weeks. Highly recommend for a treat yourself.",
			textHe: "הידיים שלי מעולם לא נראו טוב יותר! הטיפול לידיים היה מפנק וק הלה ג'ל החזיק שבועות. ממליצה בחום להטנק עצמית.",
			serviceEn: "Hand & Nail Treatment",
			serviceHe: "טיפול ידיים וציפורניים",
			rating: 5,
			featured: false,
			sortOrder: 8,
		},
		{
			nameEn: "Adar K.",
			nameHe: "אדר כ'",
			textEn: "The special event makeup was perfect! It lasted through the entire gala without any touch-ups. Sarit is a true professional.",
			textHe: "האיפור לאירוע המיוחד היה מושלם! הוא החזיק לאורך כל הערב ללא ניקודים. שרית היא מקצועית אמיתית.",
			serviceEn: "Special Event Makeup",
			serviceHe: "איפור לאירוע מיוחד",
			rating: 5,
			featured: false,
			sortOrder: 9,
		},
	];

	for (const t of testimonials) {
		await db.testimonial.create({ data: t });
	}
	console.log(`✅ Seeded ${testimonials.length} testimonials`);

	// ─── Products ──────────────────────────────────────────
	const products = [
		{
			nameEn: "Gentle Gel Cleanser",
			nameHe: "ג'ל ניקוי עדין",
			category: "Cleansers",
			descriptionEn: "A pH-balanced gel cleanser that removes impurities without stripping the skin's natural moisture barrier. Perfect for all skin types.",
			descriptionHe: "ג'ל ניקוי מאוזן pH שמסיר זיהום מבלי לפגוע במחסום הלחות הטבעי של העור. מושלם לכל סוגי העור.",
			price: "₪38",
			size: "150ml",
			image: "/assets/products/luxury-bottle.png",
			badge: "Best Seller",
			rating: 5,
			featured: true,
			sortOrder: 0,
		},
		{
			nameEn: "Vitamin C Brightening Serum",
			nameHe: "סרום ויטמין C מבהיר",
			category: "Serums",
			descriptionEn: "A potent 15% Vitamin C serum that brightens, evens skin tone, and boosts collagen production. Visible results in just 2 weeks.",
			descriptionHe: "סרום ויטמין C ריכוזי של 15% שמבהיר, מיישר גוון עור ומעודד ייצור קולגן. תוצאות נראות לעין כבר בתוך 2 שבועות.",
			price: "₪65",
			size: "30ml",
			image: "/assets/products/serum-bottle.png",
			badge: "Staff Pick",
			rating: 5,
			featured: true,
			sortOrder: 1,
		},
		{
			nameEn: "Hydrating Day Cream",
			nameHe: "קרם לחות יומי",
			category: "Moisturizers",
			descriptionEn: "Rich yet lightweight day cream with hyaluronic acid and ceramides. Provides 24-hour hydration and strengthens the skin barrier.",
			descriptionHe: "קרם יום עשיר אך קליל עם חומצה היאלורונית וצראמידים. מספק לחות ל-24 שעות ומחזק את מחסום העור.",
			price: "₪52",
			size: "50ml",
			image: "/assets/products/cream-jar.png",
			rating: 5,
			featured: false,
			sortOrder: 2,
		},
		{
			nameEn: "Night Recovery Cream",
			nameHe: "קרם לילה משקם",
			category: "Moisturizers",
			descriptionEn: "An intensive overnight treatment that repairs and regenerates while you sleep. Contains retinol, peptides, and plant stem cells.",
			descriptionHe: "טיפול לילה אינטנסיבי שמשקם ומחדש בזמן השינה. מכיל רטינול, פפטידים ותאי גזע צמחיים.",
			price: "₪72",
			size: "50ml",
			image: "/assets/products/cream-jar.png",
			rating: 4,
			featured: false,
			sortOrder: 3,
		},
		{
			nameEn: "Retinol Renewal Serum",
			nameHe: "סרום רטינול מחדיש",
			category: "Serums",
			descriptionEn: "A gentle 0.5% retinol serum that reduces fine lines, improves texture, and reveals younger-looking skin. Ideal for retinol beginners.",
			descriptionHe: "סרום רטינול עדין של 0.5% שמפחית קמטים, משפר מרקם וחושף עור צעיר יותר. אידיאלי למתחילים בשימוש ברטינול.",
			price: "₪58",
			size: "30ml",
			image: "/assets/products/serum-bottle.png",
			rating: 5,
			featured: false,
			sortOrder: 4,
		},
		{
			nameEn: "Mineral Sunscreen SPF 50",
			nameHe: "משחה מינרלית SPF 50",
			category: "Sun Protection",
			descriptionEn: "A lightweight, non-comedogenic mineral sunscreen with SPF 50. Invisible on all skin tones — no white cast. Reef-safe formula.",
			descriptionHe: "משחה להגנה מהשמש מינרלית קלילה ולא קומדוגנית עם SPF 50. בלתי נראה בכל גוונים — ללא סימן לבן. נוסחה בטוחה לשוניות האלמוגים.",
			price: "₪42",
			size: "50ml",
			image: "/assets/products/luxury-bottle.png",
			badge: "Essential",
			rating: 5,
			featured: true,
			sortOrder: 5,
		},
		{
			nameEn: "Exfoliating Toner (AHA/BHA)",
			nameHe: "טונר מקלף (AHA/BHA)",
			category: "Cleansers",
			descriptionEn: "A gentle chemical exfoliant with 5% glycolic acid and 1% salicylic acid. Use 2-3 times per week for smoother, brighter skin.",
			descriptionHe: "חומר קילוף כימי עדין עם 5% חומצה גליקולית ו-1% חומצה סליצילית. השתמשי 2-3 פעמים בשבוע לעור חלק ובהיר יותר.",
			price: "₪35",
			size: "200ml",
			image: "/assets/products/luxury-bottle.png",
			rating: 4,
			featured: false,
			sortOrder: 6,
		},
		{
			nameEn: "Peptide Eye Serum",
			nameHe: "סרום פפטידים לעיניים",
			category: "Serums",
			descriptionEn: "A targeted eye treatment that reduces dark circles, puffiness, and fine lines. Lightweight formula absorbs instantly without irritation.",
			descriptionHe: "טיפול ייעודי לעיניים שמפחית עיגולים כהים, נפיחות וקמטים עדינים. נוסחה קלילה שנבלעת מיידית ללא גירוי.",
			price: "₪48",
			size: "15ml",
			image: "/assets/products/serum-bottle.png",
			rating: 5,
			featured: false,
			sortOrder: 7,
		},
	];

	for (const p of products) {
		await db.product.create({ data: p });
	}
	console.log(`✅ Seeded ${products.length} products`);

	// ─── Services ──────────────────────────────────────────
	const services = [
		{
			category: "Facials",
			titleEn: "Signature Facial",
			titleHe: "פילינג סיגניצ'ר",
			descriptionEn: "A luxurious deep-cleansing facial tailored to your skin type, featuring gentle exfoliation, custom mask, and hydrating serum.",
			descriptionHe: "פילינג מפנק ומעמיק המותאם לסוג העור שלך, הכולל קילוף עדין, מסכה מותאמת אישית והזרמת סרום מלחלח.",
			duration: "60 min",
			price: "₪120",
			featuresEn: ["Deep cleansing", "Custom mask", "Hydrating serum", "Moisturizer"],
			featuresHe: ["ניקוי עמוק", "מסכה מותאמת", "סרום מלחלח", "קרם לחות"],
			sortOrder: 0,
		},
		{
			category: "Facials",
			titleEn: "Anti-Aging Facial",
			titleHe: "פילינג אנטי-אייג'ינג",
			descriptionEn: "Advanced treatment targeting fine lines and wrinkles with collagen-boosting serums and microcurrent therapy.",
			descriptionHe: "טיפול מתקדם להפחתת קמטים עדינים וקמטים, הכולל הזרמת סרום לעידוד ייצור קולגן וטיפול במיקרו-זרם.",
			duration: "75 min",
			price: "₪160",
			featuresEn: ["Microcurrent therapy", "Peptide serum", "Eye treatment", "Neck & décolleté"],
			featuresHe: ["טיפול במיקרו-זרם", "סרום פפטידים", "טיפול באזור העיניים", "טיפול בצוואר ובדקולטה"],
			sortOrder: 1,
		},
		{
			category: "Facials",
			titleEn: "Acne Clarifying Facial",
			titleHe: "פילינג מנקה לאקנה",
			descriptionEn: "Targeted treatment for blemish-prone skin with deep pore cleansing, antibacterial masks, and soothing botanicals.",
			descriptionHe: "טיפול ממוקד לעור נוטה לאקנה, הכולל ניקוי עמוק של הנקבוביות, מסכה אנטיבקטריאלית ורכיבים צמחיים מרגיעים.",
			duration: "60 min",
			price: "₪130",
			featuresEn: ["Deep pore cleansing", "Antibacterial mask", "LED light therapy", "Non-comedogenic moisturizer"],
			featuresHe: ["ניקוי עמוק של הנקבוביות", "מסכה אנטיבקטריאלית", "טיפול באור LED", "קרם לחות לא קומדוגני"],
			sortOrder: 2,
		},
		{
			category: "Facials",
			titleEn: "Hydra-Glow Facial",
			titleHe: "פילינג הידרו-ברק",
			descriptionEn: "Intense hydration treatment using hyaluronic acid and vitamin C for a radiant, dewy complexion.",
			descriptionHe: "טיפול לחות אינטנסיבי עם חומצה היאלורונית וויטמין C למראה זוהר ולחות עמוקה.",
			duration: "60 min",
			price: "₪140",
			featuresEn: ["Hydra-dermabrasion", "Vitamin C infusion", "Brightening mask", "SPF application"],
			featuresHe: ["הידרו-דרמבראזיה", "הזרמת ויטמין C", "מסכה מבהירה", "הגנת SPF"],
			sortOrder: 3,
		},
		{
			category: "Skin Analysis",
			titleEn: "Skin Analysis & Consultation",
			titleHe: "אבחון עור וייעוץ",
			descriptionEn: "Comprehensive skin assessment using advanced VISIA technology to identify your unique needs.",
			descriptionHe: "הערכת עור מקיפה באמצעות טכנולוגיית VISIA מתקדמת לזיהוי הצרכים הייחודיים שלך.",
			duration: "45 min",
			price: "₪80",
			featuresEn: ["VISIA 3D imaging", "Skin map report", "Personalized plan", "Product recommendations"],
			featuresHe: ["דימות תלת-ממדי VISIA", "דוח מפת עור", "תוכנית טיפול מותאמת אישית", "המלצות מוצרים"],
			sortOrder: 0,
		},
		{
			category: "Skin Analysis",
			titleEn: "Follow-Up Analysis",
			titleHe: "אבחון מעקב",
			descriptionEn: "Track your skin progress and adjust your treatment plan based on measurable results.",
			descriptionHe: "מעקב אחר התקדמות העור והתאמת תוכנית הטיפול בהתבסס על תוצאות מדידה.",
			duration: "30 min",
			price: "₪50",
			featuresEn: ["Progress comparison", "Plan adjustment", "New product suggestions"],
			featuresHe: ["השוואת התקדמות", "התאמת תוכנית", "המלצות מוצרים מעודכנות"],
			sortOrder: 1,
		},
		{
			category: "Body Treatments",
			titleEn: "Back Facial",
			titleHe: "טיפול גב וחזה",
			descriptionEn: "Deep cleansing treatment for back and chest acne, using specialized products and extractions.",
			descriptionHe: "טיפול ניקוי עמוק לאקנה בגב ובחזה, באמצעות מוצרים ייעודיים וטיפול הוצאת פצעים.",
			duration: "60 min",
			price: "₪110",
			featuresEn: ["Gentle exfoliation", "Extractions", "Antibacterial treatment", "Soothing mask"],
			featuresHe: ["קילוף עדין", "הוצאת פצעים", "טיפול אנטיבקטריאלי", "מסכה מרגיעה"],
			sortOrder: 0,
		},
		{
			category: "Body Treatments",
			titleEn: "Body Scrub & Wrap",
			titleHe: "פילינג גוף ועטיפה",
			descriptionEn: "Exfoliating body scrub followed by a nourishing wrap for silky, rejuvenated skin.",
			descriptionHe: "פילינג גוף מנקה לאחריו עטיפה מזינה לעור חלק וחיוני.",
			duration: "90 min",
			price: "₪150",
			featuresEn: ["Sugar scrub", "Seaweed wrap", "Hydrating lotion", "Aromatherapy"],
			featuresHe: ["פילינג סוכר", "עטיפת אצות", "קרם לחות לגוף", "ארומתרפיה"],
			sortOrder: 1,
		},
		{
			category: "Body Treatments",
			titleEn: "Hand & Nail Treatment",
			titleHe: "טיפול ידיים וציפורניים",
			descriptionEn: "Luxurious hand spa with cuticle care, exfoliation, hydrating mask, and manicure.",
			descriptionHe: "טיפול ספא מפנק לידיים הכולל טיפול בקוטיקולות, קילוף, מסכת לחות ומניקור.",
			duration: "45 min",
			price: "₪70",
			featuresEn: ["Cuticle care", "Exfoliating scrub", "Hydrating mask", "Gel polish option"],
			featuresHe: ["טיפול בקוטיקולות", "פילינג ידיים", "מסכת לחות", "אפשרות לק ג'ל"],
			sortOrder: 2,
		},
		{
			category: "Makeup",
			titleEn: "Bridal Makeup",
			titleHe: "איפור חתונה",
			descriptionEn: "Flawless, long-lasting makeup for your special day. Includes trial session and day-of application.",
			descriptionHe: "איפור מושלם ועמיד ליום המיוחד שלך. כולל מפגש הכנה ויישום ביום החתונה.",
			duration: "90 min",
			price: "₪250",
			featuresEn: ["Trial session", "Day-of application", "Touch-up kit", "Brow shaping included"],
			featuresHe: ["מפגש הכנה", "יישום ביום החתונה", "ערכת ניקודים", "עיצוב גבות כלול"],
			sortOrder: 0,
		},
		{
			category: "Makeup",
			titleEn: "Special Event Makeup",
			titleHe: "איפור לאירוע מיוחד",
			descriptionEn: "Professional makeup for galas, photoshoots, or any special occasion that calls for your best look.",
			descriptionHe: "איפור מקצועי לגאלות, צילומים, או כל אירוע שבו את רוצה להיראות במיטבך.",
			duration: "60 min",
			price: "₪150",
			featuresEn: ["Custom color palette", "Long-wear formula", "Setting spray", "Touch-up tips"],
			featuresHe: ["בחירת צבעים מותאמת אישית", "נוסחה עמידה", "ספריי קיבוע", "טיפים לניקודים"],
			sortOrder: 1,
		},
		{
			category: "Makeup",
			titleEn: "Everyday Glam",
			titleHe: "איפור יומי אלגנטי",
			descriptionEn: "Learn to achieve your perfect everyday look with a customized routine and application lesson.",
			descriptionHe: "למדי להשיג את המראה היומי המושלם שלך עם שגרה מותאמת אישית ושעור יישום.",
			duration: "60 min",
			price: "₪100",
			featuresEn: ["Technique lesson", "Product selection", "Step-by-step guide", "Take-home card"],
			featuresHe: ["שיעור טכניקות", "בחירת מוצרים", "מדריך צעד אחר צעד", "כרטיס המצא להביתה"],
			sortOrder: 2,
		},
	];

	for (const s of services) {
		await db.service.create({ data: s });
	}
	console.log(`✅ Seeded ${services.length} services`);

	// ─── Site Settings ─────────────────────────────────────
	const settings = [
		{ key: "siteName", valueEn: "Sarit Elkayam", valueHe: "שרית אלקיים", category: "general" },
		{
			key: "siteNameFull",
			valueEn: "Sarit Elkayam",
			valueHe: "שרית אלקיים",
			category: "general",
		},
		{
			key: "tagline",
			valueEn: "Professional cosmetician for your natural beauty",
			valueHe: "קוסמטיקאית מקצועית לטיפוח היופי הטבעי שלך",
			category: "general",
		},
		{ key: "phone", valueEn: "+972-50-000-0000", valueHe: "+972-50-000-0000", category: "contact" },
		{ key: "email", valueEn: "hello@saritelkayam.com", valueHe: "hello@saritelkayam.com", category: "contact" },
		{ key: "address", valueEn: "Beauty Street 123, Tel Aviv", valueHe: "רח' היופי 123, תל אביב", category: "contact" },
		{ key: "instagram", valueEn: "https://instagram.com/sarit.elkayam", valueHe: "https://instagram.com/sarit.elkayam", category: "social" },
		{ key: "facebook", valueEn: "https://facebook.com/sarit.elkayam", valueHe: "https://facebook.com/sarit.elkayam", category: "social" },
		{ key: "hoursSunThu", valueEn: "09:00 – 19:00", valueHe: "09:00 – 19:00", category: "hours" },
		{ key: "hoursFri", valueEn: "09:00 – 14:00", valueHe: "09:00 – 14:00", category: "hours" },
		{ key: "hoursSat", valueEn: "Closed", valueHe: "סגור", category: "hours" },
	];

	for (const s of settings) {
		await db.siteSetting.upsert({
			where: { key: s.key },
			update: { valueEn: s.valueEn, valueHe: s.valueHe, category: s.category },
			create: s,
		});
	}
	console.log(`✅ Seeded ${settings.length} settings`);

	console.log("✅ Seed complete!");
}

main()
	.catch((e) => {
		console.error("Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
