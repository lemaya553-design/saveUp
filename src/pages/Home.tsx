import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { LandingHeader } from '../components/LandingHeader'
import { LandingDemoSimulator } from '../components/LandingDemoSimulator'
import { LandingStepsPreview } from '../components/LandingStepsPreview'

function RefreshIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a8 8 0 0114-4.9M4 4v5h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 15a8 8 0 01-14 4.9M20 20v-5h-5" />
    </svg>
  )
}

function BellIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 18a2 2 0 004 0" />
    </svg>
  )
}

function GaugeIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 15a8 8 0 1116 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15l3.5-4.5" />
      <circle cx="12" cy="15" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BoltIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  )
}

function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.8-4.6 6.6-.9L12 2.5z" />
    </svg>
  )
}

const DIFFERENTIATORS = [
  {
    Icon: RefreshIcon,
    badge: 'bg-primary/15 text-primary',
    title: 'Suivi automatique',
    description: 'Tes chiffres se mettent à jour tout seuls — pas besoin de tout retaper à chaque fois.',
  },
  {
    Icon: BellIcon,
    badge: 'bg-accent/15 text-accent',
    title: 'Alertes proactives',
    description: 'SaveUp te prévient avant que ça dérape, sans que tu aies à demander.',
  },
  {
    Icon: GaugeIcon,
    badge: 'bg-success/15 text-success',
    title: 'Score qui évolue',
    description: 'Un score qui bouge avec toi, semaine après semaine, avec un historique.',
  },
]

const PILLARS = [
  {
    Icon: BoltIcon,
    title: 'Rapide',
    description: 'Ton budget est prêt en 2 minutes, pas en une heure de tableur.',
  },
  {
    Icon: RefreshIcon,
    title: 'Automatique',
    description: 'Alertes et calculs se font seuls — tu n\'as qu\'à noter tes dépenses.',
  },
  {
    Icon: StarIcon,
    title: 'Motivant',
    description: 'Un score et des badges qui avancent avec toi, pas juste des chiffres froids.',
  },
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
      'Le plan Gratuit couvre l\'essentiel sans limite de temps. Les plans Standard et Premium arrivent bientôt pour aller plus loin.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Tes données sont hébergées sur une base de données sécurisée (Supabase) avec des règles d\'accès activées. SaveUp fonctionne pour l\'instant sans compte utilisateur — évite donc de partager le lien de ton app publiquement.',
  },
  {
    question: 'Dois-je créer un compte ?',
    answer:
      'Pas pour l\'instant — SaveUp fonctionne sans compte. La gestion multi-utilisateurs arrive dans une prochaine version.',
  },
  {
    question: 'Puis-je annuler ?',
    answer: 'Oui, en tout temps, sans engagement — le plan Gratuit reste gratuit sans limite.',
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

      {/* Hero */}
      <section className="hero-gradient px-4 pb-20 pt-14 text-center sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
          100% gratuit pour commencer
        </span>

        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Reprends le contrôle de ton argent, simplement.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Budget, épargne et objectifs financiers dans une seule app — sans tableur compliqué.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/dashboard"
            className="rounded-lg bg-primary-strong px-6 py-3 font-medium text-white shadow-[0_0_30px_rgba(74,108,247,0.35)] transition-all hover:brightness-110 hover:shadow-[0_0_40px_rgba(74,108,247,0.5)]"
          >
            Essayer gratuitement
          </Link>
          <a
            href="#comment-ca-marche"
            className="rounded-lg border border-white/20 px-6 py-3 font-medium text-ink transition-colors hover:bg-white/5"
          >
            Voir comment ça marche
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
          {['Sans carte requise', 'Configuration en 2 min', '100% en français'].map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
            >
              <span aria-hidden="true" className="text-success">
                ✓
              </span>
              {label}
            </span>
          ))}
        </div>

        <div className="relative mx-auto mt-16 max-w-md">
          <div className="absolute inset-x-8 inset-y-6 -z-10 rounded-3xl bg-accent/30 blur-3xl" />
          <div className="glass rounded-2xl p-6 text-left shadow-2xl shadow-black/40">
            <p className="text-xs uppercase tracking-wide text-muted">Budget hebdomadaire</p>
            <p className="mt-1 text-3xl font-bold text-ink">
              342,50 $<span className="ml-2 text-sm font-normal text-muted">restants</span>
            </p>

            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-muted">Objectif : Vacances</span>
              <span className="font-medium text-success">68 %</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[68%] rounded-full bg-success transition-all" />
            </div>
          </div>
        </div>
      </section>

      {/* Différenciation */}
      <section id="fonctionnalites" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-ink">
          Pourquoi SaveUp, pas juste un chatbot
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted">
          Claude ou ChatGPT peuvent répondre à une question sur ton budget. Ils ne le suivent pas
          pour toi, jour après jour.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {DIFFERENTIATORS.map(({ Icon, badge, title, description }) => (
            <div key={title} className="glass rounded-2xl p-6 text-left shadow-lg shadow-black/30">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${badge}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 mt-4 font-semibold text-ink">{title}</h3>
              <p className="text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Démo interactive */}
      <section id="demo" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-ink">Essaie avant de t'inscrire</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted">
          Le simulateur « et si » de l'app, directement ici. Ajuste le curseur et regarde l'impact.
        </p>
        <div className="mt-10">
          <LandingDemoSimulator />
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-ink">En 3 étapes, ton budget est prêt</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted">
          Teste la première étape tout de suite — les deux autres t'attendent dans l'app.
        </p>
        <div className="mt-10">
          <LandingStepsPreview />
        </div>
      </section>

      {/* Tableau comparatif */}
      <section id="comparaison" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-ink">SaveUp vs les alternatives</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted">
          Un chatbot répond bien à une question ponctuelle, et un tableur peut tout calculer —
          mais aucun des deux ne suit ton argent pour toi, jour après jour.
        </p>

        <div className="glass mt-10 overflow-x-auto rounded-2xl shadow-lg shadow-black/30">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-sm text-muted">
                <th className="px-4 py-3 font-medium">&nbsp;</th>
                <th className="px-4 py-3 font-semibold text-ink">SaveUp</th>
                <th className="px-4 py-3 font-medium">Chatbot gratuit</th>
                <th className="px-4 py-3 font-medium">Tableur Excel</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-white/10 text-sm last:border-b-0">
                  <th scope="row" className="px-4 py-4 text-left font-medium text-ink">
                    {row.label}
                  </th>
                  <td className="px-4 py-4 text-ink">
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
      </section>

      {/* Résultats — honnête, pas de fausses stats */}
      <section id="resultats" className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-ink">Résultats</h2>
        <div className="glass mx-auto mt-8 max-w-lg rounded-2xl p-8 shadow-lg shadow-black/30">
          <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
            À venir
          </span>
          <p className="mt-4 text-sm text-muted">
            SaveUp est tout jeune — on n'a pas encore de résultats concrets d'utilisateurs à
            partager, et on ne va pas en inventer. Essaie la démo interactive plus haut pour voir
            l'outil à l'œuvre.
          </p>
        </div>
      </section>

      {/* 3 piliers */}
      <section id="piliers" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {PILLARS.map(({ Icon, title, description }) => (
            <div key={title} className="glass rounded-2xl p-6 text-center shadow-lg shadow-black/30">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 mt-4 font-semibold text-ink">{title}</h3>
              <p className="text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section id="cta-final" className="hero-gradient px-4 py-24 text-center sm:px-6">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
          Prêt à voir clair dans tes finances ?
        </h2>
        <Link
          to="/dashboard"
          className="mt-8 inline-block rounded-lg bg-primary-strong px-8 py-3 font-medium text-white shadow-[0_0_30px_rgba(74,108,247,0.35)] transition-all hover:brightness-110"
        >
          Commencer gratuitement
        </Link>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
          {['Sans carte requise', 'Configuration en 2 minutes', 'Annule quand tu veux'].map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
            >
              <span aria-hidden="true" className="text-success">
                ✓
              </span>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-ink">Questions fréquentes</h2>

        <div className="mt-10 grid gap-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group glass rounded-2xl p-5 shadow-lg shadow-black/30"
            >
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
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
