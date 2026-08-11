import { getTranslations } from 'next-intl/server'
import { site, type Locale } from '@/config/site'
import { Reveal } from '@/components/primitives/Reveal'

/**
 * The statistics strip. Values come from site.config so they are confirmed in
 * one place; labels and notes come from the message files so they translate.
 */
const FIGURES = [
  { key: 'years', value: () => site.stats.years, unit: 'YRS' },
  { key: 'capacity', value: () => site.stats.capacityGW, unit: 'GW+' },
  { key: 'projects', value: () => site.stats.projects, unit: '+' },
  { key: 'partners', value: () => site.stats.partners, unit: '+' },
] as const

export async function Figures({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'home.stats' })

  return (
    <div className="figures">
      <div className="shell figures-row">
        {FIGURES.map((f, i) => (
          <Reveal key={f.key} className="figure" delay={i * 60}>
            <span className="figure-key t-mono">{t(`${f.key}.label`)}</span>
            <div className="figure-value">
              {f.value()}
              <sup>{f.unit}</sup>
            </div>
            <p className="figure-note">{t(`${f.key}.note`)}</p>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
