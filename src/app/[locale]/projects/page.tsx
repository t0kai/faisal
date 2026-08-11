import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/jsonld'
import { content } from '@/content'
import { PageTop } from '@/components/sections/SectionHead'
import { Register } from '@/components/sections/Register'
import { CtaBand } from '@/components/sections/CtaBand'
import { Reveal } from '@/components/primitives/Reveal'
import { JsonLd } from '@/components/seo/JsonLd'

export const revalidate = 300
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.projects' })
  return buildMetadata({ locale, path: '/projects', title: t('title'), description: t('description') })
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })
  const projects = await (await content()).getProjects(locale)

  return (
    <>
      <PageTop title={t.rich('projects.title', { em: c => <em>{c}</em> })} lede={t('projects.lede')} />
      <section className="section">
        <div className="shell">
          <Register projects={projects} />
          <Reveal className="notice mt-[clamp(28px,4vw,48px)]">{t('projects.disclaimer')}</Reveal>
        </div>
      </section>
      <CtaBand />
      <JsonLd data={breadcrumbSchema(locale, [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.projects'), path: '/projects' },
      ])} />
    </>
  )
}
