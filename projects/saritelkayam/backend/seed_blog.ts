// Standalone blog post seeder - run: npx ts-node seed_blog.ts
import db from "./lib/db";

const posts = [
  {
    title: "הכירי את סוג העור שלך: מדריך מקיף",
    slug: "understanding-skin-types",
    excerpt:
      "לא בטוחה מה סוג העור שלך? למדי איך לזהות את סוג העור שלך ולבחור את המוצרים הנכונים.",
    content:
      '# הכירי את סוג העור שלך: מדריך מקיף\n\nאחת השאלות הנפוצות ביותר שאני מקבלת מלקוחות היא: "איזה מוצר אני צריכה להשתמש?" התשובה תמיד מתחילה מאותו מקום — להכיר את סוג העור שלך.\n\n## חמשת סוגי העור\n\n### 1. עור נורמלי\n**מאפיינים:** ייצור שמן מאוזן, פצעונים ספורים, גוון אחיד.\n**מוצרים מומלצים:** קרם לחות קליל, משתף עדין, משחה SPF 30+.\n\n### 2. עור יבש\n**מאפיינים:** תחושת מתיחות, קילוף, מראה מת.\n**רכיבים מומלצים:** חומצה היאלורונית, צראמידים, סקואלן.\n\n### 3. עור שומני\n**מאפיינים:** ברק לאורך היום, נקבוביות מוגדלות.\n**רכיבים מומלצים:** ניאצינאמיד, BHA, קרם לחות קליל.\n\n### 4. עור משולב\n**מאפיינים:** אזור T שומני עם לחיים יבשות.\n\n### 5. עור רגיש\n**מאפיינים:** מגיב בקלות, אדמומיות, צריבה.\n\n*לא בטוחה? בואי לפגישה אבחון עור חינם.*',
    featuredImage: "/assets/blog/featured-skincare.png",
    status: "PUBLISHED",
    publishedAt: "2026-05-05T09:00:00.000Z",
  },
  {
    title: "אמנות האיפור הטבעי",
    slug: "natural-makeup-guide",
    excerpt: "למדי איך להשיג מראה איפור טבעי ורענן שמדגיש את תווי הפנים שלך.",
    content:
      "# אמנות האיפור הטבעי\n\nהאיפור הטוב ביותר לא נראה כמו איפור — הוא נראה כמו *את*.\n\n## הכנת העור\n- **ניקוי** עם משתף עדין\n- **לחות** קלילה\n- **פריימר** למילוי קמטים\n\n## כיסוי קל\n- קרם לחות מצבע\n- מכסה רק במקומות הדרושים\n\n## חום וממד\n- **סומק קרם** על לחיים\n- **הייлайטר** על עצמות גבוהות\n\n## עיניים וגבות\n- **גבות** מוסחות עם עיפרון\n- **סומק** ניטרלי\n- **משקל** שכה אחת חומה\n\n*תאמי ייעוץ למראה מותאם אישית.*",
    featuredImage: "/assets/blog/featured-beauty-tip.png",
    status: "PUBLISHED",
    publishedAt: "2026-05-10T14:00:00.000Z",
  },
  {
    title: "5 חיוניים לקיץ",
    slug: "summer-skincare-essentials",
    excerpt: "גלי את המוצרים והשגרות החיוניים לטיפוח עור זוהר לקיץ.",
    content:
      "# 5 חיוניים לטיפוח עור לקיץ\n\n## 1. הגנה מהשמש SPF 30+\nכל בוקר, גם ימים מעוננים.\n\n## 2. משתף עדין\nמסיר זיהום מבלי לפגוע במחסום הלחות.\n\n## 3. סרום לחות\nעם חומצה היאלורונית.\n\n## 4. אנטי-חמצון\nויטמין C או תה ירוק.\n\n## 5. קילוף שבועי\nAHA/BHA פעם בשבוע.\n\n*תאמי ייעוץ לשגרה מותאמת אישית.*",
    featuredImage: "/assets/blog/featured-seasonal.png",
    status: "PUBLISHED",
    publishedAt: "2026-05-15T10:00:00.000Z",
  },
];

(async () => {
  const author = await db.author.findFirst({ where: { name: "שרית אלקיים" } });
  let authorId;
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
        status: post.status,
        publishedAt: new Date(post.publishedAt),
        authors: { set: [{ id: authorId }] },
      },
      create: {
        ...post,
        publishedAt: new Date(post.publishedAt),
        authors: { connect: { id: authorId } },
      },
    });
    console.log("✅", post.title);
  }
  console.log("✅ All blog posts seeded!");
})();
