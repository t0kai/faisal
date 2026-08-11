import type { Locale } from '@/config/site'

export const TECHNOLOGIES = [
  'Solar PV', 'BESS', 'LNG & FSRU', 'Gas / CCPP', 'Coal', 'Transmission', 'Waste-to-Energy',
] as const
export type Technology = (typeof TECHNOLOGIES)[number]

export const STAGES = [
  'Feasibility', 'Bidding', 'Development', 'Approved', 'Construction', 'Operational',
] as const
export type Stage = (typeof STAGES)[number]

export type Project = {
  slug: string
  title: string
  summary: string
  capacityMW: number | null
  technology: Technology[]
  stage: Stage
  /** null when `confidential` is true — never leak the name through the type. */
  client: string | null
  confidential: boolean
  location: string | null
  role: string | null
  year: number | null
  metrics: string[]
  cover: string | null
  featured: boolean
  order: number
  /** HTML body for the case-study page. Empty string = index entry only. */
  body: string
}

export type Insight = {
  slug: string
  title: string
  excerpt: string
  type: 'Article' | 'Video'
  videoUrl: string | null
  cover: string | null
  tags: string[]
  date: string | null
  readingMinutes: number
  body: string
}

/**
 * The contract every content backend implements.
 * `local` and `notion` are interchangeable — pages never know which is active.
 */
export interface ContentSource {
  getProjects(locale: Locale, opts?: { featuredOnly?: boolean; limit?: number }): Promise<Project[]>
  getProject(locale: Locale, slug: string): Promise<Project | null>
  getInsights(locale: Locale, opts?: { limit?: number }): Promise<Insight[]>
  getInsight(locale: Locale, slug: string): Promise<Insight | null>
}
