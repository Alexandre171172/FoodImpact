import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import NutriRing from './NutriRing'
import { useApp } from '../context/AppContext'

export default function ProductCard({ product, onSelect, index = 0 }) {
  const { toggleFavorite, isFavorite } = useApp()
  const fav = isFavorite(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer fi-card-hover relative group"
      onClick={() => onSelect(product)}
    >
      <div className="flex gap-3 items-start">
        {/* Image */}
        <div className="w-14 h-14 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {product.image_small_url ? (
            <img
              src={product.image_small_url}
              alt={product.product_name}
              className="w-full h-full object-contain"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            />
          ) : null}
          <span style={{ display: product.image_small_url ? 'none' : 'flex', fontSize: 24 }}>🍽</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate mb-0.5">{product.product_name}</h3>
          <p className="text-xs text-gray-400 mb-2 truncate">{product.brands || 'Marque inconnue'}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {product.nutriscore_grade && (
              <NutriRing grade={product.nutriscore_grade} size={28} label="Nutri" />
            )}
            {product.ecoscore_grade && (
              <NutriRing grade={product.ecoscore_grade} size={28} label="Eco" />
            )}
            {!product.nutriscore_grade && !product.ecoscore_grade && (
              <span className="text-xs text-gray-300 italic">Scores non disponibles</span>
            )}
          </div>
        </div>

        {/* Favorite button */}
        <button
          onClick={e => { e.stopPropagation(); toggleFavorite(product) }}
          className={`p-1.5 rounded-lg transition-all ${fav ? 'text-amber-400' : 'text-gray-200 hover:text-gray-400'}`}
          title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Star size={16} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.div>
  )
}
