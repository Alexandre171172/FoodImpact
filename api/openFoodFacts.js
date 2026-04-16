/**
 * Open Food Facts API wrapper — v2 with fallback to v0.
 * Uses abort controller + 12s timeout to avoid hanging requests.
 */

const V2   = 'https://world.openfoodfacts.org/api/v2'
const V0   = 'https://world.openfoodfacts.org'

const FIELDS = [
  'code','product_name','brands','image_url','image_small_url',
  'nutriscore_grade','ecoscore_grade',
  'nutriments',
  'ingredients_text','countries_tags','origins',
  'carbon_footprint_from_known_ingredients_100g',
  'additives_tags','allergens','packaging_tags',
  'categories_tags','quantity','serving_size',
  'nutrient_levels',
].join(',')

async function fetchWithTimeout(url, ms = 12_000) {
  const ctrl = new AbortController()
  const tid  = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(tid)
  }
}

/** Search products by text (FR/EN/DE auto-detected by OFF) */
export async function searchProducts(query, pageSize = 12) {
  const q = encodeURIComponent(query.trim())

  // Try v2 first
  try {
    const url  = `${V2}/search?search_terms=${q}&fields=${FIELDS}&page_size=${pageSize}&json=true`
    const data = await fetchWithTimeout(url)
    const products = (data.products || []).filter(p => p.product_name?.trim())
    if (products.length > 0) return products
  } catch (e1) {
    if (e1.name === 'AbortError') throw new Error('Délai dépassé. Réessayez.')
    // Fall through to v0
  }

  // Fallback to v0 CGI
  const url  = `${V0}/cgi/search.pl?search_terms=${q}&search_simple=1&action=process&json=1&page_size=${pageSize}&fields=${FIELDS}`
  const data = await fetchWithTimeout(url)
  return (data.products || []).filter(p => p.product_name?.trim())
}

/** Fetch single product by barcode with full nutrient data */
export async function getProduct(barcode) {
  // v2
  try {
    const url  = `${V2}/product/${barcode}?fields=${FIELDS}`
    const data = await fetchWithTimeout(url)
    if (data.product) return data.product
  } catch {}

  // v0 fallback
  const url  = `${V0}/api/v0/product/${barcode}.json?fields=${FIELDS}`
  const data = await fetchWithTimeout(url)
  return data.status === 1 ? data.product : null
}

/* ── Country data ───────────────────────────────────────────────────────── */
export const COUNTRY_NAMES = {
  'en:france':         { name: 'France',            flag: '🇫🇷', coords: [46.23, 2.21]   },
  'en:united-kingdom': { name: 'Royaume-Uni',       flag: '🇬🇧', coords: [55.38, -3.44]  },
  'en:germany':        { name: 'Allemagne',          flag: '🇩🇪', coords: [51.17, 10.45]  },
  'en:spain':          { name: 'Espagne',            flag: '🇪🇸', coords: [40.46, -3.75]  },
  'en:italy':          { name: 'Italie',             flag: '🇮🇹', coords: [41.87, 12.57]  },
  'en:united-states':  { name: 'États-Unis',         flag: '🇺🇸', coords: [37.09, -95.71] },
  'en:brazil':         { name: 'Brésil',             flag: '🇧🇷', coords: [-14.24, -51.93]},
  'en:china':          { name: 'Chine',              flag: '🇨🇳', coords: [35.86, 104.20] },
  'en:india':          { name: 'Inde',               flag: '🇮🇳', coords: [20.59, 78.96]  },
  'en:netherlands':    { name: 'Pays-Bas',           flag: '🇳🇱', coords: [52.13, 5.29]   },
  'en:belgium':        { name: 'Belgique',           flag: '🇧🇪', coords: [50.50, 4.47]   },
  'en:switzerland':    { name: 'Suisse',             flag: '🇨🇭', coords: [46.82, 8.23]   },
  'en:poland':         { name: 'Pologne',            flag: '🇵🇱', coords: [51.92, 19.15]  },
  'en:portugal':       { name: 'Portugal',           flag: '🇵🇹', coords: [39.40, -8.22]  },
  'en:mexico':         { name: 'Mexique',            flag: '🇲🇽', coords: [23.63, -102.55]},
  'en:turkey':         { name: 'Turquie',            flag: '🇹🇷', coords: [38.96, 35.24]  },
  'en:argentina':      { name: 'Argentine',          flag: '🇦🇷', coords: [-38.42, -63.62]},
  'en:colombia':       { name: 'Colombie',           flag: '🇨🇴', coords: [4.57, -74.30]  },
  'en:peru':           { name: 'Pérou',              flag: '🇵🇪', coords: [-9.19, -75.02] },
  'en:ethiopia':       { name: 'Éthiopie',           flag: '🇪🇹', coords: [9.15, 40.49]   },
  'en:kenya':          { name: 'Kenya',              flag: '🇰🇪', coords: [-0.02, 37.91]  },
  'en:vietnam':        { name: 'Vietnam',            flag: '🇻🇳', coords: [14.06, 108.28] },
  'en:thailand':       { name: 'Thaïlande',          flag: '🇹🇭', coords: [15.87, 100.99] },
  'en:australia':      { name: 'Australie',          flag: '🇦🇺', coords: [-25.27, 133.78]},
  'en:canada':         { name: 'Canada',             flag: '🇨🇦', coords: [56.13, -106.35]},
  'en:japan':          { name: 'Japon',              flag: '🇯🇵', coords: [36.20, 138.25] },
  'en:south-korea':    { name: 'Corée du Sud',       flag: '🇰🇷', coords: [35.91, 127.77] },
  'en:morocco':        { name: 'Maroc',              flag: '🇲🇦', coords: [31.79, -7.09]  },
  'en:sweden':         { name: 'Suède',              flag: '🇸🇪', coords: [60.13, 18.64]  },
  'en:denmark':        { name: 'Danemark',           flag: '🇩🇰', coords: [56.26, 9.50]   },
  'en:norway':         { name: 'Norvège',            flag: '🇳🇴', coords: [60.47, 8.47]   },
  'en:austria':        { name: 'Autriche',           flag: '🇦🇹', coords: [47.52, 14.55]  },
  'en:indonesia':      { name: 'Indonésie',          flag: '🇮🇩', coords: [-0.79, 113.92] },
  'en:ecuador':        { name: 'Équateur',           flag: '🇪🇨', coords: [-1.83, -78.18] },
  'en:ivory-coast':    { name: "Côte d'Ivoire",      flag: '🇨🇮', coords: [7.54, -5.55]   },
  'en:ghana':          { name: 'Ghana',              flag: '🇬🇭', coords: [7.95, -1.02]   },
}

export function resolveCountry(tag) {
  if (!tag) return null
  const lo  = tag.toLowerCase()
  const hit = COUNTRY_NAMES[lo]
  if (hit) return hit
  const key = Object.keys(COUNTRY_NAMES).find(k =>
    lo.includes(k.replace('en:','')) || k.includes(lo.replace('en:',''))
  )
  return key ? COUNTRY_NAMES[key] : { name: tag.replace('en:','').replace(/-/g,' '), flag: '🌍', coords: null }
}
