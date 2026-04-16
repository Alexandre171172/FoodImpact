import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Flag, Star, AlertTriangle } from 'lucide-react'
import { getProduct } from '../api/openFoodFacts'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import NutriRing from '../components/NutriRing'
import NutriTable from '../components/NutriTable'
import CO2Gauge from '../components/CO2Gauge'
import OriginMap from '../components/OriginMap'
import ChemicalRisks from '../components/ChemicalRisks'
import HealthSimulation from './tabs/HealthSimulation'
import EcoSimulation from './tabs/EcoSimulation'
import ReportModal from '../modals/ReportModal'
import ProfileModal from '../modals/ProfileModal'

const TABS = [
  { id:'nutri',       label:'🥗 Nutrition'     },
  { id:'eco',         label:'🌿 Environnement' },
  { id:'origin',      label:'🌍 Origine'        },
  { id:'ingredients', label:'🧪 Ingrédients'   },
  { id:'chemicals',   label:'⚗️ Additifs'       },
  { id:'health',      label:'🧑‍⚕️ Santé 20 ans' },
  { id:'ecoworld',    label:'🌱 Planète'        },
]

export default function ProductDetailPage({ product: initialProduct, onBack }) {
  const { toggleFavorite, isFavorite, addToHistory } = useApp()
  const { t } = useLang()
  const [product,     setProduct]     = useState(initialProduct)
  const [loading,     setLoading]     = useState(false)
  const [activeTab,   setActiveTab]   = useState('nutri')
  const [showReport,  setShowReport]  = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Fetch full details if missing nutriments
  useEffect(() => {
    if (!product) return
    const hasNutri = product.nutriments && Object.keys(product.nutriments).length > 0
    if (!hasNutri && product.code) {
      setLoading(true)
      getProduct(product.code).then(full => {
        if (full) { setProduct(full); addToHistory(full) }
        setLoading(false)
      }).catch(() => setLoading(false))
    } else {
      addToHistory(product)
    }
  }, [product?.code])

  if (!product) return null
  const fav = isFavorite(product)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky back bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronLeft size={18}/> {t('back')}
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => toggleFavorite(product)}
            className={`p-1.5 rounded-lg transition-colors ${fav?'text-amber-400':'text-gray-300 hover:text-gray-500'}`}>
            <Star size={16} fill={fav?'currentColor':'none'}/>
          </button>
          <button onClick={() => setShowReport(true)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-fi-red hover:bg-fi-red-light transition-colors">
            <Flag size={11}/>{t('report')}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-3">
          {/* Product header card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex gap-3 items-start">
              <div className="w-20 h-20 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                {product.image_url||product.image_small_url ? (
                  <img src={product.image_url||product.image_small_url} alt={product.product_name}
                    className="w-full h-full object-contain" onError={e=>e.target.style.display='none'}/>
                ) : <span className="text-4xl">🍽</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold text-gray-900 leading-tight mb-0.5">{product.product_name}</h1>
                <p className="text-xs text-gray-400 mb-2">{product.brands || t('unknownBrand')}</p>
                {product.quantity && <p className="text-xs text-gray-400 mb-2">Quantité : {product.quantity}</p>}
                <div className="flex items-end gap-3 flex-wrap">
                  <NutriRing grade={product.nutriscore_grade} size={44} label="Nutri"/>
                  <NutriRing grade={product.ecoscore_grade}   size={44} label="Eco"/>
                  <div className="flex-1 min-w-28">
                    <CO2Gauge value={product.carbon_footprint_from_known_ingredients_100g}/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap border flex-shrink-0 transition-colors font-medium ${
                  activeTab===tab.id ? 'bg-fi-green text-white border-fi-green' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              transition={{duration:0.18}}>

              {activeTab==='nutri' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <h2 className="text-sm font-semibold mb-3">{t('nutritionPer100')}</h2>
                  {loading ? <div className="skeleton h-32 rounded-xl"/> : <NutriTable nutriments={product.nutriments}/>}
                </div>
              )}

              {activeTab==='eco' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
                  <h2 className="text-sm font-semibold">{t('envImpact')}</h2>
                  <CO2Gauge value={product.carbon_footprint_from_known_ingredients_100g}/>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Emballage</p>
                    {product.packaging_tags?.length
                      ? <div className="flex flex-wrap gap-1">{product.packaging_tags.slice(0,6).map(tg=><span key={tg} className="text-xs px-2 py-1 bg-gray-50 border border-gray-100 rounded-full text-gray-600">{tg.replace('en:','')}</span>)}</div>
                      : <p className="text-xs text-gray-400 italic">Non renseigné</p>}
                  </div>
                  <span className="source-badge">🌱 Open Food Facts · Agribalyse (ADEME)</span>
                </div>
              )}

              {activeTab==='origin' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <h2 className="text-sm font-semibold mb-4">{t('geographicOrigin')}</h2>
                  <OriginMap countriesTags={product.countries_tags} productName={product.product_name} categoriesTags={product.categories_tags}/>
                </div>
              )}

              {activeTab==='ingredients' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
                  <h2 className="text-sm font-semibold">{t('composition')}</h2>
                  {product.ingredients_text
                    ? <p className="text-sm text-gray-600 leading-relaxed">{product.ingredients_text}</p>
                    : <p className="text-sm text-gray-400 italic">Liste non disponible.</p>}
                  {product.allergens && (
                    <div className="bg-fi-amber-light border border-amber-200 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-fi-amber mt-0.5 flex-shrink-0"/>
                        <div>
                          <p className="text-xs font-semibold text-fi-amber">{t('allergens')}</p>
                          <p className="text-xs text-fi-amber/80 mt-0.5">{product.allergens}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab==='chemicals' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <h2 className="text-sm font-semibold mb-4">{t('chemicalsTitle')}</h2>
                  <ChemicalRisks additivesTags={product.additives_tags} ingredientsText={product.ingredients_text}/>
                </div>
              )}

              {activeTab==='health'   && <HealthSimulation product={product}/>}
              {activeTab==='ecoworld' && <EcoSimulation    product={product}/>}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {showReport  && <ReportModal product={product} onClose={()=>setShowReport(false)}/>}
      {showProfile && <ProfileModal onClose={()=>setShowProfile(false)}/>}
    </div>
  )
}
