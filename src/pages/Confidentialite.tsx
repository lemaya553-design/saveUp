import { Link, useNavigate } from 'react-router-dom'
import { LegalSection as Section } from '../components/LegalSection'
import { useLanguage } from '../hooks/useLanguage'
import { LEGAL } from '../lib/i18n/legal'

const LAST_UPDATED = '10 août 2026'
const CONTACT_EMAIL = 'confidentialite@saveup.com'

export function Confidentialite() {
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const t = LEGAL[lang]
  const p = t.privacy

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-muted transition-colors hover:text-ink"
      >
        {t.back}
      </button>

      <h1 className="mt-6 text-3xl font-bold text-ink">{p.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {t.lastUpdatedLabel} {LAST_UPDATED}
      </p>

      <p className="mt-6 text-[15px] leading-relaxed text-ink/90">
        {p.introBeforeAct}
        <span className="text-ink">{p.actName}</span>
        {p.introAfterAct}
      </p>

      <div className="mt-2">
        <Section title={p.dataCollected.title}>
          <p>{p.dataCollected.intro}</p>
          <ul className="ml-5 list-disc space-y-1.5">
            {p.dataCollected.items.map((item) => (
              <li key={item.label}>
                <span className="text-ink">{item.label}</span> — {item.desc}
              </li>
            ))}
          </ul>
          <p>{p.dataCollected.outro}</p>
        </Section>

        <Section title={p.dataUse.title}>
          <p>
            {p.dataUse.para1Before}
            <span className="text-ink">{p.dataUse.para1Emphasis}</span>
            {p.dataUse.para1After}
          </p>
          <p>{p.dataUse.para2}</p>
        </Section>

        <Section title={p.dataStorage.title}>
          <p>
            {p.dataStorage.para1Before}
            <span className="text-ink">{p.dataStorage.supabase}</span>
            {p.dataStorage.para1After}
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>{p.dataStorage.items[0]}</li>
            <li>
              {p.dataStorage.items[1].before}
              <span className="text-ink">{p.dataStorage.items[1].emphasis}</span>
              {p.dataStorage.items[1].after}
            </li>
            <li>{p.dataStorage.items[2]}</li>
          </ul>
        </Section>

        <Section title={p.rights.title}>
          <p>{p.rights.intro}</p>
          <ul className="ml-5 list-disc space-y-1.5">
            {p.rights.items.map((item) => (
              <li key={item.label}>
                <span className="text-ink">{item.label}</span> — {item.desc}
              </li>
            ))}
          </ul>
          <p>{p.rights.outro}</p>
        </Section>

        <Section title={p.retention.title}>
          <p>{p.retention.para1}</p>
          <p>
            {p.retention.para2Before}
            <span className="text-ink">{p.retention.days}</span>
            {p.retention.para2After}
          </p>
        </Section>

        <Section title={p.contact.title}>
          <p>{p.contact.intro}</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-accent hover:text-accent/80">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="text-sm text-muted">{t.temporaryAddressNote}</p>
        </Section>

        <Section title={p.cookies.title}>
          <p>
            {p.cookies.para1Before}
            <span className="text-ink">{p.cookies.para1Emphasis}</span>
            {p.cookies.para1After}
          </p>
          <p>
            {p.cookies.para2Before}
            <span className="text-ink">{p.cookies.localStorage}</span>
            {p.cookies.para2After}
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            {p.cookies.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{p.cookies.para3}</p>
        </Section>
      </div>

      <p className="mt-10 border-t border-overlay/10 pt-6 text-sm text-muted">
        {p.footerBefore}
        <Link to="/tarifs" className="text-accent hover:text-accent/80">
          {p.footerLinkText}
        </Link>
        {p.footerAfter}
      </p>
    </div>
  )
}
