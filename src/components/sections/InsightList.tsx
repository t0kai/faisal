import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Insight } from '@/content/types'
import type { Locale } from '@/config/site'
import { formatDate } from '@/lib/format'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

export async function InsightList({ posts }: { posts: Insight[] }) {
  const t = await getTranslations()
  const locale = (await getLocale()) as Locale

  return (
    <div className="rowset">
      {posts.map((p, i) => (
        <Reveal key={p.slug} delay={Math.min(i, 6) * 45}>
          <Link
            href={`/insights/${p.slug}`}
            className="group grid items-center gap-[clamp(12px,3vw,38px)] py-[clamp(20px,2.8vw,30px)] max-[760px]:grid-cols-[1fr_34px] max-[760px]:gap-y-2 lg:grid-cols-[110px_1fr_126px_38px]"
          >
            <span
              className={cn(
                'mono justify-self-start rounded-[4px] border px-2 py-1 max-[760px]:col-span-full',
                p.type === 'Video'
                  ? 'border-[var(--line2)] bg-[var(--ink3)] text-[var(--fg2)]'
                  : 'border-[var(--aline)] bg-[var(--asoft)] text-[var(--a)]',
              )}
            >
              {t(`insights.type.${p.type}`)}
            </span>

            <h3 className="font-normal transition-colors group-hover:text-[var(--a)]">{p.title}</h3>

            <span className="mono justify-self-end text-[var(--fg3)] max-[760px]:hidden">
              {p.type === 'Video'
                ? t('insights.watch', { minutes: p.readingMinutes })
                : t('insights.read', { minutes: p.readingMinutes })}
              {p.date && ` · ${formatDate(p.date, locale)}`}
            </span>

            <span className="grid h-[30px] w-[30px] place-items-center justify-self-end rounded-full border border-[var(--line2)] text-[var(--fg3)] transition duration-300 group-hover:rotate-[-45deg] group-hover:border-[var(--a)] group-hover:text-[var(--a)]">
              <Icon name="arrow" strokeWidth={2} width={12} height={12} />
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  )
}
