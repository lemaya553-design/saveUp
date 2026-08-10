import { Link, useNavigate } from 'react-router-dom'
import { LegalSection as Section } from '../components/LegalSection'

const LAST_UPDATED = '10 août 2026'
const CONTACT_EMAIL = 'conditions@saveup.com'

export function Conditions() {
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

      <h1 className="mt-6 text-3xl font-bold text-ink">Conditions d'utilisation</h1>
      <p className="mt-2 text-sm text-muted">Dernière mise à jour : {LAST_UPDATED}</p>

      <p className="mt-6 text-[15px] leading-relaxed text-ink/90">
        En créant un compte ou en utilisant SaveUp, tu acceptes les conditions décrites ci-dessous.
        Si tu n'es pas d'accord avec l'une d'elles, tu ne dois pas utiliser le service. Voir aussi
        notre{' '}
        <Link to="/confidentialite" className="text-accent hover:text-accent/80">
          politique de confidentialité
        </Link>
        , qui fait partie intégrante de ces conditions.
      </p>

      <div className="mt-2">
        <Section title="1. Description du service">
          <p>
            SaveUp est un outil de gestion de budget personnel et de suivi d'épargne : revenu,
            dépenses fixes et ponctuelles, objectifs d'épargne, score de santé financière et
            projections d'investissement.
          </p>
          <p>
            <span className="text-ink">SaveUp n'est pas un conseiller financier</span>, ni une
            institution financière, et ne détient ni ne déplace ton argent réel. Le score de santé
            financière, les projections d'investissement et toute estimation affichée dans l'app
            sont fournis <span className="text-ink">à titre informatif seulement</span>, basés sur
            des calculs théoriques et sur les chiffres que tu entres toi-même — ils ne constituent
            pas un conseil financier, fiscal ou d'investissement professionnel.
          </p>
        </Section>

        <Section title="2. Compte utilisateur">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Tu es responsable de garder ton mot de passe confidentiel et de toute activité effectuée depuis ton compte.</li>
            <li>Tu t'engages à fournir un courriel valide et des renseignements exacts lors de la création de ton compte.</li>
            <li>Un compte est destiné à un usage personnel, par une seule personne.</li>
            <li>Préviens-nous rapidement (voir section 9) si tu soupçonnes un accès non autorisé à ton compte.</li>
          </ul>
        </Section>

        <Section title="3. Plans et paiements">
          <p>SaveUp propose actuellement trois plans :</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li><span className="text-ink">Gratuit</span> — 0 $, sans limite de temps.</li>
            <li><span className="text-ink">Standard</span> — 7,99 $/mois.</li>
            <li><span className="text-ink">Premium</span> — 14,99 $/mois.</li>
          </ul>
          <p>
            Les plans Standard et Premium ne sont <span className="text-ink">pas encore disponibles
            à l'achat</span> (voir la page Tarifs) ; les conditions ci-dessous s'appliqueront dès
            leur mise en ligne.
          </p>
          <p>
            Les abonnements payants sont facturés de façon récurrente (mensuellement) jusqu'à
            annulation. Tu peux annuler en tout temps ; l'annulation prend effet à la fin de la
            période déjà payée, sans remboursement de la portion entamée, sauf lorsque la loi
            l'exige.
          </p>
          <p>
            Les paiements sont traités par un fournisseur tiers sécurisé (<span className="text-ink">Stripe</span>).
            SaveUp ne stocke, ne voit ni ne conserve aucune information de carte de crédit — ces
            renseignements transitent uniquement par Stripe.
          </p>
        </Section>

        <Section title="4. Utilisation acceptable">
          <p>En utilisant SaveUp, tu t'engages à ne pas :</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>utiliser le service à des fins illégales ou frauduleuses ;</li>
            <li>tenter de contourner, désactiver ou compromettre les mesures de sécurité de l'application ou de son infrastructure ;</li>
            <li>partager les identifiants de ton compte avec d'autres personnes au-delà de l'usage personnel prévu par ton plan (le suivi « multi-comptes » du plan Premium désigne le suivi de plusieurs comptes financiers personnels, pas le partage d'un même identifiant SaveUp entre plusieurs personnes) ;</li>
            <li>tenter d'extraire massivement les données d'autres utilisateurs ou de perturber le fonctionnement du service.</li>
          </ul>
        </Section>

        <Section title="5. Limitation de responsabilité">
          <p>
            SaveUp fournit des outils d'aide à la décision financière personnelle. Les décisions
            financières que tu prends — combien épargner, combien dépenser, où investir — restent
            entièrement les tiennes ; SaveUp n'est pas responsable des conséquences de ces
            décisions.
          </p>
          <p>
            Les projections, scores et calculs affichés sont théoriques et basés sur des hypothèses
            simplifiées (par exemple un taux de rendement constant) : ils peuvent différer
            significativement de la réalité et ne garantissent aucun résultat futur.
          </p>
          <p>
            Dans la mesure permise par la loi, SaveUp est fourni « tel quel », sans garantie
            d'absence d'erreur ou d'interruption de service.
          </p>
        </Section>

        <Section title="6. Résiliation">
          <p>
            Tu peux fermer ton compte en tout temps en nous écrivant (voir section 9) — voir aussi
            la section « Conservation des données » de notre{' '}
            <Link to="/confidentialite" className="text-accent hover:text-accent/80">
              politique de confidentialité
            </Link>{' '}
            pour ce qui advient de tes données ensuite.
          </p>
          <p>
            SaveUp peut suspendre ou résilier un compte qui contrevient à la section 4 (Utilisation
            acceptable), après un avis raisonnable lorsque les circonstances le permettent.
          </p>
        </Section>

        <Section title="7. Modifications des conditions">
          <p>
            SaveUp peut mettre à jour ces conditions au fil de l'évolution du service. Les
            changements mineurs prennent effet dès leur publication sur cette page ; les
            changements importants seront communiqués aux utilisateurs (par exemple par courriel ou
            avis dans l'application) avant leur entrée en vigueur.
          </p>
        </Section>

        <Section title="8. Droit applicable">
          <p>
            Ces conditions sont régies par les lois de la province de Québec et les lois du Canada
            applicables, sans égard aux principes de conflits de lois. Tout litige sera soumis à la
            compétence des tribunaux du Québec.
          </p>
        </Section>

        <Section title="9. Nous contacter">
          <p>Pour toute question sur ces conditions d'utilisation, écris-nous à :</p>
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
      </div>

      <p className="mt-10 border-t border-white/10 pt-6 text-sm text-muted">
        Voir aussi notre{' '}
        <Link to="/confidentialite" className="text-accent hover:text-accent/80">
          politique de confidentialité
        </Link>{' '}
        et notre{' '}
        <Link to="/tarifs" className="text-accent hover:text-accent/80">
          page Tarifs
        </Link>
        .
      </p>
    </div>
  )
}
