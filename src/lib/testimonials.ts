// Real customer reviews, used with their permission — quotes stay in their
// original French regardless of site language (translating someone's real
// words would mean putting different words in their mouth under their real
// name), so this list is deliberately NOT part of the FR/EN i18n content.
export interface Testimonial {
  name: string
  rating: number
  quote: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Caroline',
    rating: 5,
    quote:
      "SaveUp m'aide vraiment à garder le cap sur mes objectifs d'épargne. C'est simple, clair et je vois rapidement mes progrès.",
  },
  {
    name: 'Jack',
    rating: 5,
    quote:
      "J'aime beaucoup la simplicité de SaveUp. Je peux suivre mes objectifs sans avoir une application compliquée à utiliser.",
  },
  {
    name: 'Alexandre',
    rating: 5,
    quote:
      'Depuis que j’utilise SaveUp, je suis beaucoup plus motivé à atteindre mes objectifs. Voir ma progression me pousse à continuer.',
  },
  {
    name: 'Maria',
    rating: 5,
    quote:
      "L'application est propre, facile à comprendre et surtout pratique pour suivre combien il me reste avant d'atteindre mon objectif.",
  },
  {
    name: 'Justin',
    rating: 5,
    quote:
      "J'avais tendance à commencer des objectifs d'épargne sans vraiment les suivre. Avec SaveUp, je peux voir concrètement où j'en suis.",
  },
]
