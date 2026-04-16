import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Camera, X, AlertTriangle } from 'lucide-react'
import { searchProducts } from '../api/openFoodFacts'
import { useLang } from '../context/LanguageContext'
import { useDebounce } from '../hooks/useDebounce'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/SkeletonCard'
import BarcodeScanner from '../components/BarcodeScanner'
import { getProduct } from '../api/openFoodFacts'
import { useApp } from '../context/AppContext'

const SUGGESTIONS = ['Nutella','Coca-Cola','Pain de mie','Yaourt nature','Fromage','Chips','Beurre','Lait','Saumon','Chocolat noir']

export default function SearchPage({ onSelectProduct }) {
  const { addNotification } = useApp()
  const { t } = useLang()
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const debounced = useDebounce(query, 550)

  React.useEffect(() => {
    if (debounced.trim().length > 1) doSearch(debounced)
    else if (!debounced.trim()) { setResults([]); setError('') }
  }, [debounced])

  const doSearch = useCallback(async (q) => {
    setLoading(true); setError('')
    try {
      const res = await searchProducts(q.trim())
      setResults(res)
      if (!res.length) setError(t('noResults', q))
    } catch (e) {
      setError(e.message || t('networkError'))
    } finally { setLoading(false) }
  }, [t])

  const handleScanDetected = useCallback(async (barcode) => {
    setShowScanner(false)
    setLoading(true)
    try {
      const prod = await getProduct(barcode)
      if (prod) { onSelectProduct(prod); addNotification(`Produit trouvé : ${prod.product_name}`, 'success') }
      else { setError(`Code-barres ${barcode} introuvable.`); addNotification('Produit non trouvé.', 'warning') }
    } catch { setError(t('networkError')) }
    finally { setLoading(false) }
  }, [onSelectProduct, addNotification, t])

  return (
    <div className="p-4 pb-24">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input
          value={query} onChange={e => { setQuery(e.target.value); setError('') }}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-14 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-fi-green focus:ring-2 focus:ring-fi-green/10 bg-white shadow-sm"
          autoComplete="off" autoFocus
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setError('') }}
              className="p-1 text-gray-300 hover:text-gray-500"><X size={14}/></button>
          )}
          <button onClick={() => setShowScanner(true)}
            className="p-1.5 rounded-xl bg-fi-green/10 text-fi-green hover:bg-fi-green/20 transition-colors"
            title={t('scanBarcode')}>
            <Camera size={16}/>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="flex items-start gap-2 p-3 bg-fi-red-light border border-red-100 rounded-xl text-sm text-fi-red mb-4">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0"/>{error}
        </div>
      )}

      {/* Skeleton loaders */}
      {loading && <div className="space-y-2.5">{[1,2,3,4].map(i=><SkeletonCard key={i}/>)}</div>}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 mb-2">{t('searchResults', results.length)}</p>
          {results.map((p,i) => <ProductCard key={p.code} product={p} onSelect={onSelectProduct} index={i}/>)}
        </div>
      )}

      {/* Empty / suggestions */}
      {!loading && !results.length && !error && (
        <div className="pt-6">
          <p className="text-xs text-gray-400 mb-3 text-center">{t('suggestions')}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setQuery(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-fi-green hover:text-fi-green bg-white transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {showScanner && <BarcodeScanner onDetected={handleScanDetected} onClose={() => setShowScanner(false)}/>}
    </div>
  )
}
