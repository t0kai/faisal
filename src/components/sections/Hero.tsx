import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { site, type Locale } from '@/config/site'
import { Reveal } from '@/components/primitives/Reveal'
import { Rail } from '@/components/primitives/Rail'
import { Button } from '@/components/primitives/Button'
import { Icon } from '@/components/primitives/Icon'

export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'home.hero' })

  return (
    <div className="hero">
      {/* Decorative 12-column rule grid — the institutional cue. */}
      <div className="hero-grid" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => <span key={i} />)}
      </div>

      <div className="shell hero-body">
        <div>
          <Reveal><Rail>{t('eyebrow')}</Rail></Reveal>

          {/* Line breaks and the italic phrase are translator-controlled, so
              every language sets its own rhythm rather than inheriting English's. */}
          <Reveal as="h1" className="t-hero mt-7" delay={40}>
            {t.rich('title', { br: () => <br />, em: c => <em>{c}</em> })}
          </Reveal>

          <Reveal as="p" className="t-lede mt-7" delay={80}>{t('lede')}</Reveal>

          <Reveal className="btn-row mt-9" delay={120}>
            <Button href="/projects" icon="arrow">{t('ctaPrimary')}</Button>
            <Button href={site.cvPath} external variant="ghost" icon="download">{t('ctaSecondary')}</Button>
          </Reveal>

          <Reveal className="mt-7" delay={160}>
            <span className="availability"><i aria-hidden="true" />{t('availability')}</span>
          </Reveal>
        </div>

        <Reveal className="portrait" delay={100}>
          <Image src={site.portrait} alt={`${site.name} — ${site.jobTitle}`} fill priority
            sizes="(max-width: 960px) 58vw, 420px" className="object-cover" />
          <div className="portrait-caption t-mono">
            <span>ABH — {site.nickname}</span>
            <span>{site.location.city} / {site.location.countryCode}</span>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

/** Portrait placeholder, used until a real photo is dropped in. */
export function PortraitPlaceholder() {
  return (
    <div className="grid place-items-center text-center" style={{ color: 'var(--ink-3)' }}>
      <Icon name="person" strokeWidth={0.9} className="mx-auto mb-2.5 h-9 w-9 opacity-50" />
      <span className="t-mono">Portrait · 4:5</span>
    </div>
  )
}
