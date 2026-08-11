# Abdullah Bin Hossain (Faisal) — Website

Next.js 15 · TypeScript · Tailwind v4 · next-intl · Vercel
Design system: **Meridian** — see [DESIGN.md](./DESIGN.md)

Six locales (en · zh · ar · tr · de · fr) with full RTL for Arabic.
Content runs from typed local files today and switches to Notion with one
environment variable — no code change.

---

## Deploy in five minutes

```bash
npm install
cp .env.example .env.local     # set NEXT_PUBLIC_SITE_URL at minimum
npm run dev                    # http://localhost:3000
```

**To Vercel:**

1. Push this folder to a GitHub repo.
2. vercel.com → **Add New → Project** → import the repo. Framework detects as
   Next.js; leave every build setting on default.
3. **Settings → Environment Variables** — add the variables from
   `.env.example` to **Production, Preview and Development**. Only
   `NEXT_PUBLIC_SITE_URL` is required for a successful first build.
4. Deploy. Add the custom domain under **Settings → Domains** when you have one.

The build produces **126 pre-rendered pages** and about **103 kB** of shared
JavaScript.

---

## What I still need from you

### Blocking — the site cannot launch without these

| # | Item | Where it goes |
|---|---|---|
| 1 | **Professional portrait**, 2400 px, 3:4 portrait crop | replace `public/portrait.jpg` |
| 2 | **CV as PDF** | replace `public/abdullah-faisal-cv.pdf` |
| 3 | **Confirm the "20 GW+" claim** — see *Claims to confirm* below | `src/config/site.ts` → `stats` |
| 4 | **Which clients may be named publicly** (NDAs) | `src/config/partners.ts`, `src/content/local/projects.ts` |
| 5 | **Verify every project `stage`** against reality | `src/content/local/projects.ts` |
| 6 | **Facebook profile URL** | `src/config/site.ts` → `socials.facebook` |

### Needed soon after launch

| Item | Where |
|---|---|
| Domain name | Vercel → Domains, and `NEXT_PUBLIC_SITE_URL` |
| Resend API key + verified sending domain | `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` |
| Real article copy | `src/content/local/insights.ts` |
| Project case-study bodies (`body` field) | `src/content/local/projects.ts` |
| Site and project photographs | `public/covers/`, then `cover:` on each project |
| Native review of the Chinese and Arabic copy | `src/messages/zh.json`, `ar.json` |

---

## ⚠ Claims to confirm before publishing

The site's credibility rests on these being exact. A foreign sponsor or lender
**will** probe them.

1. **"20 GW+ capacity engaged"** is the sum of every project touched at any
   stage — feasibility, bidding, development, supervision. It is *not* capacity
   built and energised. Either confirm the figure and keep the qualifier
   ("across the development lifecycle"), or replace it with a number Faisal can
   defend in a meeting.
2. **Project stages.** Each row in `src/content/local/projects.ts` carries a
   `stage`. Anything marked `Approved` or `Operational` that is really at
   feasibility is the fastest way to lose a serious counterparty.
3. **Named counterparties.** `src/config/partners.ts` lists Sumitomo, Reliance,
   Power China and others as a plain text ticker — deliberately not a logo wall,
   which would imply endorsement. Remove anything under NDA.
4. **`confidential: true`** on a project hides the client name automatically and
   renders "Confidential sponsor" instead. Use it liberally.

---

## Project structure

```
src/
├─ styles/
│  └─ tokens.css         ← THE re-skin file: every colour, font, radius, spacing
├─ config/
│  ├─ site.ts            single source of truth — name, URLs, socials, stats, locales
│  ├─ partners.ts        counterparty list
│  └─ theme.ts           the few token values non-CSS code needs (OG image)
├─ i18n/                 next-intl routing, navigation, request config
├─ messages/             en · zh · ar · tr · de · fr  (167 keys each, verified in parity)
├─ lib/
│  ├─ seo.ts             buildMetadata() + hreflang alternates — every page uses it
│  ├─ jsonld.ts          Person, ProfessionalService, BlogPosting, BreadcrumbList
│  ├─ format.ts          capacity labels, locale dates, reading time
│  ├─ rate-limit.ts      contact-form throttle
│  └─ cn.ts
├─ content/
│  ├─ types.ts           Project, Insight, ContentSource interface
│  ├─ index.ts           adapter selector (local ⇄ notion)
│  ├─ local/             typed data files — the default backend
│  └─ notion/            Notion adapter: client, props, block renderer
├─ components/
│  ├─ primitives/        Icon, Button, Reveal, Rail
│  ├─ layout/            Header, Footer, MobileDrawer, LanguageSwitcher, ThemeToggle, ThemeScript
│  ├─ sections/          Hero, Figures, Plates, Register, PartnerGrid, TechGrid, PostList, Timeline, CtaBand, ContactForm, SectionHead
│  └─ seo/               JsonLd
└─ app/
   ├─ [locale]/          layout · home · about · services · projects[/slug] · insights[/slug] · contact · 404 · opengraph-image
   ├─ api/contact/       Resend + honeypot + rate limit
   ├─ api/revalidate/    on-demand ISR refresh
   ├─ sitemap.ts         every page × every locale, with hreflang
   ├─ robots.ts          blocks indexing on preview deployments
   └─ globals.css        the component layer — every named visual class
```

Plus `scripts/validate-contrast.mjs` — reads `tokens.css` and checks 30 WCAG
pairs across both themes. Run it after any colour change.

### Why it is shaped this way

- **`styles/tokens.css` is the only place a visual value lives.** No component
  contains a hex code, a font name, or a px font-size. Re-skinning the site is
  one file.
- **Layout in Tailwind, appearance in named CSS classes.** Tailwind does grid,
  flex and spacing; everything visual is `.register`, `.plate`, `.t-title`.
  Restyling never means reading JSX, and the JSX stays legible.
- **`config/site.ts` is the only place a fact lives.** Change the phone number
  once and it updates the header, footer, contact page, JSON-LD and OG image.
- **Content is behind an interface.** `ContentSource` has four methods. `local`
  and `notion` both implement it, so pages never know which is active and
  switching backends is an env var, not a refactor.
- **SEO is centralised.** No page writes its own `<meta>`. Every one calls
  `buildMetadata()`, so canonical URLs, hreflang, Open Graph and Twitter cards
  can never drift apart.
- **Server Components by default.** Only five files are `'use client'` —
  Header, MobileDrawer, LanguageSwitcher, ThemeToggle, ContactForm and Reveal.
  Everything else ships zero JavaScript.
- **No icon library, no `clsx`, no `notion-to-md`.** Each is replaced by a small
  file we own. Fewer dependencies to break on upgrade.

---

## Performance

| Decision | Effect |
|---|---|
| Static generation for all 126 pages | HTML served from the CDN edge |
| Server Components everywhere except 6 files | ~103 kB shared JS |
| `next/font` self-hosting | zero layout shift, no render-blocking request |
| Inline SVG icons | no icon-library bundle |
| Theme applied by a blocking inline script | no flash of the wrong theme |
| Video facade instead of an iframe | third-party JS only loads on click |
| One shared IntersectionObserver for all reveals | O(visible), not O(total) |
| `optimizePackageImports` on next-intl | smaller client bundles |

Cache windows: home / projects / insights revalidate every **5 minutes**;
about / services / contact every **hour**.

---

## SEO checklist — what is already wired

- Per-page `title`, `description`, canonical URL
- `hreflang` alternates for all six locales plus `x-default`, on every page
- `sitemap.xml` with `xhtml:link` alternates per URL
- `robots.txt` — and preview deployments are set to `Disallow: /` so they can
  never outrank production
- JSON-LD: `Person`, `ProfessionalService`, `BlogPosting` / `VideoObject`,
  `CreativeWork`, `BreadcrumbList`
- Open Graph + Twitter cards, with an OG image generated per locale at the edge
- Semantic landmarks, a skip-to-content link, labelled form fields, visible
  focus rings, `prefers-reduced-motion` respected

**After the domain is live:** submit `sitemap.xml` in Google Search Console and
Bing Webmaster Tools, and set the six locales as alternate versions.

---

## Switching to Notion

The Notion adapter is written and type-checked. When Faisal's workspace is ready:

```bash
CONTENT_SOURCE=notion
NOTION_TOKEN=ntn_xxx
NOTION_INSIGHTS_DS=...
NOTION_PROJECTS_DS=...
```

```bash
npm run notion:ids     # prints the data source IDs the integration can see
```

See `NOTION-SETUP.md` for the database schemas and the connection steps.
Note that this uses `dataSources.query` on API version `2026-03-11` —
`databases.query` no longer exists, so older tutorials will not work.

If `CONTENT_SOURCE=notion` but the token is missing, the site logs a warning and
falls back to local content rather than failing the build.

---

## Commands

```bash
npm run dev         # dev server
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run contrast    # validate the palette — 30 WCAG checks, both themes
npm run notion:ids  # list Notion data source IDs
```

## Verified

| Check | Result |
|---|---|
| `npm run typecheck` | 0 errors |
| `npm run contrast` | 30/30 pass, both themes |
| `npm run build` | 126 static pages · 103 kB shared JS · middleware registered |
| All 6 locales | 200 OK · Arabic renders `dir="rtl"` |
| `/`, `/about`, `/projects` with no locale | 307 → `/en/...` |
| Horizontal overflow | 0px at 360 / 375 / 390 / 430 / 768 / 1024 / 1440 / 2560px |
