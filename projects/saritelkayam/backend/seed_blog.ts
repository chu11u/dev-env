// Standalone blog post seeder — run: npx ts-node seed_blog.ts
import db from "./lib/db";

const STATUS_PUBLISHED = "PUBLISHED" as "PUBLISHED";

const posts = [
  {
    title: "הכירי את סוג העור שלך: מדריך מקיף",
    slug: "understanding-skin-types",
    excerpt:
      "לא בטוחה מה סוג העור שלך? למדי איך לזהות את סוג העור שלך ולבחור את המוצרים הנכונים.",
    content: `# הכירי את סוג העור שלך: מדריך מקיף

אחת השאלות הנפוצות ביותר שאני מקבלת מלקוחות היא: "איזה מוצר אני צריכה להשתמש?" התשובה תמיד מתחילה מאותו מקום — להכיר את סוג העור שלך.

## חמשת סוגי העור

### 1. עור נורמלי

**מאפיינים:** ייצור שמן מאוזן, פצעונים ספורים, גוון אחיד.
**מוצרים מומלצים:** קרם לחות קליל, משתף עדין, משחה SPF 30+.

### 2. עור יבש

**מאפיינים:** תחושת מתיחות, קילוף, מראה מת.
**רכיבים מומלצים:** חומצה היאלורונית, צראמידים, סקואלן.

### 3. עור שומני

**מאפיינים:** ברק לאורך היום, נקבוביות מוגדלות.
**רכיבים מומלצים:** ניאצינאמיד, BHA, קרם לחות קליל.

### 4. עור משולב

**מאפיינים:** אזור T שומני עם לחיים יבשות.

### 5. עור רגיש

**מאפיינים:** מגיב בקלות, אדמומיות, צריבה.

*לא בטוחה? בואי לפגישה אבחון עור חינם.*`,
    featuredImage: "/assets/blog/featured-skincare.png",
    publishedAt: "2026-05-05T09:00:00.000Z",
  },
  {
    title: "אמנות האיפור הטבעי",
    slug: "natural-makeup-guide",
    excerpt: "למדי איך להשיג מראה איפור טבעי ורענן שמדגיש את תווי הפנים שלך.",
    content: `# אמנות האיפור הטבעי

האיפור הטוב ביותר לא נראה כמו איפור — הוא נראה כמו *את*.

## הכנת העור

- **ניקוי** עם משתף עדין
- **לחות** קלילה
- **פריימר** למילוי קמטים

## כיסוי קל

- קרם לחות מצבע
- מכסה רק במקומות הדרושים

## חום וממד

- **סומק קרם** על לחיים
- **הייлайטר** על עצמות גבוהות

## עיניים וגבות

- **גבות** מוסחות עם עיפרון
- **סומק** ניטרלי
- **משקל** שכה אחת חומה

*תאמי ייעוץ למראה מותאם אישית.*`,
    featuredImage: "/assets/blog/featured-beauty-tip.png",
    publishedAt: "2026-05-10T14:00:00.000Z",
  },
  {
    title: "5 חיוניים לקיץ",
    slug: "summer-skincare-essentials",
    excerpt: "גלי את המוצרים והשגרות החיוניים לטיפוח עור זוהר לקיץ.",
    content: `# 5 חיוניים לטיפוח עור לקיץ

## 1. הגנה מהשמש SPF 30+

כל בוקר, גם ימים מעוננים.

## 2. משתף עדין

מסיר זיהום מבלי לפגוע במחסום הלחות.

## 3. סרום לחות

עם חומצה היאלורונית.

## 4. אנטי-חמצון

ויטמין C או תה ירוק.

## 5. קילוף שבועי

AHA/BHA פעם בשבוע.

*תאמי ייעוץ לשגרה מותאמת אישית.*`,
    featuredImage: "/assets/blog/featured-seasonal.png",
    publishedAt: "2026-05-15T10:00:00.000Z",
  },
];

(async () => {
  const author = await db.author.findFirst({
    where: { name: "שרית אלקיים" },
  });
  let authorId: string;
  if (!author) {
    const a = await db.author.create({
      data: { name: "שרית אלקיים", email: "sarit@saritelkayam.com" },
    });
    authorId = a.id;
  } else {
    authorId = author.id;
  }

  for (const post of posts) {
    await db.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        status: STATUS_PUBLISHED,
        publishedAt: new Date(post.publishedAt),
        authors: { set: [{ id: authorId }] },
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        status: STATUS_PUBLISHED,
        publishedAt: new Date(post.publishedAt),
        authors: { connect: { id: authorId } },
      },
    });
    console.log("✅", post.title);
  }
  console.log("✅ All blog posts seeded!");
})();
