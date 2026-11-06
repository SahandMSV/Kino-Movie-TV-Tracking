<div align="center">

# 🎬 کینو (Kino)

### کشف کن. ببین. به یاد بسپار.

فیلم‌ها و سریال‌هایت را پیگیری کن، یادداشت بنویس، پیشرفت قسمت‌ها را ثبت کن و بفهم بعدش چه ببینی.

<br />

**🌐 زبان: &nbsp; [English](README.md) &nbsp;|&nbsp; فارسی**

</div>

---

<div dir="rtl">

## درباره پروژه

کینو یک برنامه رایگان برای پیگیری فیلم و سریال است که برای دوستداران سینما ساخته شده. در حال حاضر نسخه **وب** آماده است و نسخه **اندروید** (با Expo / React Native) در مراحل اولیه توسعه قرار دارد.

دلیل شکل‌گیری این پروژه را در [docs/MANIFESTO.md](kino/docs/MANIFESTO.md) بخوانید (به زبان انگلیسی).

## امکانات

- **کشف**: فهرست‌های پرطرفدار هفته، فیلم‌های محبوب و سریال‌های محبوب در صفحه اصلی، به‌همراه جستجوی سریع فیلم، سریال و افراد.
- **صفحه جزئیات**: فیلم، سریال، بازیگران و عوامل، مجموعه‌های فیلم، تریلرها، پیشنهادها و وضعیت اکران (نشان «In theaters»).
- **پیگیری**: وضعیت‌های «برای دیدن»، «در حال دیدن»، «دیده‌شده»، «متوقف» و «رهاشده» برای هر عنوان.
- **امتیاز و یادداشت**: امتیاز ۱ تا ۱۰ ستاره و یادداشت خصوصی برای هر عنوان.
- **پیشرفت قسمت‌ها**: علامت‌زدن تک‌تک قسمت‌ها یا یک فصل کامل به‌عنوان دیده‌شده، همراه با نوار پیشرفت.
- **صفحه‌های لیست تماشا و پیشرفت**: شبکه‌های مجازی‌سازی‌شده با بارگذاری بی‌نهایت.
- **حساب کاربری**: ورود با ایمیل یا نام کاربری (Auth.js، نشست JWT).
- **تنظیمات**: نام نمایشی، پوسته (سیستم / روشن / تاریک)، زبان رابط و گزینه «همیشه از پوسترهای انگلیسی استفاده کن».
- **زبان‌ها**: رابط انگلیسی، آلمانی، فرانسوی و اسپانیایی با Tolgee (زبان فارسی هنوز به رابط برنامه اضافه نشده است).
- **Trakt**: اتصال از طریق OAuth (همگام‌سازی تاریخچه در برنامه است).
- **صفحه وضعیت**: داشبورد سلامت سرویس‌ها روی `status.localhost`.

## فناوری‌ها

| بخش       | فناوری                                                                   |
| --------- | ------------------------------------------------------------------------ |
| مونوریپو  | pnpm workspaces (به‌همراه پیکربندی Turborepo)                             |
| وب        | Next.js 16 (App Router)، React 19، TypeScript، React Compiler            |
| رابط      | Tailwind CSS 4، shadcn/ui (base-nova) روی Base UI، Framer Motion، Sonner |
| داده      | MongoDB با Mongoose و آداپتور MongoDB برای Auth.js                       |
| احراز هویت | Auth.js v5 (بتا)، ورود با اعتبارنامه، هش گذرواژه با bcrypt               |
| فراداده   | API سایت [TMDB](https://www.themoviedb.org/)                              |
| چندزبانگی | Tolgee (قالب ICU) و `next-themes` برای پوسته                             |
| موبایل    | Expo SDK 57، Expo Router، React Native 0.86                              |

## ساختار مخزن

</div>

```bash
.
├── kino/
│   ├── apps/
│   │   ├── web/        # Next.js web app
│   │   └── android/    # Expo (React Native) app, starter stage
│   ├── docs/           # Architecture, i18n and manifesto
│   └── ...             # Workspace config (pnpm, Turborepo, Prettier)
├── LICENSE
├── README.md
└── README.fa.md
```

<div dir="rtl">

## شروع کار (وب)

### پیش‌نیازها

- Node.js نسخه ۲۰ یا بالاتر
- pnpm
- یک نمونه MongoDB (محلی یا Atlas)
- یک حساب رایگان [TMDB](https://www.themoviedb.org/settings/api) برای دریافت توکن دسترسی خواندن API

### راه‌اندازی

</div>

```bash
cd kino/apps/web
pnpm install
```

<div dir="rtl">

فایل `kino/apps/web/.env.local` را بسازید (نمونه در [`kino/.env.example`](kino/.env.example)):

</div>

```bash
MONGODB_URI=mongodb://localhost:27017/kino
AUTH_SECRET=your-random-secret
TMDB_ACCESS_TOKEN=your-tmdb-read-access-token
TMDB_API_KEY=your-tmdb-api-key

# Optional: Trakt integration
TRAKT_CLIENT_ID=
TRAKT_CLIENT_SECRET=
TRAKT_REDIRECT_URI=http://localhost:3000/api/integrations/trakt/callback

# Optional: Tolgee in-context editing
NEXT_PUBLIC_TOLGEE_API_URL=
NEXT_PUBLIC_TOLGEE_API_KEY=
```

<div dir="rtl">

سرور توسعه را اجرا کنید:

</div>

```bash
pnpm dev
```

<div dir="rtl">

آدرس <http://localhost:3000> را باز کنید. صفحه وضعیت روی <http://status.localhost:3000> در دسترس است.

## برنامه اندروید

برنامه اندروید در مسیر `kino/apps/android` قرار دارد و هنوز بر پایه قالب اولیه Expo است. [README آن](kino/apps/android/README.md) را ببینید.

## مستندات

| سند                                                       | محتوا                                        |
| --------------------------------------------------------- | -------------------------------------------- |
| [معماری](kino/docs/ARCHITECTURE.md)                        | ساختار، جریان داده، مدل‌ها و یکپارچه‌سازی‌ها |
| [چندزبانگی](kino/docs/internationalization.md)             | نحوه کار ترجمه‌ها و افزودن زبان جدید         |
| [بیانیه](kino/docs/MANIFESTO.md)                           | چرایی ساخت کینو و اصول آن                    |

> مستندات داخل پوشه `docs` فعلاً فقط به زبان انگلیسی هستند.

## مجوز

حق چاپ © ۲۰۲۶ SahandMSV. تمام حقوق محفوظ است. کد منبع فقط برای مشاهده ارائه شده است؛ [LICENSE](LICENSE) را ببینید.

</div>
