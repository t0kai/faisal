/**
 * Single source of truth for everything site-wide.
 * Change a value here and it propagates to metadata, sitemap, JSON-LD,
 * the header, the footer and the contact page. Nothing is hard-coded twice.
 */
export const LOCALES = ['en', 'zh', 'ar', 'tr', 'de', 'fr'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

/** Locales that render right-to-left. */
export const RTL_LOCALES: readonly Locale[] = ['ar']
export const isRtl = (l: Locale) => RTL_LOCALES.includes(l)

/** Native names for the language switcher — never translate these. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ar: 'العربية',
  tr: 'Türkçe',
  de: 'Deutsch',
  fr: 'Français',
}

/** BCP-47 tags for hreflang and <html lang>. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-Hans',
  ar: 'ar',
  tr: 'tr',
  de: 'de',
  fr: 'fr',
}

/**
 * Normalises whatever is in NEXT_PUBLIC_SITE_URL into a valid absolute origin.
 *
 * `new URL()` in the root layout's metadataBase throws on a bare domain, and
 * Next reports that as an opaque "error occurred in the Server Components
 * render" on a random page — one of the least debuggable failures there is.
 * So we repair the three mistakes people actually make instead:
 *
 *   abdullahfaisal.com        → https://abdullahfaisal.com
 *   https://site.com/         → https://site.com     (trailing slash)
 *   HTTPS://Site.com          → https://site.com     (case)
 *
 * Anything genuinely unparseable throws here, at config load, with a message
 * that names the variable.
 */
function resolveSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000'

  // Add a scheme if the value is a bare domain.
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`

  try {
    return new URL(withScheme).origin
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SITE_URL: "${raw}". ` +
        'Use a full origin including the scheme, e.g. https://abdullahfaisal.com',
    )
  }
}

export const site = {
  name: 'Abdullah Bin Hossain',
  shortName: 'Abdullah Faisal',
  nickname: 'Faisal',
  jobTitle: 'Power Business Professional',
  region: 'APAC',

  /**
   * Always a valid origin with no trailing slash — see resolveSiteUrl above.
   * Set NEXT_PUBLIC_SITE_URL in Vercel; falls back to the preview URL, then localhost.
   */
  url: resolveSiteUrl(),

  email: 'faisal473345@gmail.com',
  phone: '+8801719473385',
  phoneDisplay: '+880 1719 473385',
  whatsapp: '8801719473385',

  location: { city: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', timezone: 'GMT+6' },

  socials: {
    linkedin: 'https://www.linkedin.com/in/abdullah-faisal/',
    facebook: '', // TODO: add before launch
  },

  /** Verify these with Faisal before publishing — see README, "Claims to confirm". */
  stats: { years: 13, capacityGW: 20, projects: 30, partners: 10 },

  cvPath: '/abdullah-faisal-cv.pdf',
  portrait: '/portrait.jpg',
} as const

export const NAV = ['home', 'about', 'services', 'projects', 'insights', 'contact'] as const
export type NavKey = (typeof NAV)[number]

/** Route path per nav key. `home` is the locale root. */
export const NAV_PATH: Record<NavKey, string> = {
  home: '/',
  about: '/about',
  services: '/services',
  projects: '/projects',
  insights: '/insights',
  contact: '/contact',
}

/** Brand tokens mirrored from globals.css — used by the OG image generator. */
export const brand = {
  accent: '#CCFF00',
  accentInk: '#08090B',
  ink: '#08090B',
  fg: '#ECEEF1',
  fgMuted: '#8B94A1',
} as const
