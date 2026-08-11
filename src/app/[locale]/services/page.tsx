import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { serviceSchema, breadcrumbSchema } from '@/lib/jsonld'
import { content } from '@/content'
import { PageTop, SectionHead } from '@/components/sections/SectionHead'
import { Plates } from '@/components/sections/Plates'
import { TechGrid } from '@/components/sections/TechGrid'
import { CtaBand } from '@/components/sections/CtaBand'
import { JsonLd } from '@/components/seo/JsonLd'

export const revalidate = 3600
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.services' })
  return buildMetadata({ locale, path: '/services', title: t('title'), description: t('description') })
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })
  const projects = await (await content()).getProjects(locale)

  return (
    <>
      <PageTop title={t.rich('services.title', { em: c => <em>{c}</em> })} lede={t('services.lede')} />

      <section className="section">
        <div className="shell"><Plates showIcons /></div>
      </section>

      <section className="section-tight">
        <div className="shell">
          <SectionHead eyebrow={t('home.sections.coverage')} title={t.rich('tech.title', { em: c => <em>{c}</em> })} />
          <TechGrid projects={projects} />
        </div>
      </section>

      <CtaBand />
      <JsonLd data={[
        serviceSchema(locale, t('services.title'), t('services.lede')),
        breadcrumbSchema(locale, [{ name: t('nav.home'), path: '/' }, { name: t('nav.services'), path: '/services' }]),
      ]} />
    </>
  )
}
