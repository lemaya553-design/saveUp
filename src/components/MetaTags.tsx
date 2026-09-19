import { useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { HOME } from '../lib/i18n/home'
import type { Lang } from '../lib/i18n/language'

const OG_LOCALE: Record<Lang, string> = { fr: 'fr_CA', en: 'en_CA' }

function setMetaContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute('content', content)
}

// index.html's static <title>/description/og:*/twitter:* tags are what a
// non-JS crawler sees on first fetch — necessarily one fixed language.
// Mounted on the landing page only, this keeps them (plus <html lang>) in
// sync with the active language for real visitors and any JS-aware
// unfurler, reusing HOME[lang].meta rather than a separate dictionary.
export function MetaTags() {
  const { lang } = useLanguage()

  useEffect(() => {
    const t = HOME[lang].meta
    const altLang: Lang = lang === 'fr' ? 'en' : 'fr'

    document.documentElement.lang = lang
    document.title = t.title
    setMetaContent('meta[name="description"]', t.description)
    setMetaContent('meta[property="og:title"]', t.title)
    setMetaContent('meta[property="og:description"]', t.description)
    setMetaContent('meta[property="og:locale"]', OG_LOCALE[lang])
    setMetaContent('meta[property="og:locale:alternate"]', OG_LOCALE[altLang])
    setMetaContent('meta[name="twitter:title"]', t.title)
    setMetaContent('meta[name="twitter:description"]', t.description)
  }, [lang])

  return null
}
