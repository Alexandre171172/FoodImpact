import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Flag, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

const CATEGORIES = [
  'Donnée nutritionnelle erronée',
  'Image incorrecte',
  'Produit en double',
  'Contenu inapproprié',
  'Allergène non indiqué',
  'Autre',
]

export default function ReportModal({ product, onClose }) {
  const { addReport } = useApp()
  const [category, setCategory] = useState('')
  const [details,  setDetails]  = useState('')
  const [sent,     setSent]     = useState(false)

  const submit = () => {
    if (!category) return
    addReport({ product: product?.product_name || 'Produit inconnu', category, details })
    setSent(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 modal-backdrop z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {!sent ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Flag size={16} className="text-fi-red" />
                <h2 className="text-sm font-medium">Signaler un problème</h2>
              </div>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-4">
              {product?.product_name && (
                <p className="text-xs text-gray-400 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                  📦 {product.product_name}
                </p>
              )}
              <p className="text-xs font-medium text-gray-700 mb-3">Catégorie du problème</p>
              <div className="space-y-2 mb-4">
                {CATEGORIES.map(c => (
                  <label key={c} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${category === c ? 'border-fi-green bg-fi-green' : 'border-gray-300 group-hover:border-fi-green'}`}>
                      {category === c && <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>}
                    </div>
                    <input type="radio" name="cat" value={c} className="sr-only" onChange={() => setCategory(c)} />
                    <span className="text-sm text-gray-700">{c}</span>
                  </label>
                ))}
              </div>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Détails supplémentaires (optionnel)…"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-fi-green resize-none"
              />
            </div>
            <div className="flex gap-2 p-4 border-t border-gray-100">
              <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Annuler</button>
              <button
                onClick={submit}
                disabled={!category}
                className="flex-1 py-2.5 text-sm bg-fi-red text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-40"
              >
                Envoyer
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <CheckCircle size={40} className="mx-auto text-fi-green mb-3" />
            <h3 className="text-sm font-medium mb-1">Signalement envoyé</h3>
            <p className="text-xs text-gray-400 mb-4">L'équipe a été notifiée. Merci pour votre contribution !</p>
            <button onClick={onClose} className="bg-fi-green text-white text-sm px-6 py-2 rounded-xl hover:bg-fi-green-dark transition-colors">
              Fermer
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
