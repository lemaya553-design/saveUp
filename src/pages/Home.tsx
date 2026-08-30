import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { LandingHeader } from '../components/LandingHeader'
import { StickyCta } from '../components/StickyCta'
import { LandingStepsPreview } from '../components/LandingStepsPreview'
import { LogoMark } from '../components/Logo'
import { Reveal } from '../components/Reveal'
import { AnimatedStats } from '../components/AnimatedStats'
import { HeroScoreGauge } from '../components/HeroScoreGauge'
import { SimulatorPreview } from '../components/SimulatorPreview'
import { ScreenshotCarousel } from '../components/ScreenshotCarousel'
import {
  BudgetIllustration,
  StatsIllustration,
  BadgesIllustration,
} from '../components/FeatureIllustrations'

function SlidersIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" d="M4 6h6M14 6h6M4 12h10M18 12h2M4 18h2M10 18h10" />
      <circle cx="11" cy="6" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="7" cy="18" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SparkleIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"
      />
    </svg>
  )
}

function ChatIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v10H8l-4 4V5z" />
    </svg>
  )
}

function TargetIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ImportIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

function LinkOffIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 15 5.5 18.5a2.5 2.5 0 0 1-3.5-3.5L5.5 11M15 9l3.5-3.5a2.5 2.5 0 0 1 3.5 3.5L18.5 12.5M3 3l18 18"
      />
    </svg>
  )
}

function EyeIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// Tailwind's scanner needs whole, literal class names — `bg-${color}/15`
// would never generate the right CSS, so each entry spells its own classes
// out in full instead of interpolating a color name at runtime.
const WHY_SAVEUP = [
  {
    Icon: SparkleIcon,
    iconClass: 'bg-primary/15 text-primary',
    title: 'Pensé pour rester simple',
    description:
      'Une interface pensée pour ne pas te prendre la tête — pas de jargon financier, pas d\'écrans interminables.',
  },
  {
    Icon: ChatIcon,
    iconClass: 'bg-accent/15 text-accent',
    title: 'Fait en français, pas traduit',
    description:
      'SaveUp est écrit en français dès le départ, pour des francophones — pas une traduction ajoutée après coup.',
  },
  {
    Icon: TargetIcon,
    iconClass: 'bg-success/15 text-success',
    title: 'Un vrai plan, pas juste un suivi',
    description:
      'Pas juste un suivi de dépenses : un vrai plan pour atteindre tes objectifs d\'épargne, avec un rythme calculé pour toi.',
  },
] as const

const PRIVACY_POINTS = [
  'Seulement les données que tu entres toi-même — tes dépenses, tes objectifs — ou que tu importes depuis un fichier CSV.',
  'Aucune connexion directe à ton compte bancaire : SaveUp ne se branche sur rien, tu gardes le contrôle de ce qui entre dans l\'app.',
  'Ces données servent uniquement à te montrer tes propres statistiques. Elles ne sont jamais vendues ni partagées.',
]

const COMPARISON_ROWS = [
  {
    label: 'Suivi dans le temps',
    saveup: 'Historique et tendances calculés automatiquement',
    chatbot: 'Aucune mémoire d\'une conversation à l\'autre',
    excel: 'Aucun suivi automatique dans le temps',
  },
  {
    label: 'Mise à jour',
    saveup: 'Automatique, dès que tu ajoutes une dépense',
    chatbot: 'Il faut tout réexpliquer à chaque fois',
    excel: 'Calculs manuels à refaire',
  },
  {
    label: 'Alertes',
    saveup: 'Alertes automatiques avant que ça dérape',
    chatbot: 'Il faut penser à demander à chaque fois',
    excel: 'Aucune alerte',
  },
  {
    label: 'Visualisation',
    saveup: 'Graphiques, jauges et barres de progression',
    chatbot: 'Pas de visuel, tout est en texte',
    excel: 'Des chiffres dans des cellules',
  },
  {
    label: 'Motivation',
    saveup: 'Badges de progression qui évoluent',
    chatbot: 'Rien qui suit ta progression',
    excel: 'Rien qui suit ta progression',
  },
]

const FAQ_ITEMS = [
  {
    question: 'C\'est quoi SaveUp ?',
    answer:
      'Un outil de budget simple qui suit ton revenu, tes dépenses fixes et tes objectifs d\'épargne, et qui te donne un score de santé financière qui évolue avec toi.',
  },
  {
    question: 'Combien ça coûte ?',
    answer:
      'Le plan Gratuit est gratuit pour toujours, sans limite de temps. Standard (7,99 $/mois) et Premium (14,99 $/mois) débloquent les catégories et objectifs illimités, l\'import CSV, les statistiques complètes et plus — voir la page Tarifs pour le détail.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Oui — chaque compte est protégé par un vrai système d\'authentification, et tes données sont isolées : personne d\'autre ne peut y accéder, peu importe qui utilise SaveUp. Elles sont hébergées sur une base de données sécurisée (Supabase).',
  },
  {
    question: 'Dois-je créer un compte ?',
    answer:
      'Oui, un compte gratuit est nécessaire pour que tes données restent privées et liées à toi seul(e) — ça prend moins de 2 minutes, sans carte requise.',
  },
  {
    question: 'Puis-je annuler ?',
    answer:
      'Oui, en tout temps, sans engagement. Le plan Gratuit reste gratuit sans limite ; pour Standard ou Premium, annule quand tu veux depuis Paramètres → Gérer mon abonnement — tu gardes l\'accès jusqu\'à la fin de la période déjà payée.',
  },
]

export function Home() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    target?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  return (
    <div>
      <LandingHeader />

      {/* Hero — asymmetric, full-bleed, ambient gradient mesh + oversized
          watermark logo behind the content. */}
      <section className="relative isolate overflow-hidden px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <div className="mesh-blob-a absolute left-[-10%] top-[-15%] h-[32rem] w-[32rem] rounded-full bg-primary/25 blur-[100px]" />
          <div className="mesh-blob-b absolute right-[-15%] top-[5%] h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-[100px]" />
          <div className="mesh-blob-c absolute bottom-[-20%] left-[20%] h-[26rem] w-[26rem] rounded-full bg-success/10 blur-[110px]" />
        </div>

        <LogoMark className="pointer-events-none absolute -right-16 -top-16 -z-10 h-[26rem] w-[26rem] opacity-[0.05] sm:h-[34rem] sm:w-[34rem]" />

        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="text-center lg:text-left">
            <div className="flex justify-center gap-3 lg:justify-start">
              <LogoMark className="h-10 w-10" animated />
              <span className="inline-flex items-center gap-1.5 self-center rounded-full border border-overlay/10 bg-overlay/5 px-3 py-1.5 text-xs font-medium text-muted">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
                100% gratuit pour commencer
              </span>
            </div>

            <h1 className="mx-auto mt-7 max-w-xl text-[clamp(2.75rem,6vw,4.75rem)] font-black leading-[1.02] tracking-tight text-ink text-balance lg:mx-0">
              Tu veux économiser{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
                plus facilement
              </span>{' '}
              ?
            </h1>
            <p className="mx-auto mt-6 max-w-md text-lg text-muted lg:mx-0">
              SaveUp t'aide à suivre tes dépenses, ton budget et tes objectifs d'épargne — au même
              endroit, sans compliqué.
            </p>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                to="/dashboard"
                className="btn-sheen rounded-lg bg-primary-strong px-7 py-3.5 font-semibold text-white shadow-[0_0_30px_rgba(74,108,247,0.4)] transition-all hover:brightness-110 hover:shadow-[0_0_45px_rgba(74,108,247,0.55)]"
              >
                Essayer gratuitement
              </Link>
              <a
                href="#fonctionnalites"
                className="rounded-lg border border-overlay/20 px-7 py-3.5 font-medium text-ink transition-colors hover:bg-overlay/5"
              >
                Voir ce que ça donne
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs text-muted lg:justify-start">
              {['Sans carte requise', 'Configuration en 2 min', '100% en français'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-overlay/10 bg-overlay/5 px-3 py-1.5"
                >
                  <span aria-hidden="true" className="text-success">
                    ✓
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glow-pulse absolute inset-8 -z-10 rounded-full bg-accent/25 blur-3xl" />
            <div className="float-bob glass rounded-3xl border-t border-t-overlay/20 p-8 shadow-2xl shadow-black/50">
              <HeroScoreGauge score={82} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats produit — honnêtes, pas de fausses statistiques d'usage */}
      <section className="border-y border-overlay/5 bg-overlay/[0.02] px-4 py-14 sm:px-6">
        <Reveal className="mx-auto max-w-4xl">
          <AnimatedStats />
        </Reveal>
      </section>

      {/* Pourquoi SaveUp — répond à "il existe déjà plein d'apps de budget"
          avant d'entrer dans le détail des fonctionnalités. */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[clamp(1.75rem,4vw,2.75rem)] font-black tracking-tight text-ink text-balance">
            Pourquoi SaveUp ?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted">
            Il existe déjà plein d'apps de budget. Voici ce qui change avec celle-ci.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {WHY_SAVEUP.map(({ Icon, iconClass, title, description }, i) => (
            <Reveal key={title} delayMs={i * 80}>
              <div className="glass h-full rounded-3xl border border-overlay/10 p-6 shadow-lg shadow-black/30">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 mt-4 text-lg font-semibold text-ink">{title}</h3>
                <p className="text-sm text-muted">{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Fonctionnalités — bento asymétrique plutôt qu'une grille uniforme */}
      <section id="fonctionnalites" className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[clamp(1.75rem,4vw,2.75rem)] font-black tracking-tight text-ink text-balance">
            Un outil, pas cinq onglets Excel.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted">
            Ce que tu vois dans l'app, dès les premières minutes.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-6">
          <Reveal className="sm:col-span-4 sm:row-span-2" delayMs={0}>
            <div
              className="bento-tile glass flex h-full flex-col rounded-3xl border border-overlay/10 p-7 shadow-lg shadow-black/30"
              style={{ '--tile-glow': 'rgba(139, 92, 246, 0.4)' } as React.CSSProperties}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <SlidersIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  Simulateur « et si »
                </span>
              </div>
              <h3 className="mb-1 mt-4 text-xl font-bold text-ink">Teste avant de trancher</h3>
              <p className="mb-6 text-sm text-muted">
                Coupe une dépense, avance une échéance — vois l'impact avant de le faire pour de
                vrai.
              </p>
              <div className="mt-auto rounded-2xl bg-overlay/5 p-5">
                <SimulatorPreview />
              </div>
            </div>
          </Reveal>

          <Reveal className="sm:col-span-2 sm:row-span-2" delayMs={80}>
            <div
              className="bento-tile glass flex h-full flex-col items-center justify-center rounded-3xl border border-overlay/10 p-6 text-center shadow-lg shadow-black/30"
              style={{ '--tile-glow': 'rgba(74, 108, 247, 0.4)' } as React.CSSProperties}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                Score de santé
              </span>
              <div className="mt-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-2xl font-black text-primary">
                82
              </div>
              <p className="mt-3 text-sm text-muted">
                Un chiffre qui résume tout, et qui bouge avec toi chaque semaine.
              </p>
            </div>
          </Reveal>

          <Reveal className="sm:col-span-2" delayMs={140}>
            <div
              className="bento-tile glass h-full rounded-3xl border border-overlay/10 p-6 shadow-lg shadow-black/30"
              style={{ '--tile-glow': 'rgba(74, 108, 247, 0.4)' } as React.CSSProperties}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Budget</span>
              <h3 className="mb-3 mt-1 font-semibold text-ink">Par catégorie</h3>
              <BudgetIllustration />
            </div>
          </Reveal>

          <Reveal className="sm:col-span-2" delayMs={200}>
            <div
              className="bento-tile glass h-full rounded-3xl border border-overlay/10 p-6 shadow-lg shadow-black/30"
              style={{ '--tile-glow': 'rgba(139, 92, 246, 0.4)' } as React.CSSProperties}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-accent">Statistiques</span>
              <h3 className="mb-3 mt-1 font-semibold text-ink">Tes tendances</h3>
              <StatsIllustration />
            </div>
          </Reveal>

          <Reveal className="sm:col-span-2" delayMs={260}>
            <div
              className="bento-tile glass h-full rounded-3xl border border-overlay/10 p-6 shadow-lg shadow-black/30"
              style={{ '--tile-glow': 'rgba(34, 197, 94, 0.4)' } as React.CSSProperties}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-success">Récompenses</span>
              <h3 className="mb-3 mt-1 font-semibold text-ink">Des badges mérités</h3>
              <BadgesIllustration />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Captures d'écran — l'app en vrai, pas des illustrations */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[clamp(1.75rem,4vw,2.75rem)] font-black tracking-tight text-ink text-balance">
            L'app, telle quelle.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted">
            Pas des maquettes — l'interface que tu utilises vraiment, page par page.
          </p>
        </Reveal>

        <Reveal delayMs={100} className="mt-12">
          <ScreenshotCarousel />
        </Reveal>
      </section>

      {/* CTA intermédiaire */}
      <section className="px-4 sm:px-6">
        <Reveal className="mx-auto max-w-4xl">
          <div className="glass flex flex-col items-center gap-4 rounded-3xl border border-overlay/10 p-8 text-center shadow-lg shadow-black/30 sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-lg font-semibold text-ink">Convaincu jusqu'ici ?</p>
              <p className="text-sm text-muted">Ton premier budget est prêt en 2 minutes.</p>
            </div>
            <Link
              to="/dashboard"
              className="btn-sheen whitespace-nowrap rounded-lg bg-primary-strong px-6 py-3 font-medium text-white transition-all hover:brightness-110"
            >
              Essayer gratuitement
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[clamp(1.75rem,4vw,2.75rem)] font-black tracking-tight text-ink text-balance">
            En 3 étapes, ton budget est prêt
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted">
            Teste la première étape tout de suite — les deux autres t'attendent dans l'app.
          </p>
        </Reveal>
        <Reveal delayMs={100} className="mt-10">
          <LandingStepsPreview />
        </Reveal>
      </section>

      {/* Tableau comparatif */}
      <section id="comparaison" className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[clamp(1.75rem,4vw,2.75rem)] font-black tracking-tight text-ink text-balance">
            SaveUp vs les alternatives
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted">
            Un chatbot répond bien à une question ponctuelle, et un tableur peut tout calculer —
            mais aucun des deux ne suit ton argent pour toi, jour après jour.
          </p>
        </Reveal>

        <Reveal delayMs={100}>
          <div className="glass mt-10 overflow-x-auto rounded-3xl border border-overlay/10 shadow-lg shadow-black/30">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-overlay/10 bg-overlay/5 text-left text-sm text-muted">
                  <th className="px-4 py-4 font-medium">&nbsp;</th>
                  <th className="px-4 py-4 font-black text-ink">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      SaveUp
                    </span>
                  </th>
                  <th className="px-4 py-4 font-medium">Chatbot gratuit</th>
                  <th className="px-4 py-4 font-medium">Tableur Excel</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-overlay/10 text-sm transition-colors last:border-b-0 hover:bg-overlay/5"
                  >
                    <th scope="row" className="px-4 py-4 text-left font-medium text-ink">
                      {row.label}
                    </th>
                    <td className="bg-primary/5 px-4 py-4 text-ink">
                      <span className="mr-2 text-success" aria-hidden="true">
                        ✓
                      </span>
                      {row.saveup}
                    </td>
                    <td className="px-4 py-4 text-muted">
                      <span className="mr-2 text-red-400" aria-hidden="true">
                        ✗
                      </span>
                      {row.chatbot}
                    </td>
                    <td className="px-4 py-4 text-muted">
                      <span className="mr-2 text-red-400" aria-hidden="true">
                        ✗
                      </span>
                      {row.excel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* Tes données, ta confidentialité — pas de "100% sécurisé" vague :
          ce qui est stocké, ce qui n'est jamais connecté, à quoi ça sert. */}
      <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[clamp(1.75rem,4vw,2.75rem)] font-black tracking-tight text-ink text-balance">
            Tes données, ta confidentialité
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted">
            Simple à expliquer : voici exactement ce que SaveUp sait sur toi, et ce qu'il en fait.
          </p>
        </Reveal>

        <Reveal delayMs={100}>
          <div className="glass mt-10 rounded-3xl border border-overlay/10 p-6 shadow-lg shadow-black/30 sm:p-8">
            <ul className="flex flex-col gap-5">
              {PRIVACY_POINTS.map((point, i) => (
                <li key={point} className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    {i === 0 ? (
                      <ImportIcon className="h-5 w-5" />
                    ) : i === 1 ? (
                      <LinkOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </span>
                  <p className="mt-1.5 text-sm text-muted sm:text-base">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Résultats — honnête, pas de fausses stats */}
      <section id="resultats" className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-bold text-ink">Résultats</h2>
          <div className="glass mx-auto mt-8 max-w-lg rounded-2xl p-8 shadow-lg shadow-black/30">
            <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              À venir
            </span>
            <p className="mt-4 text-sm text-muted">
              SaveUp est tout jeune — on n'a pas encore de résultats concrets d'utilisateurs à
              partager, et on ne va pas en inventer. Crée ton compte pour voir l'outil à l'œuvre
              avec tes propres chiffres.
            </p>
          </div>
        </Reveal>
      </section>

      {/* CTA final */}
      <section id="cta-final" className="relative isolate overflow-hidden px-4 py-28 text-center sm:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="mesh-blob-b absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        </div>
        <Reveal>
          <LogoMark className="mx-auto h-12 w-12" />
          <h2 className="mx-auto mt-6 max-w-2xl text-[clamp(2rem,5vw,3.25rem)] font-black tracking-tight text-ink text-balance">
            Prêt à voir clair dans tes finances ?
          </h2>
          <Link
            to="/dashboard"
            className="btn-sheen mt-8 inline-block rounded-lg bg-primary-strong px-9 py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(74,108,247,0.4)] transition-all hover:brightness-110"
          >
            Commencer gratuitement
          </Link>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
            {['Sans carte requise', 'Configuration en 2 minutes', 'Annule quand tu veux'].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-overlay/10 bg-overlay/5 px-3 py-1.5"
              >
                <span aria-hidden="true" className="text-success">
                  ✓
                </span>
                {label}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[clamp(1.75rem,4vw,2.75rem)] font-black tracking-tight text-ink text-balance">
            Questions fréquentes
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={item.question} delayMs={Math.min(i, 3) * 60}>
              <details className="group glass rounded-2xl border border-overlay/10 p-5 shadow-lg shadow-black/30 open:border-primary/30">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="ml-4 text-muted transition-transform group-open:rotate-180"
                  >
                    ⌄
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
      <StickyCta />
    </div>
  )
}
