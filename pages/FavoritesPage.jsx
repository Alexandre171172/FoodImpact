import React, { useMemo } from 'react'
import { Star, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'

function gradeColor(g) {
  const m = { A:'#1D9E75', B:'#85BB2F', C:'#FFCC00', D:'#FF6600', E:'#E8000B' }
  return m[(g||'').toUpperCase()] || '#888'
}

export default function FavoritesPage({ onSelectProduct }) {
  const { getFavorites, toggleFavorite, user } = useApp()
  const { t } = useLang()
  const favorites = useMemo(() => getFavorites(), [getFavorites, user])

  return (
    <div className="p-4 pb-24">
      <h1 className="text-base font-semibold mb-4 flex items-center gap-2">
        <Star size={16} className="text-amber-400" fill="currentColor"/>{t('favorites')}
      </h1>
      {!user && (
        <div className="bg-fi-blue-light border border-blue-100 rounded-xl p-3 text-xs text-fi-blue mb-4">
          💡 Connectez-vous pour synchroniser vos favoris.
        </div>
      )}
      {favorites.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Star size={36} className="mx-auto mb-3 text-gray-200"/>
          <p className="text-sm">Aucun favori.</p>
          <p className="text-xs mt-1">Appuyez sur ⭐ sur un produit.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((p, i) => (
            <button key={`${p.code}-${i}`} onClick={() => onSelectProduct(p)}
              className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 hover:border-fi-green/40 active:scale-98 transition-all text-left">
              <div className="w-11 h-11 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                {p.image_small_url||p.image_url
                  ? <img src={p.image_small_url||p.image_url} alt="" className="w-full h-full object-contain" onError={e=>e.target.style.display='none'}/>
                  : <span className="text-lg">🍽</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{p.product_name}</div>
                <div className="text-xs text-gray-400 truncate">{p.brands || 'Marque inconnue'}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.nutriscore_grade && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: gradeColor(p.nutriscore_grade) }}>
                    {p.nutriscore_grade.toUpperCase()}
                  </div>
                )}
                <button onClick={e => { e.stopPropagation(); toggleFavorite(p) }}
                  className="p-1 text-amber-400 hover:text-gray-300 transition-colors" title="Retirer des favoris">
                  <Star size={14} fill="currentColor"/>
                </button>
                <ChevronRight size={14} className="text-gray-300"/>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
