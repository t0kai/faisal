# Connecting the site to Notion

**Important:** Notion changed its API in a breaking way. Almost every tutorial you
will find online is now out of date — they use `databases.query` and a
`database_id`. That path is dead for new integrations.

The current model is:

```
Database  →  contains one or more  →  Data Sources  →  contain  →  Pages
```

You now query a **data source**, not a database. This guide uses:

- `@notionhq/client` **v5.24.0** (latest)
- `Notion-Version: 2026-03-11` (current)

---

## Step 1 — Create the integration

1. Go to **notion.so/profile/integrations**
2. **New integration** → Internal
3. Name it `Faisal Website`, pick Faisal's workspace
4. Capabilities: **Read content** only. Nothing else — the site never writes.
5. Copy the **Internal Integration Secret**. It starts with `ntn_`.

> This token is a password to the workspace. It goes in Vercel env vars, never in
> the repo, never in a screenshot.

---

## Step 2 — Build the two databases

Run this first — it prints the exact schema this codebase reads, generated from
the code itself so it can never be out of date:

```bash
npm run notion:schema
```

Create the databases to match it. The tables below are the same thing in prose.

In Notion, create a page called `Website` and add two **full-page databases**.

### Database A — `Insights`

| Property | Type | Options / notes |
|---|---|---|
| `Title` | Title | post headline |
| `Slug` | Text | `bpdb-unsolicited-proposal` — URL segment, lowercase, hyphens |
| `Type` | Select | `Article`, `Video` |
| `Video URL` | URL | only for Video |
| `Language` | Select | `en`, `zh`, `ar`, `tr`, `de`, `fr` |
| `Excerpt` | Text | 1–2 sentences — used in cards and as the meta description |
| `Cover URL` | URL | see the image note in Step 6 |
| `Tags` | Multi-select | Solar, BESS, LNG, Regulatory, PPA … |
| `Published` | Checkbox | **only checked rows go live** |
| `Date` | Date | publish date |

### Database B — `Projects`

| Property | Type | Options / notes |
|---|---|---|
| `Title` | Title | |
| `Slug` | Text | |
| `Language` | Select | same six |
| `Capacity MW` | Number | `1000` for 1 GW — store the number, format it in code |
| `Technology` | Multi-select | Solar PV, BESS, LNG & FSRU, Gas / CCPP, Coal, Transmission, Waste-to-Energy |
| `Stage` | Select | Feasibility, Bidding, Development, Approved, Construction, Operational |
| `Summary` | Text | one sentence; falls back to the first 180 chars of the page body |

> **Spell the select options exactly.** They are matched against the lists in
> `src/content/types.ts`. Case and spacing are forgiven — `solar pv` and
> `Solar_PV` both resolve to `Solar PV` — but a genuinely different name
> (`Solar`) is **dropped with a warning in the build log** rather than breaking
> the page. An unrecognised `Stage` falls back to `Development`, also with a
> warning. Check the build log after your first Notion deploy.
| `Client` | Text | |
| `Confidential` | Checkbox | if ticked, the site hides the client name |
| `Location` | Text | |
| `Role` | Text | |
| `Year` | Number | |
| `Metric 1` / `2` / `3` | Text | e.g. `20% BESS` |
| `Cover URL` | URL | |
| `Featured` | Checkbox | shows on the homepage |
| `Order` | Number | manual sort |
| `Published` | Checkbox | |

The page **body** of each row is the long-form content — that's what gets
rendered as the article or the case study.

---

## Step 3 — Connect the integration to each database

This is the step everyone forgets, and it produces a confusing
`object_not_found` error rather than a permissions error.

On each database page: **⋯ (top right) → Connections → `Faisal Website`** → Confirm.

Do it for **both** databases.

---

## Step 4 — Get the DATA SOURCE IDs (not the database IDs)

The ID in the URL is the *database* ID. You need the *data source* ID inside it.

Run the helper script:

```bash
npm i @notionhq/client
NOTION_TOKEN=ntn_xxx node scripts/list-datasources.mjs
```

It prints every database the integration can see, with its data source IDs:

```
Insights
  database_id    : 24f1b2c3-...
  data_source_id : 8a7c9d10-...   ← use this one
```

---

## Step 5 — Environment variables

Local `.env.local`, and in Vercel under **Settings → Environment Variables**:

```bash
NOTION_TOKEN=ntn_xxxxxxxxxxxxxxxxxxxxxxxx
NOTION_INSIGHTS_DS=8a7c9d10-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_PROJECTS_DS=3b2e5f41-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://abdullahfaisal.com
REVALIDATE_SECRET=any-long-random-string
```

Add them to **all three** Vercel environments (Production, Preview, Development),
otherwise preview builds fail with an unhelpful error.

---

## Step 6 — The image trap (read this one)

Files uploaded **into** Notion get temporary S3 URLs that **expire after about
one hour**. A statically generated page holding one of those URLs will show
broken images the next day. This is the single most common way a Notion-backed
site quietly breaks.

Three options, in order of how much I recommend them:

1. **`Cover URL` as a plain URL property** (what this setup uses) — host images
   in the repo under `/public/covers/` or on any image host, and paste the URL.
   Permanent, free, zero moving parts. **Recommended.**
2. **Vercel Blob** — on build, download the Notion file once and re-host it.
   Robust, but adds a dependency and a small cost.
3. **Use the Notion file URL directly** — only viable with a short ISR window
   (≤30 min). Fragile. Avoid.

---

## Step 7 — Drop in the code

```
lib/notion.ts                  ← client, queries, block renderer
scripts/list-datasources.mjs   ← the Step 4 helper
app/api/revalidate/route.ts    ← on-demand refresh endpoint
```

Install:

```bash
npm i @notionhq/client
```

Usage in a page:

```tsx
// app/[locale]/insights/page.tsx
import { getInsights } from '@/lib/notion'

export const revalidate = 300  // refresh every 5 minutes

export default async function Insights({ params }) {
  const { locale } = await params
  const posts = await getInsights(locale)
  return <PostList posts={posts} />
}
```

---

## Step 8 — Keeping the site in sync

**Default: ISR.** `export const revalidate = 300` means the page rebuilds at most
once every 5 minutes when someone visits. Faisal edits in Notion, waits a few
minutes, refreshes. No action needed. This is enough for a portfolio site.

**Instant updates (optional).** Hit the revalidate endpoint:

```
https://yoursite.com/api/revalidate?secret=YOUR_SECRET&path=/en/insights
```

Bookmark it, or wire it to a Notion database automation (Notion Business plan and
above) so publishing triggers it automatically.

---

## Common errors and what they actually mean

| Error | Real cause |
|---|---|
| `object_not_found` | Step 3 skipped — integration not connected to that database |
| `validation_error: database_id` | You passed a database ID where a data source ID is required |
| `Could not find data source` | Wrong ID, or the DB lives in a different workspace |
| `unauthorized` | Token wrong, or the integration was deleted/regenerated |
| Images 403 after a day | Step 6 — Notion file URLs expired |
| Works locally, empty on Vercel | Env vars not added to the Production environment |

---

## Cost

Free. Notion's API has no charge on any plan, including personal. The only limit
is roughly 3 requests/second, which ISR keeps you far below.
