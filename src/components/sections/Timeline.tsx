import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/primitives/Reveal'

/**
 * Career history from the CV.
 *
 * Job titles live in the message files (they translate); organisation names
 * and project lines live here (they do not). To add a role, add an entry plus
 * an `about.roles.<key>` message in all six locales.
 */
export const CAREER = [
  {
    key: 'mz_director', when: '2024 — Present', org: 'MZ Consulting Services',
    lines: [
      '100 MW solar plant — government approved (JV-NEPCS-BMSTAR)',
      '400 MW solar under PPP guideline — Feemac Solar Limited',
    ],
  },
  {
    key: 'mz_consultant', when: '2022 — 2024', org: 'MZ Consulting Services',
    lines: [
      '1 GW + 20% BESS — Eleris Energy Global (Pacific Group, USA)',
      '2 × 100 MW grid-tied solar — Hosaf Group',
      '100 MW + 20% BESS — Sumitomo Corporation and East Coast Group',
      '101 MW + 15% BESS — Solen Energy · 50 MW + 20% BESS — JV Vapus-Novelty',
    ],
  },
  {
    key: 'rangunia', when: '2020 — 2022', org: 'Rangunia Solar Limited',
    lines: ['55 MW solar power plant, Rangunia, Chittagong', 'Local representation and project delivery'],
  },
  {
    key: 'xsergy', when: '2019 — 2020', org: 'XSERGY Limited',
    lines: [
      'Clients: Power China, State Grid, General Electric, Sterling & Wilson, Sonatrach',
      '2,000 MW phased solar (Chandpur) · 3,600 MW CCPP and LNG terminal',
      'Transmission and pipeline tenders — 400 kV, 230 kV, GTCL',
    ],
  },
  {
    key: 'reliance', when: '2017 — 2019', org: 'Reliance Bangladesh LNG & Power',
    lines: ['750 MW RLNG combined cycle, Narayanganj', '500 mmscfd LNG terminal, Kutubdia Island'],
  },
  {
    key: 'om', when: '2013 — 2016', org: 'O&M Solutions Bangladesh',
    lines: [
      'Feasibility, IEE, EIA and SIA across 1,320 MW / 350 MW / 225 MW studies',
      "Owner's engineer support — Ghorashal 365 MW and Bibiyana South 400 MW",
    ],
  },
] as const

export async function Timeline() {
  const t = await getTranslations('about.roles')

  return (
    <div>
      {CAREER.map((r, i) => (
        <Reveal key={r.key} className="tl-row" delay={Math.min(i, 6) * 40}>
          <span className="tl-when t-mono">{r.when}</span>
          <div>
            <div className="tl-org">{r.org}</div>
            <div className="tl-role">{t(r.key)}</div>
            <ul className="tl-list">
              {r.lines.map(l => <li key={l}>{l}</li>)}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
