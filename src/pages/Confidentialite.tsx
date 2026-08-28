import { Link, useNavigate } from 'react-router-dom'
import { LegalSection as Section } from '../components/LegalSection'

const LAST_UPDATED = '10 août 2026'
const CONTACT_EMAIL = 'confidentialite@saveup.com'

export function Confidentialite() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-muted transition-colors hover:text-ink"
      >
        ← Retour
      </button>

      <h1 className="mt-6 text-3xl font-bold text-ink">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-muted">Dernière mise à jour : {LAST_UPDATED}</p>

      <p className="mt-6 text-[15px] leading-relaxed text-ink/90">
        SaveUp (« nous », « l'application ») est une application québécoise de gestion de budget
        personnel. Cette politique explique quels renseignements personnels nous collectons,
        pourquoi, où ils sont conservés, et quels droits tu as sur tes propres données en vertu de
        la <span className="text-ink">Loi 25</span> (Loi modernisant des dispositions législatives
        en matière de protection des renseignements personnels, Québec).
      </p>

      <div className="mt-2">
        <Section title="1. Quelles données sont collectées">
          <p>Pour fonctionner, SaveUp collecte et conserve les renseignements suivants, liés à ton compte :</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li><span className="text-ink">Courriel</span> — utilisé pour créer et sécuriser ton compte.</li>
            <li><span className="text-ink">Mot de passe</span> — jamais stocké en clair ; géré et chiffré par notre fournisseur d'authentification (Supabase Auth), inaccessible à SaveUp lui-même.</li>
            <li><span className="text-ink">Revenu mensuel</span> — pour calculer ton budget disponible.</li>
            <li><span className="text-ink">Dépenses fixes et ponctuelles</span> — description, montant, catégorie et date de chaque dépense que tu notes.</li>
            <li><span className="text-ink">Catégories personnalisées</span> — les catégories de dépenses que tu crées ou renommes.</li>
            <li><span className="text-ink">Objectifs et contributions d'épargne</span> — noms, montants cibles, échéances et historique de tes contributions.</li>
            <li><span className="text-ink">Montant investi</span> — le solde que tu suis manuellement sur la page Investissement.</li>
          </ul>
          <p>
            Nous ne collectons aucune donnée au-delà de ce qui précède : pas de géolocalisation, pas
            de contacts, pas d'informations bancaires réelles (SaveUp ne se connecte à aucune
            institution financière — tous les montants sont entrés manuellement par toi).
          </p>
        </Section>

        <Section title="2. Comment les données sont utilisées">
          <p>
            Tes renseignements servent <span className="text-ink">exclusivement</span> à faire
            fonctionner SaveUp pour toi : calculer ton budget hebdomadaire et mensuel, ton score de
            santé financière, tes projections d'investissement, ta progression vers tes objectifs
            d'épargne, et tes badges de récompense.
          </p>
          <p>
            Nous ne vendons, ne louons et ne partageons jamais tes renseignements personnels à des
            tiers à des fins publicitaires ou de marketing. Il n'y a aucun profilage commercial, ni
            aucune revente de données, sous quelque forme que ce soit.
          </p>
        </Section>

        <Section title="3. Où les données sont stockées">
          <p>
            Tes données sont hébergées sur l'infrastructure de{' '}
            <span className="text-ink">Supabase</span> (base de données PostgreSQL gérée), notre
            fournisseur d'hébergement et d'authentification.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Toutes les communications entre l'application et la base de données sont chiffrées en transit (HTTPS/TLS).</li>
            <li>
              Chaque compte est isolé des autres par des règles de sécurité au niveau des lignes
              (<span className="text-ink">Row Level Security</span>) : un utilisateur connecté ne
              peut techniquement lire ou modifier que ses propres données, jamais celles d'un autre
              compte.
            </li>
            <li>L'accès à ton compte requiert une authentification par courriel et mot de passe, avec possibilité de réinitialisation sécurisée.</li>
          </ul>
        </Section>

        <Section title="4. Tes droits">
          <p>Conformément à la Loi 25, tu disposes des droits suivants sur tes renseignements personnels :</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li><span className="text-ink">Droit d'accès</span> — obtenir une copie des renseignements que nous détenons sur toi. Tu peux déjà exporter la majorité de tes données toi-même (Paramètres → Exporter tes données), ou nous écrire pour une copie complète.</li>
            <li><span className="text-ink">Droit de rectification</span> — corriger un renseignement inexact ou incomplet. La plupart des champs sont modifiables directement dans l'application ; pour le reste, écris-nous.</li>
            <li><span className="text-ink">Droit à la suppression</span> — demander la suppression de ton compte et de l'ensemble des données qui y sont associées.</li>
            <li><span className="text-ink">Droit de retirer ton consentement</span> — en tout temps, ce qui entraîne la fermeture de ton compte, puisque le service ne peut pas fonctionner sans les renseignements listés à la section 1.</li>
            <li><span className="text-ink">Droit à la portabilité</span> — recevoir tes données dans un format structuré et lisible (CSV).</li>
          </ul>
          <p>
            Pour exercer l'un de ces droits, écris-nous à l'adresse indiquée à la section 6. La
            suppression de compte en libre-service n'est pas encore offerte directement dans
            l'application — jusqu'à ce qu'elle le soit, toute demande de suppression est traitée
            manuellement par courriel.
          </p>
        </Section>

        <Section title="5. Conservation des données">
          <p>
            Tes données sont conservées tant que ton compte est actif, afin de te fournir le
            service.
          </p>
          <p>
            Lorsqu'un compte est supprimé (à ta demande), ses données sont retirées de notre base de
            données active dans les meilleurs délais. Des copies résiduelles peuvent subsister
            temporairement dans nos sauvegardes de sécurité, purgées dans un délai maximal de{' '}
            <span className="text-ink">90 jours</span> suivant la suppression.
          </p>
        </Section>

        <Section title="6. Nous contacter">
          <p>
            Pour toute question sur cette politique, pour exercer l'un de tes droits, ou pour
            signaler une préoccupation liée à la protection de tes renseignements personnels,
            écris-nous à :
          </p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-accent hover:text-accent/80">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="text-sm text-muted">
            (Adresse temporaire de lancement — à ajuster lorsque SaveUp aura une adresse de contact
            officielle.)
          </p>
        </Section>

        <Section title="7. Cookies et stockage local">
          <p>
            SaveUp n'utilise <span className="text-ink">aucun cookie publicitaire ou de suivi</span>,
            et ne partage aucune donnée de navigation avec des tiers.
          </p>
          <p>
            Le navigateur utilise le stockage local (<span className="text-ink">localStorage</span>)
            uniquement à des fins fonctionnelles :
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>garder ta session ouverte (jeton d'authentification), pour éviter d'avoir à te reconnecter à chaque visite ;</li>
            <li>retenir quels badges de récompense t'ont déjà été montrés, pour ne pas rejouer une animation déjà vue.</li>
          </ul>
          <p>Rien de ce stockage local n'est transmis à des tiers ni utilisé à des fins publicitaires.</p>
        </Section>
      </div>

      <p className="mt-10 border-t border-overlay/10 pt-6 text-sm text-muted">
        Cette politique peut être mise à jour au fil de l'évolution de SaveUp. Les changements
        importants seront communiqués aux utilisateurs. Voir aussi la{' '}
        <Link to="/tarifs" className="text-accent hover:text-accent/80">
          page Tarifs
        </Link>
        .
      </p>
    </div>
  )
}
