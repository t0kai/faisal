import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { TECHNOLOGIES, type Technology, type Project } from '@/content/types'
import { Icon, type IconName } from '@/components/primitives/Icon'
import { Reveal } from '@/components/primitives/Reveal'

const TECH_ICON: Record<Technology, IconName> = {
  'Solar PV': 'solar',
  BESS: 'battery',
  'LNG & FSRU': 'tanker',
  'Gas / CCPP': 'flame',
  Coal: 'plant',
  Transmission: 'pylon',
  'Waste-to-Energy': 'recycle',
}

/** Counts are derived from the register, so they can never drift out of sync. */
export async function TechGrid({ projects }: { projects: Project[] }) {
  const t = await getTranslations()
  const counts = new Map<Technology, number>()
  for (const p of projects) for (const tech of p.technology) counts.set(tech, (counts.get(tech) ?? 0) + 1)

  return (
    <Reveal className="partner-grid">
      {TECHNOLOGIES.map(tech => (
        <Link key={tech} href="/projects">
          <Icon name={TECH_ICON[tech]} strokeWidth={1.2} className="mb-3 h-5 w-5" style={{ color: 'var(--accent)' }} />
          <span className="block" style={{ color: 'var(--ink)' }}>{t(`tech.${tech}`)}</span>
          <span className="t-mono mt-1.5 block" style={{ color: 'var(--ink-3)' }}>
            {t('register.projectCount', { count: counts.get(tech) ?? 0 })}
          </span>
        </Link>
      ))}
    </Reveal>
  )
}
