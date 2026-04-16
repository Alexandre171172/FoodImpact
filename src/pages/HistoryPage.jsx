import React, { useMemo } from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'

function gradeColor(g) {
  const m = { A:'#1D9E75', B:'#85BB2F', C:'#FFCC00', D:'#FF6600', E:'#E8000B' }
  return m[(g||'').toUpperCase()] || '#888'
}

function dateLabel(dateStr) {
  const d    = new Date(dateStr)
  const now  = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })
}

function groupByDay(history) {
  const groups = {}
  for (const item of history) {
    const day = new Date(item.viewedAt).toISOString().slice(0,10)
    if (!groups[day]) groups[day] = []
    groups[day].push(item)
  }
  return Object.entries(groups).sort((a,b) => b[0].localeCompare(a[0]))
}

export default function HistoryPage({ onSelectProduct }) {
  const { getHistory, user } = useApp()
  const { t } = useLang()
  const history = useMemo(() => getHistory(), [getHistory, user])
  const grouped = useMemo(() => groupByDay(history), [history])

  if (!history.length) {
    return (
      <div className="p-4 pb-24">
        <h1 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Clock size={16} className="text-gray-400"/>{t('history')}
        </h1>
        <div className="text-center py-16 text-gray-400">
          <Clock size={36} className="mx-auto mb-3 text-gray-200"/>
          <p className="text-sm">Aucun historique.</p>
          <p className="text-xs mt-1">Analysez des produits pour les voir ici.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-base font-semibold mb-4 flex items-center gap-2">
        <Clock size={16} className="text-gray-400"/>{t('history')}
      </h1>
      {!user && (
        <div className="bg-fi-blue-light border border-blue-100 rounded-xl p-3 text-xs text-fi-blue mb-4">
          💡 Connectez-vous pour conserver votre historique.
        </div>
      )}
      <div className="space-y-1">
        {grouped.map(([day, items]) => (
          <div key={day}>
            {/* Day header */}
            <div className="flex items-center gap-2 py-2 px-1">
              <div className="flex-1 h-px bg-gray-100"/>
              <span className="text-xs font-semibold text-gray-400 capitalize">{dateLabel(day)}</span>
              <div className="flex-1 h-px bg-gray-100"/>
            </div>
            <div className="space-y-1.5">
              {items.map((p, i) => (
                <button key={`${p.code}-${i}`} onClick={() => onSelectProduct(p)}
                  className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 hover:border-fi-green/40 active:scale-98 transition-all text-left">
                  <div className="w-11 h-11 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                    {p.image_small_url || p.image_url
                      ? <img src={p.image_small_url||p.image_url} alt="" className="w-full h-full object-contain" onError={e=>e.target.style.display='none'}/>
                      : <span className="text-lg">🍽</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{p.product_name}</div>
                    <div className="text-xs text-gray-400 truncate">{p.brands || 'Marque inconnue'}</div>
                    <div className="text-xs text-gray-300 mt-0.5">
                      {new Date(p.viewedAt).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.nutriscore_grade && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: gradeColor(p.nutriscore_grade) }}>
                        {p.nutriscore_grade.toUpperCase()}
                      </div>
                    )}
                    <ChevronRight size={14} className="text-gray-300"/>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
