# DRIP EGYPT

متجر عربي RTL لبيع ثلاثة جاكيتات داخل مصر، مبني بـ Next.js App Router وTypeScript وTailwind CSS ويعمل على Vinext/Cloudflare Sites. الطلبات تُسعّر على الخادم وتُخزّن في D1، والسلة محفوظة محلياً في المتصفح.

## الوظائف

- ثلاثة منتجات فقط، بسعر 1,499 جنيه للقطعة.
- شحن ثابت 100 جنيه مرة واحدة لكل طلب، والدفع عند الاستلام.
- سلة تدعم المقاسات والكميات من 1 إلى 10 وتدمج العناصر المتطابقة.
- نموذج مصري يضم المحافظات الـ27 ويتحقق من أرقام 010/011/012/015.
- مراجعة نهائية، مفتاح idempotency لمنع تكرار الطلب، وhoneypot بسيط ضد البوتات.
- إعادة تسعير وتحقق كاملان على الخادم قبل الحفظ.
- لوحة إدارة محمية بتسجيل دخول المنصة، مع البحث والتصفية والتعديل والإلغاء والطباعة وتصدير CSV UTF-8.

## التشغيل المحلي

```bash
npm ci
npm run db:generate
npm run build
npm run dev
```

صفحة المتجر `/` ولوحة الإدارة `/admin`. على Vercel تظهر صفحة الدخول في `/admin/login`
وتستخدم `ADMIN_EMAILS` و`ADMIN_PASSWORD` من متغيرات البيئة. المعاينة المحلية على
OpenAI Sites تحاكي تسجيل الدخول عبر `/signin-with-chatgpt?return_to=/admin`.

## قاعدة البيانات

- مخطط D1/Drizzle: `db/schema.ts`
- هجرات D1: `drizzle/`
- بيانات المنتجات: `scripts/seed-products.sql`
- نسخة PostgreSQL/Supabase قابلة للنقل: `supabase/migrations/001_init.sql`

لا تُرسل مفاتيح خدمة قاعدة البيانات إلى المتصفح. كل إنشاء أو تعديل للطلبات يتم من مسارات الخادم فقط.

## الإدارة والفحص

الاستضافة الخاصة بالمالك تحمي الموقع ولوحة الإدارة افتراضياً. يمكن تقييد الإدارة أكثر بإعداد `ADMIN_EMAILS` كقائمة بريدية مفصولة بفواصل.

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## النشر

الإعداد الحالي مخصص لـ OpenAI Sites ويستخدم `.openai/hosting.json` مع D1. للنشر على Vercel/Supabase استخدم هجرة PostgreSQL المرفقة، واربط `getDb` بمخزن Supabase من الخادم فقط، ثم اضبط متغيرات البيئة في Vercel قبل `next build`.

