import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Leaf, Heart, FlaskConical, TrendingUp, ChevronRight, Flame, Activity } from 'lucide-react'
import { useApp } from '../context/AppContext'
import NutriRing from '../components/NutriRing'

const FEATURES = [
  { icon: Flame,        color: '#FF6600', bg: '#FFF3E8', label: 'Calories',         desc: 'Apport énergétique détaillé' },
  { icon: Activity,     color: '#185FA5', bg: '#E6F1FB', label: 'Effort physique',   desc: 'Équivalent en activité' },
  { icon: Leaf,         color: '#1D9E75', bg: '#E1F5EE', label: 'Empreinte carbone', desc: 'Impact environnemental' },
  { icon: FlaskConical, color: '#534AB7', bg: '#EEEDFE', label: 'Composition',       desc: 'Additifs et risques' },
  { icon: TrendingUp,   color: '#A32D2D', bg: '#FCEBEB', label: 'Simulation',        desc: 'Impact sur 20 ans' },
]

export default function HomePage({ onNavigate, onSelectProduct }) {
  const { getHistory } = useApp()
  const recent = useMemo(() => getHistory().slice(0, 5), [getHistory])

  const gradeColor = g => {
    const m = { A:'#1D9E75', B:'#85BB2F', C:'#FFCC00', D:'#FF6600', E:'#E8000B' }
    return m[(g||'').toUpperCase()] || '#888'
  }

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Hero */}
      <div className="px-5 pt-8 pb-6 text-center bg-gradient-to-b from-fi-green-light to-white">
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div className="inline-flex items-center gap-1.5 bg-fi-green text-white text-xs px-3 py-1 rounded-full mb-4 font-medium">
            ✨ Analysez vos aliments
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
            Découvrez l'impact<br/>
            <span className="text-fi-green">de votre alimentation</span>
          </h1>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Scannez ou recherchez un produit pour obtenir une analyse complète
          </p>
        </motion.div>

        {/* Search tap target */}
        <motion.button
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          onClick={() => onNavigate('search')}
          className="w-full max-w-sm mx-auto flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3.5 shadow-sm hover:border-fi-green transition-colors text-left"
        >
          <Search size={18} className="text-fi-green flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">Rechercher un produit</div>
            <div className="text-xs text-gray-400">Nom, marque ou code-barres</div>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </motion.button>
      </div>

      {/* Features grid */}
      <div className="px-4 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">CE QUE VOUS DÉCOUVRIREZ</p>
        <div className="grid grid-cols-2 gap-2.5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              onClick={() => onNavigate('search')}
              style={{ background: f.bg }}
              className="rounded-2xl p-4 cursor-pointer active:scale-95 transition-transform"
            >
              <f.icon size={22} color={f.color} strokeWidth={1.8} className="mb-2" />
              <div className="text-sm font-semibold text-gray-800">{f.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent history */}
      {recent.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">RÉCEMMENT CONSULTÉS</p>
            <button onClick={() => onNavigate('history')}
              className="text-xs text-fi-green font-medium">Tout voir</button>
          </div>
          <div className="space-y-2">
            {recent.map((p, i) => (
              <motion.button
                key={`${p.code}-${i}`}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                onClick={() => onSelectProduct(p)}
                className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 hover:border-fi-green/40 transition-colors active:scale-98 text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {p.image_small_url || p.image_url ? (
                    <img src={p.image_small_url || p.image_url} alt="" className="w-full h-full object-contain"
                      onError={e => { e.target.style.display='none' }} />
                  ) : <span className="text-lg">🍽</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{p.product_name}</div>
                  <div className="text-xs text-gray-400 truncate">{p.brands || 'Marque inconnue'}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.nutriscore_grade && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: gradeColor(p.nutriscore_grade) }}>
                      {p.nutriscore_grade.toUpperCase()}
                    </div>
                  )}
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Footer links */}
      <div className="px-4 mt-8 pb-2 flex justify-center gap-4">
        <button onClick={() => onNavigate('legal')} className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
          Confidentialité
        </button>
        <span className="text-gray-200">·</span>
        <button onClick={() => onNavigate('legal')} className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
          Conditions d'utilisation
        </button>
        <span className="text-gray-200">·</span>
        <button onClick={() => onNavigate('legal')} className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
          Crédits
        </button>
      </div>
    </div>
  )
}
