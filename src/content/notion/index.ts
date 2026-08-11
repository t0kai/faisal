import type { Locale } from '@/config/site'
import type { ContentSource, Project, Insight } from '../types'
import { coerceTechnology, coerceStage } from '../types'
import { notion, INSIGHTS_DS, PROJECTS_DS } from './client'
import { pTitle, pText, pSelect, pMulti, pNumber, pCheck, pUrl, pDate } from './props'
import { renderBlocks, plain } from './render'
import { readingTime } from '@/lib/format'

/* ── block fetching ───────────────────────────────────────── */

async function getBlocks(blockId: string, depth = 0): Promise<any[]> {
  if (depth > 3) return []           // guard against pathological nesting
  const out: any[] = []
  let cursor: string | undefined

  do {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 })
    for (const b of res.results as any[]) {
      if (b.has_children && b.type !== 'child_page') b.children = await getBlocks(b.id, depth + 1)
      out.push(b)
    }
    cursor = res.has_more ? (res.next_cursor as string) : undefined
  } while (cursor)

  return out
}

async function bodyOf(pageId: string): Promise<string> {
  try {
    return renderBlocks(await getBlocks(pageId))
  } catch (e) {
    console.error('[notion] failed to read blocks for', pageId, e)
    return ''
  }
}

/* ── mappers ──────────────────────────────────────────────── */

function toProject(page: any, body: string): Project {
  const p = page.properties
  const confidential = pCheck(p, 'Confidential')
  const title = pTitle(p, 'Title')

  // Drop unrecognised Technology options rather than letting them reach a
  // translation lookup that has no matching key.
  const technology = pMulti(p, 'Technology').flatMap(raw => {
    const match = coerceTechnology(raw)
    if (!match) console.warn(`[notion] "${title}": unknown Technology "${raw}" — ignored. Allowed: see TECHNOLOGIES in src/content/types.ts`)
    return match ? [match] : []
  })

  const rawStage = pSelect(p, 'Stage')
  const stage = coerceStage(rawStage)
  if (rawStage && stage !== rawStage) {
    console.warn(`[notion] "${title}": Stage "${rawStage}" not recognised — using "${stage}"`)
  }
  return {
    slug: pText(p, 'Slug'),
    title,
    summary: pText(p, 'Summary') || plain(body).slice(0, 180),
    capacityMW: pNumber(p, 'Capacity MW'),
    technology,
    stage,
    client: confidential ? null : pText(p, 'Client') || null,
    confidential,
    location: pText(p, 'Location') || null,
    role: pText(p, 'Role') || null,
    year: pNumber(p, 'Year'),
    metrics: ['Metric 1', 'Metric 2', 'Metric 3'].map(k => pText(p, k)).filter(Boolean),
    cover: pUrl(p, 'Cover URL'),
    featured: pCheck(p, 'Featured'),
    order: pNumber(p, 'Order') ?? 999,
    body,
  }
}

function toInsight(page: any, body: string): Insight {
  const p = page.properties
  return {
    slug: pText(p, 'Slug'),
    title: pTitle(p, 'Title'),
    excerpt: pText(p, 'Excerpt'),
    type: pSelect(p, 'Type') === 'Video' ? 'Video' : 'Article',
    videoUrl: pUrl(p, 'Video URL'),
    cover: pUrl(p, 'Cover URL'),
    tags: pMulti(p, 'Tags'),
    date: pDate(p, 'Date'),
    readingMinutes: readingTime(plain(body)),
    body,
  }
}

/* ── queries ──────────────────────────────────────────────── */

const published = (locale: Locale) => [
  { property: 'Published', checkbox: { equals: true } },
  { property: 'Language', select: { equals: locale } },
]

async function query(dataSourceId: string, filter: any, sorts: any[], pageSize = 100) {
  if (!dataSourceId) throw new Error('[notion] missing data source id — check NOTION_*_DS env vars')
  const res = await notion.dataSources.query({ data_source_id: dataSourceId, filter, sorts, page_size: pageSize })
  return res.results as any[]
}

export const notionSource: ContentSource = {
  async getProjects(locale, opts) {
    const and = published(locale)
    if (opts?.featuredOnly) and.push({ property: 'Featured', checkbox: { equals: true } } as any)

    const rows = await query(
      PROJECTS_DS,
      { and },
      [{ property: 'Order', direction: 'ascending' }],
      opts?.limit ?? 100,
    )
    // Index pages do not need block bodies — skipping them saves one API call per row.
    return rows.map(r => toProject(r, ''))
  },

  async getProject(locale, slug) {
    const rows = await query(
      PROJECTS_DS,
      { and: [...published(locale), { property: 'Slug', rich_text: { equals: slug } }] },
      [],
      1,
    )
    const page = rows[0]
    return page ? toProject(page, await bodyOf(page.id)) : null
  },

  async getInsights(locale, opts) {
    const rows = await query(
      INSIGHTS_DS,
      { and: published(locale) },
      [{ property: 'Date', direction: 'descending' }],
      opts?.limit ?? 100,
    )
    return rows.map(r => toInsight(r, ''))
  },

  async getInsight(locale, slug) {
    const rows = await query(
      INSIGHTS_DS,
      { and: [...published(locale), { property: 'Slug', rich_text: { equals: slug } }] },
      [],
      1,
    )
    const page = rows[0]
    return page ? toInsight(page, await bodyOf(page.id)) : null
  },
}
