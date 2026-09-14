import { Link, useNavigate } from 'react-router-dom'
import { LegalSection as Section } from '../components/LegalSection'
import { useLanguage } from '../hooks/useLanguage'
import { LEGAL } from '../lib/i18n/legal'

const LAST_UPDATED = '10 août 2026'
const CONTACT_EMAIL = 'conditions@saveup.com'

export function Conditions() {
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const t = LEGAL[lang]
  const c = t.terms

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-muted transition-colors hover:text-ink"
      >
        {t.back}
      </button>

      <h1 className="mt-6 text-3xl font-bold text-ink">{c.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {t.lastUpdatedLabel} {LAST_UPDATED}
      </p>

      <p className="mt-6 text-[15px] leading-relaxed text-ink/90">
        {c.introBefore}
        <Link to="/confidentialite" className="text-accent hover:text-accent/80">
          {c.introLinkText}
        </Link>
        {c.introAfter}
      </p>

      <div className="mt-2">
        <Section title={c.service.title}>
          <p>{c.service.para1}</p>
          <p>
            {c.service.para2Part1Before}
            <span className="text-ink">{c.service.para2Emphasis1}</span>
            {c.service.para2Part2Before}
            <span className="text-ink">{c.service.para2Emphasis2}</span>
            {c.service.para2After}
          </p>
        </Section>

        <Section title={c.account.title}>
          <ul className="ml-5 list-disc space-y-1.5">
            {c.account.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title={c.plans.title}>
          <p>{c.plans.intro}</p>
          <ul className="ml-5 list-disc space-y-1.5">
            {c.plans.items.map((item) => (
              <li key={item.label}>
                <span className="text-ink">{item.label}</span> — {item.desc}
              </li>
            ))}
          </ul>
          <p>
            {c.plans.para2Before}
            <span className="text-ink">{c.plans.para2Emphasis}</span>
            {c.plans.para2After}
          </p>
          <p>{c.plans.para3}</p>
          <p>
            {c.plans.para4Before}
            <span className="text-ink">{c.plans.stripe}</span>
            {c.plans.para4After}
          </p>
        </Section>

        <Section title={c.acceptableUse.title}>
          <p>{c.acceptableUse.intro}</p>
          <ul className="ml-5 list-disc space-y-1.5">
            {c.acceptableUse.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title={c.liability.title}>
          <p>{c.liability.para1}</p>
          <p>{c.liability.para2}</p>
          <p>{c.liability.para3}</p>
        </Section>

        <Section title={c.termination.title}>
          <p>
            {c.termination.para1Before}
            <Link to="/confidentialite" className="text-accent hover:text-accent/80">
              {c.termination.linkText}
            </Link>
            {c.termination.para1After}
          </p>
          <p>{c.termination.para2}</p>
        </Section>

        <Section title={c.changes.title}>
          <p>{c.changes.para1}</p>
        </Section>

        <Section title={c.governingLaw.title}>
          <p>{c.governingLaw.para1}</p>
        </Section>

        <Section title={c.contact.title}>
          <p>{c.contact.intro}</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-accent hover:text-accent/80">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="text-sm text-muted">{t.temporaryAddressNote}</p>
        </Section>
      </div>

      <p className="mt-10 border-t border-overlay/10 pt-6 text-sm text-muted">
        {c.footerBefore}
        <Link to="/confidentialite" className="text-accent hover:text-accent/80">
          {c.footerPrivacyLinkText}
        </Link>
        {c.footerMiddle}
        <Link to="/tarifs" className="text-accent hover:text-accent/80">
          {c.footerPricingLinkText}
        </Link>
        {c.footerAfter}
      </p>
    </div>
  )
}
