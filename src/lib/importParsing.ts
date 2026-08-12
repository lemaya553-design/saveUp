import Papa from 'papaparse'
import type * as XLSXType from 'xlsx'

export interface ParsedFile {
  headers: string[]
  rows: string[][]
}

export type AmountMode = 'single' | 'split'
export type ExpenseSign = 'negative' | 'positive'

export interface ColumnMapping {
  dateColumn: number | null
  descriptionColumn: number | null
  amountMode: AmountMode
  amountColumn: number | null
  expenseSign: ExpenseSign
  debitColumn: number | null
  creditColumn: number | null
  categoryColumn: number | null
}

export type SkipReason = 'invalid-date' | 'invalid-amount' | 'not-an-expense'

export interface ImportRow {
  index: number
  raw: string[]
  description: string
  spentAt: string | null
  amount: number | null
  category: string
  categoryGuessed: boolean
  skipReason: SkipReason | null
  isDuplicate: boolean
}

const MAX_IMPORT_ROWS = 2000

// ---------------------------------------------------------------------------
// File parsing

export async function parseFile(file: File): Promise<ParsedFile> {
  const name = file.name.toLowerCase()
  const rows = name.endsWith('.csv') ? await parseCsv(file) : await parseXlsx(file)

  const nonEmpty = rows.filter((row) => row.some((cell) => cell.trim() !== ''))
  if (nonEmpty.length === 0) {
    throw new Error('Le fichier est vide.')
  }
  if (nonEmpty.length === 1) {
    throw new Error("Le fichier ne contient qu'une ligne d'en-têtes, aucune donnée à importer.")
  }
  if (nonEmpty.length - 1 > MAX_IMPORT_ROWS) {
    throw new Error(
      `Le fichier contient plus de ${MAX_IMPORT_ROWS} lignes — divise-le en fichiers plus petits pour l'importer.`,
    )
  }

  const [headerRow, ...dataRows] = nonEmpty
  const width = headerRow.length
  return {
    headers: headerRow.map((h, i) => (h.trim() ? h.trim() : `Colonne ${i + 1}`)),
    // Pad/truncate every row to the header width so column indices stay valid.
    rows: dataRows.map((row) => Array.from({ length: width }, (_, i) => row[i] ?? '')),
  }
}

function parseCsv(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: (err: Error) => reject(new Error(`Impossible de lire le CSV : ${err.message}`)),
    })
  })
}

async function parseXlsx(file: File): Promise<string[][]> {
  // SheetJS is a large library only needed by the (much rarer) Excel import
  // path — loaded on demand so CSV imports, and every page that isn't this
  // modal, don't pay for it in the initial bundle.
  const XLSX: typeof XLSXType = await import('xlsx')
  let workbook: XLSXType.WorkBook
  try {
    const buffer = await file.arrayBuffer()
    workbook = XLSX.read(buffer, { type: 'array' })
  } catch {
    throw new Error("Ce fichier n'a pas pu être lu — est-ce bien un fichier Excel (.xlsx) valide ?")
  }
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error("Ce classeur Excel ne contient aucune feuille.")
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' })
  return rows.map((row) => row.map((cell) => String(cell ?? '')))
}

// ---------------------------------------------------------------------------
// Column auto-detection

const HEADER_HINTS: Record<'date' | 'description' | 'amount' | 'debit' | 'credit' | 'category', string[]> = {
  date: ['date', 'transaction date', 'date de transaction', 'posted date', 'date operation', "date d'operation"],
  description: ['description', 'libelle', 'libellé', 'detail', 'détail', 'merchant', 'marchand', 'transaction', 'memo'],
  amount: ['montant', 'amount', 'total', 'valeur'],
  debit: ['debit', 'débit', 'withdrawal', 'retrait', 'sortant'],
  credit: ['credit', 'crédit', 'deposit', 'dépôt', 'entrant'],
  category: ['categorie', 'catégorie', 'category'],
}

function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function findColumn(headers: string[], hints: string[]): number | null {
  const normalized = headers.map(normalizeHeader)
  const exact = normalized.findIndex((h) => hints.includes(h));
  if (exact !== -1) return exact
  const partial = normalized.findIndex((h) => hints.some((hint) => h.includes(hint)))
  return partial !== -1 ? partial : null
}

export function detectColumnMapping(headers: string[]): ColumnMapping {
  const dateColumn = findColumn(headers, HEADER_HINTS.date)
  const descriptionColumn = findColumn(headers, HEADER_HINTS.description)
  const amountColumn = findColumn(headers, HEADER_HINTS.amount)
  const debitColumn = findColumn(headers, HEADER_HINTS.debit)
  const creditColumn = findColumn(headers, HEADER_HINTS.credit)
  const categoryColumn = findColumn(headers, HEADER_HINTS.category)

  const useSplit = amountColumn === null && (debitColumn !== null || creditColumn !== null)

  return {
    dateColumn,
    descriptionColumn,
    amountMode: useSplit ? 'split' : 'single',
    amountColumn,
    expenseSign: 'negative',
    debitColumn,
    creditColumn,
    categoryColumn,
  }
}

// ---------------------------------------------------------------------------
// Value parsing

export function parseAmount(raw: string): number | null {
  let s = raw.trim()
  if (!s) return null

  let negative = false
  if (/^\(.*\)$/.test(s)) {
    negative = true
    s = s.slice(1, -1)
  }

  // Strip currency symbols, spaces (incl. non-breaking) and any letters.
  s = s.replace(/[^\d,.\-+]/g, '')
  if (!s) return null

  if (s.startsWith('-')) negative = true
  s = s.replace(/^[-+]/, '')

  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  if (lastComma !== -1 && lastDot !== -1) {
    // Whichever separator appears last is the decimal point; the other is a
    // thousands separator to strip (e.g. "1,234.56" vs "1.234,56").
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.')
    } else {
      s = s.replace(/,/g, '')
    }
  } else if (lastComma !== -1) {
    // Only a comma: decimal separator if it looks like "12,34" (<=2 digits
    // after it), otherwise a thousands separator ("1,234").
    const decimals = s.length - lastComma - 1
    s = decimals <= 2 ? s.replace(',', '.') : s.replace(/,/g, '')
  }

  const value = Number.parseFloat(s)
  if (!Number.isFinite(value)) return null
  return negative ? -value : value
}

const MONTH_NAMES: Record<string, number> = {
  jan: 1, janv: 1, january: 1, janvier: 1,
  feb: 2, fev: 2, fevr: 2, february: 2, fevrier: 2,
  mar: 3, march: 3, mars: 3,
  apr: 4, avr: 4, april: 4, avril: 4,
  may: 5, mai: 5,
  jun: 6, juin: 6, june: 6,
  jul: 7, juil: 7, july: 7, juillet: 7,
  aug: 8, aout: 8, august: 8,
  sep: 9, sept: 9, september: 9, septembre: 9,
  oct: 10, october: 10, octobre: 10,
  nov: 11, november: 11, novembre: 11,
  dec: 12, december: 12, decembre: 12,
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

// Best-effort date parser for bank/card exports, which use every format
// imaginable. Tries unambiguous forms first, then falls back to a DD/MM/YYYY
// assumption (Quebec convention) unless the numbers make that impossible.
export function parseDate(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null

  const isoMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    return toIsoDate(Number(y), Number(m), Number(d))
  }

  const wordMatch = s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .match(/^(\d{1,2})[a-z]*[\s,.-]+([a-z]+)[\s,.-]+(\d{2,4})|^([a-z]+)[\s,.-]+(\d{1,2})[a-z,.\s-]+(\d{2,4})/)
  if (wordMatch) {
    const day = Number(wordMatch[1] ?? wordMatch[5])
    const monthWord = (wordMatch[2] ?? wordMatch[4] ?? '').slice(0, 4)
    const monthKey = Object.keys(MONTH_NAMES).find((key) => monthWord.startsWith(key.slice(0, 3)))
    const year = Number(wordMatch[3] ?? wordMatch[6])
    if (monthKey) {
      const fullYear = year < 100 ? 2000 + year : year
      return toIsoDate(fullYear, MONTH_NAMES[monthKey], day)
    }
  }

  const numericMatch = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/)
  if (numericMatch) {
    const a = Number(numericMatch[1])
    const b = Number(numericMatch[2])
    let year = Number(numericMatch[3])
    if (year < 100) year += 2000

    if (a > 12 && b <= 12) return toIsoDate(year, b, a) // must be DD/MM
    if (b > 12 && a <= 12) return toIsoDate(year, a, b) // must be MM/DD
    // Ambiguous (both <= 12): default to DD/MM/YYYY.
    return toIsoDate(year, b, a)
  }

  return null
}

export function normalizeDescription(description: string): string {
  return description
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function descriptionsAreSimilar(a: string, b: string): boolean {
  if (!a || !b) return a === b
  if (a === b) return true
  return a.includes(b) || b.includes(a)
}

// ---------------------------------------------------------------------------
// Automatic categorization
//
// Two-step guess: match the merchant name against a keyword list to get a
// CANONICAL concept (grocery, fuel, etc.), then resolve that concept to
// whichever of the user's OWN categories best fits it. Categories in this
// app are freeform and user-managed (see useCategories) — we never invent a
// category name that isn't already one of the user's, so this always
// degrades gracefully to the fallback ("Autre") for an account whose
// category list doesn't have an obvious match.

export type CanonicalCategory =
  | 'grocery'
  | 'fuel_transport'
  | 'pharmacy_health'
  | 'entertainment'
  | 'restaurant'
  | 'housing_utilities'
  | 'electronics_software'

const CANONICAL_SYNONYMS: Record<CanonicalCategory, string[]> = {
  grocery: ['alimentation', 'epicerie', 'nourriture', 'groceries', 'grocery'],
  // Car rental lives here (not its own concept) — it resolves to "Transport",
  // which every account already has by default; a standalone "Location de
  // voiture" canonical would only ever resolve for the rare account with a
  // category literally named that.
  fuel_transport: ['transport', 'essence', 'carburant', 'auto', 'voiture', 'fuel', 'gas', 'gasoline', 'location de voiture'],
  pharmacy_health: ['sante', 'pharmacie', 'health', 'medical', 'pharmacy'],
  entertainment: ['loisirs', 'loisir', 'divertissement', 'abonnements', 'abonnement', 'entertainment', 'subscriptions'],
  restaurant: ['alimentation', 'restauration', 'resto', 'restaurant', 'nourriture', 'food'],
  housing_utilities: ['logement', 'loyer', 'habitation', 'maison', 'housing', 'utilities', 'services publics'],
  // No default category fits this today (the seeded list is Logement,
  // Alimentation, Transport, Loisirs, Santé, Autre) — this only resolves for
  // an account that already has (or later creates) a category along these
  // lines. Until then it degrades to "Autre" like any other unmatched
  // concept, by design.
  electronics_software: [
    'electronique', 'electronics', 'technologie', 'technology', 'informatique', 'logiciels',
    'logiciel', 'software', 'ordinateurs', 'gadgets',
  ],
}

// Human-friendly name proposed by the "Autre" category-suggestion detector
// (lib/categorySuggestions.ts) when a canonical concept has no matching user
// category yet — distinct from CANONICAL_SYNONYMS, which is a matching list,
// not necessarily a good display name (e.g. restaurant's synonyms lead with
// "alimentation" for matching purposes, but a *suggested new category* reads
// better as "Restauration").
export const CANONICAL_DISPLAY_NAMES: Record<CanonicalCategory, string> = {
  grocery: 'Alimentation',
  fuel_transport: 'Transport',
  pharmacy_health: 'Santé',
  entertainment: 'Loisirs',
  restaurant: 'Restauration',
  housing_utilities: 'Logement',
  electronics_software: 'Électronique',
}

// Keyword → concept. Checked as a normalized substring match against the
// transaction description, so "IGA #4521 MONTREAL" still matches "iga".
// Covers common Quebec/Canadian merchants first, then US/international ones
// likely to show up on a Canadian card statement too.
//
// Deliberately excluded: bare "budget", "national", "discount", "enterprise"
// (all real rental-car brands) — every one of these is also an ordinary
// English/French word that shows up in unrelated transaction memos, which is
// exactly the over-broad-keyword bug fixed earlier (e.g. "mobil" inside
// "mobilite"). Their specific multi-word statement forms are covered instead
// ("budget rent a car", "national car rental", etc.) — narrower, but safe.
const MERCHANT_KEYWORDS: { keywords: string[]; category: CanonicalCategory }[] = [
  {
    category: 'grocery',
    keywords: [
      'iga', 'iga extra', 'maxi', 'metro', 'metro plus', 'provigo', 'super c', 'superc', 'loblaws',
      'loblaw', 'sobeys', 'costco wholesale', 'costco', 'adonis', 'marche', 'supermarche', 'epicerie',
      'rachelle bery', 'avril', 'pa supermarche', 'bonichoix', 'intermarche', 'walmart supercentre',
      'walmart', 'wal-mart', 'freshco', 'farm boy', 'longos', 'no frills', 'nofrills', 'food basics',
      'independent grocer', 'fortinos', 'zehrs', 'valu-mart', 'save-on-foods', 'thrifty foods',
      'giant tiger', 'fruiterie', 'boucherie', 'poissonnerie', 'boulangerie',
      'publix', 'kroger', 'safeway', 'whole foods', "trader joe", 'aldi', 'wegmans', 'albertsons',
      'winn-dixie', 'meijer', 'giant eagle', 'stop and shop', 'harris teeter', 'food lion',
      'shoprite', 'h-e-b',
    ],
  },
  {
    category: 'fuel_transport',
    keywords: [
      'petro-canada', 'petro canada', 'petrocanada', 'esso', 'ultramar', 'couche-tard', 'couche tard',
      'pioneer energy', 'shell', 'chevron', 'exxonmobil', 'exxon', 'mobil', 'marathon petroleum',
      'sunoco', 'speedway', 'circle k', 'valero', 'texaco', 'irving', 'federated co-op',
      'canadian tire gas', 'costco gas', 'costco essence', 'wilson fuel', 'racetrac', 'flying j',
      'pilot travel',
      'stm', 'exo', 'rtl', 'stl', 'uber', 'lyft', 'taxi', 'via rail', 'greyhound', 'megabus', 'amtrak',
      'ttc', 'bixi', 'go transit', 'oc transpo', 'translink', 'stationnement', 'parking',
      'indigo parking', 'impark', 'laz parking', '407 etr', 'peage',
      // Car rental
      'sixt', 'hertz', 'turo', 'communauto', 'zipcar', 'car2go', 'enterprise rent-a-car',
      'enterprise rent a car', 'avis rent a car', 'avis budget group', 'national car rental',
      'alamo rent a car', 'budget rent a car', 'budget car rental', 'discount car and truck',
      "discount location d'autos", 'location de voiture', 'location auto', 'location vehicule',
    ],
  },
  {
    category: 'pharmacy_health',
    keywords: [
      'jean coutu', 'pharmaprix', 'uniprix', 'familiprix', 'proxim', 'brunet', 'shoppers drug mart',
      'costco pharmacy', 'london drugs', 'cvs pharmacy', 'cvs', 'walgreens', 'rite aid', 'duane reade',
      'clinique', 'clinique medicale', 'clinique sans rendez-vous', 'dentiste', 'cabinet dentaire',
      'orthodontiste', 'denturologiste', 'optique', 'lunetterie', 'opticien', 'optometriste',
      'audioprothesiste', 'physiotherapie', 'chiropraticien', 'massotherapie', 'pharmacy', 'pharmacie',
    ],
  },
  {
    category: 'entertainment',
    keywords: [
      'netflix', 'amazon prime', 'prime video', 'disney+', 'disney plus', 'spotify', 'apple music',
      'apple tv', 'crave', 'youtube premium', 'hbo max', 'hbo', 'paramount+', 'paramount plus',
      'crunchyroll', 'twitch', 'discord nitro', 'audible', 'siriusxm',
      'cineplex', 'guzzo', 'steam games', 'playstation', 'xbox', 'nintendo', 'epic games', 'ubisoft',
      'google play', 'apple arcade', 'cinema', 'ticketmaster', 'evenko', 'billetterie', 'musee',
      'aquarium', 'la ronde', 'salle de quilles', 'karting',
    ],
  },
  {
    category: 'restaurant',
    keywords: [
      'tim hortons', 'tim horton', 'st-hubert', 'st hubert', 'a&w', 'harveys', "harvey's",
      'chez ashton', 'la belle province', 'mcdonald', 'burger king', 'wendy', 'subway', 'kfc',
      'popeyes', "church's chicken", 'five guys', 'wingstop', "papa john's", 'little caesars',
      'boston market', 'panera bread', "jimmy john's", 'firehouse subs', 'quiznos',
      'pizza hut', 'domino', 'boston pizza', 'pizza pizza', 'starbucks', 'second cup', 'presse cafe',
      'van houtte', 'brulerie', 'cafe depot', 'coffee time', 'country style', "druxy's",
      'chipotle', 'taco bell', 'dunkin', 'uber eats', 'doordash', 'skip the dishes', 'skipthedishes',
      'swiss chalet', 'cactus club', "moxie's", 'jack astor', "montana's", 'kelseys', 'the keg',
      'milestones', "mike's", 'cora', 'eggspectation', 'freshii', 'thai express', 'sushi shop',
      // Generic terms — catches chains/bars/independents not individually
      // listed above, per the explicit ask to go beyond fast food.
      'restaurant', 'resto', 'bistro', 'brasserie', 'cafe', 'grill', 'pub', 'traiteur', 'rotisserie',
      'creperie', 'poutine', 'sushi', 'shawarma', 'cantine',
    ],
  },
  {
    category: 'housing_utilities',
    keywords: [
      'hydro-quebec', 'hydro quebec', 'hydro one', 'energir', 'gaz metro', 'enbridge', 'direct energy',
      'bell canada', 'bell mobilite', 'bell fibe', 'bell aliant', 'videotron', 'rogers communications',
      'telus', 'fido', 'cogeco', 'eastlink', 'freedom mobile', 'koodo', 'virgin plus', 'virgin mobile',
      'chatr mobile', 'public mobile', 'loyer', 'hypotheque', 'mortgage', 'condo fees', 'frais de condo',
      'desjardins assurance', 'assurance habitation', 'assurance maison', 'intact assurance',
      'la capitale assurance', 'sunlife assurance', 'rona', 'home depot', 'home hardware',
      'canadian tire', 'renovation',
    ],
  },
  {
    category: 'electronics_software',
    keywords: [
      'best buy', 'bestbuy', 'apple store', 'itunes', 'app store', 'google store', 'microsoft store',
      'dell', 'lenovo', 'hp store', 'newegg', 'staples', 'bureau en gros', 'canada computers',
      'memory express', 'the source', 'visions electronics', 'geek squad', 'samsung store',
      'costco.com', 'costco.ca', 'adobe', 'microsoft 365', 'office 365', 'dropbox', 'google one',
      'norton', 'mcafee',
    ],
  },
]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Word-boundary match, not a bare substring check — "mobil" must not match
// inside "mobilite", "stm" must not match inside "westmount". Both sides are
// already normalized (accents stripped, lowercased, punctuation → spaces)
// before this runs, so a multi-word keyword like "super c" just needs \b at
// each end of the whole phrase.
function matchesKeyword(normalizedText: string, normalizedKeyword: string): boolean {
  if (!normalizedKeyword) return false
  return new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`).test(normalizedText)
}

// Scans every keyword in every category rather than stopping at the first
// category (in array order) with any match — otherwise a short, earlier-listed
// keyword like "uber" (fuel_transport) wins over the more specific "uber eats"
// (restaurant) just because fuel_transport happens to be listed first. The
// longest matching keyword is the most specific one, so it wins regardless
// of which category it belongs to or where that category sits in the list.
export function guessCanonicalCategory(description: string): CanonicalCategory | null {
  const normalized = normalizeDescription(description)
  if (!normalized) return null

  let best: { category: CanonicalCategory; length: number } | null = null
  for (const entry of MERCHANT_KEYWORDS) {
    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeDescription(keyword)
      if (!matchesKeyword(normalized, normalizedKeyword)) continue
      if (!best || normalizedKeyword.length > best.length) {
        best = { category: entry.category, length: normalizedKeyword.length }
      }
    }
  }
  return best?.category ?? null
}

// Finds the user's own category that best matches a canonical concept —
// exact name match first ("Alimentation"), then a word-boundary match
// ("Alimentation (épicerie)" contains the standalone word "alimentation";
// a category literally called "Magasinage" must NOT match "gas" just
// because it's a substring inside it).
export function resolveCategoryName(canonical: CanonicalCategory, categoryNames: string[]): string | null {
  const synonyms = CANONICAL_SYNONYMS[canonical].map(normalizeDescription)
  const normalizedNames = categoryNames.map((name) => ({ name, normalized: normalizeDescription(name) }))

  for (const synonym of synonyms) {
    const exact = normalizedNames.find((n) => n.normalized === synonym)
    if (exact) return exact.name
  }
  for (const synonym of synonyms) {
    const partial = normalizedNames.find(
      (n) => matchesKeyword(n.normalized, synonym) || matchesKeyword(synonym, n.normalized),
    )
    if (partial) return partial.name
  }
  return null
}

const GENERIC_CATEGORY_VALUES = new Set(
  ['', 'n/a', 'na', 'none', 'uncategorized', 'non categorise', 'divers', '-', 'other', 'autre'].map(
    normalizeDescription,
  ),
)

export interface CustomKeyword {
  keyword: string
  category: string
}

// Category for one imported row, in priority order: (1) the file's own
// category column, if it has a real value and isn't a generic placeholder —
// matched against the user's existing categories by name when possible, but
// used as-is otherwise so "utilise-la" is honored even for a category the
// user hasn't created yet; (2) a keyword this user personally confirmed via
// a category suggestion (see lib/categorySuggestions.ts) — checked before
// the built-in dictionary since it was explicitly taught by this user, not
// guessed; (3) a merchant-keyword guess from the built-in dictionary,
// resolved to one of the user's categories; (4) the fallback.
export function pickCategory(
  rawCategoryFromFile: string | undefined,
  description: string,
  categoryNames: string[],
  fallbackCategory: string,
  customKeywords: CustomKeyword[] = [],
): { category: string; guessed: boolean } {
  const trimmed = rawCategoryFromFile?.trim()
  if (trimmed && !GENERIC_CATEGORY_VALUES.has(normalizeDescription(trimmed))) {
    const existing = categoryNames.find((name) => normalizeDescription(name) === normalizeDescription(trimmed))
    return { category: existing ?? trimmed, guessed: false }
  }

  const normalized = normalizeDescription(description)
  if (normalized) {
    for (const custom of customKeywords) {
      if (!categoryNames.includes(custom.category)) continue
      if (matchesKeyword(normalized, normalizeDescription(custom.keyword))) {
        return { category: custom.category, guessed: true }
      }
    }
  }

  const canonical = guessCanonicalCategory(description)
  if (canonical) {
    const resolved = resolveCategoryName(canonical, categoryNames)
    if (resolved) return { category: resolved, guessed: true }
  }

  return { category: fallbackCategory, guessed: false }
}

// ---------------------------------------------------------------------------
// Row building

export function buildImportRows(
  rows: string[][],
  mapping: ColumnMapping,
  categoryNames: string[],
  fallbackCategory: string,
  customKeywords: CustomKeyword[] = [],
): ImportRow[] {
  return rows.map((raw, index) => {
    const description =
      mapping.descriptionColumn !== null ? (raw[mapping.descriptionColumn] ?? '').trim() : ''

    const spentAt = mapping.dateColumn !== null ? parseDate(raw[mapping.dateColumn] ?? '') : null

    let amount: number | null = null
    let skipReason: SkipReason | null = null

    if (mapping.amountMode === 'single') {
      const parsed = mapping.amountColumn !== null ? parseAmount(raw[mapping.amountColumn] ?? '') : null
      if (parsed === null) {
        skipReason = 'invalid-amount'
      } else if (parsed === 0) {
        skipReason = 'not-an-expense'
      } else if (mapping.expenseSign === 'negative') {
        if (parsed < 0) amount = Math.abs(parsed)
        else skipReason = 'not-an-expense'
      } else {
        if (parsed > 0) amount = parsed
        else skipReason = 'not-an-expense'
      }
    } else {
      const debit = mapping.debitColumn !== null ? parseAmount(raw[mapping.debitColumn] ?? '') : null
      const credit = mapping.creditColumn !== null ? parseAmount(raw[mapping.creditColumn] ?? '') : null
      if (debit !== null && Math.abs(debit) > 0) {
        amount = Math.abs(debit)
      } else if (credit !== null && Math.abs(credit) > 0) {
        skipReason = 'not-an-expense'
      } else {
        skipReason = 'invalid-amount'
      }
    }

    if (!spentAt) skipReason = 'invalid-date'

    const rawCategory = mapping.categoryColumn !== null ? raw[mapping.categoryColumn] : undefined
    const { category, guessed } = pickCategory(
      rawCategory,
      description,
      categoryNames,
      fallbackCategory,
      customKeywords,
    )

    return {
      index,
      raw,
      description: description || 'Transaction importée',
      spentAt,
      amount: skipReason ? null : amount,
      category,
      categoryGuessed: guessed,
      skipReason,
      isDuplicate: false,
    }
  })
}

export interface ExistingExpenseForDedup {
  amount: number
  spent_at: string
  description: string
}

// Flags rows whose date + amount + a roughly-matching description already
// exist — either already in the database, or earlier in this same file
// (banks sometimes export overlapping date ranges).
export function markDuplicates(rows: ImportRow[], existing: ExistingExpenseForDedup[]): ImportRow[] {
  const existingKeys = existing.map((e) => ({
    date: e.spent_at.slice(0, 10),
    amount: Math.round(e.amount * 100),
    description: normalizeDescription(e.description),
  }))

  const seenInFile: { date: string; amount: number; description: string }[] = []

  return rows.map((row) => {
    if (row.skipReason || row.amount === null || !row.spentAt) return row

    const key = {
      date: row.spentAt,
      amount: Math.round(row.amount * 100),
      description: normalizeDescription(row.description),
    }

    const isDuplicate =
      existingKeys.some(
        (k) => k.date === key.date && k.amount === key.amount && descriptionsAreSimilar(k.description, key.description),
      ) ||
      seenInFile.some(
        (k) => k.date === key.date && k.amount === key.amount && descriptionsAreSimilar(k.description, key.description),
      )

    seenInFile.push(key)
    return isDuplicate ? { ...row, isDuplicate: true } : row
  })
}
