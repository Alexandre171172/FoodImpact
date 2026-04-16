import React, { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, Info } from 'lucide-react'

// Additive risk database (based on EFSA/ANSES assessments)
const ADDITIVE_DB = {
  'e102':  { name:'Tartrazine',        risk:'élevé',  color:'#E05A2B', health:'Hypersensibilité, hyperactivité chez l\'enfant (EFSA). Déconseillé aux personnes sensibles aux aspirines.', type:'Colorant' },
  'e110':  { name:'Jaune orangé S',    risk:'élevé',  color:'#E05A2B', health:'Effets sur l\'activité et l\'attention chez l\'enfant. Marquage obligatoire EU.', type:'Colorant' },
  'e122':  { name:'Azorubine',         risk:'élevé',  color:'#E05A2B', health:'Hyperactivité chez l\'enfant. Interdit dans certains pays.', type:'Colorant' },
  'e124':  { name:'Ponceau 4R',        risk:'élevé',  color:'#E05A2B', health:'Hyperactivité chez l\'enfant. Marquage EU obligatoire.', type:'Colorant' },
  'e129':  { name:'Rouge allura AC',   risk:'élevé',  color:'#E05A2B', health:'Hyperactivité, réactions allergiques. Marquage EU.', type:'Colorant' },
  'e133':  { name:'Bleu brillant',     risk:'modéré', color:'#EF9F27', health:'Peut provoquer des réactions chez personnes sensibles.', type:'Colorant' },
  'e200':  { name:'Acide sorbique',    risk:'faible', color:'#1D9E75', health:'Généralement reconnu sûr (GRAS). Conservateur naturel.', type:'Conservateur' },
  'e202':  { name:'Sorbate de potassium', risk:'faible', color:'#1D9E75', health:'Conservateur largement autorisé, bien toléré.', type:'Conservateur' },
  'e211':  { name:'Benzoate de sodium',risk:'modéré', color:'#EF9F27', health:'Peut interagir avec vitamine C pour former benzène (cancérigène potentiel). Hyperactivité.', type:'Conservateur' },
  'e220':  { name:'Dioxyde de soufre', risk:'modéré', color:'#EF9F27', health:'Peut provoquer des crises d\'asthme chez personnes sensibles.', type:'Conservateur' },
  'e250':  { name:'Nitrite de sodium', risk:'élevé',  color:'#E05A2B', health:'Peut former des nitrosamines cancérigènes lors de la cuisson. Limité par EFSA.', type:'Conservateur' },
  'e320':  { name:'BHA',              risk:'modéré', color:'#EF9F27', health:'Perturbateur endocrinien potentiel, cancérigène possible (IARC groupe 2B).', type:'Antioxydant' },
  'e321':  { name:'BHT',              risk:'modéré', color:'#EF9F27', health:'Effets hormono-mimétiques potentiels. Sous surveillance EFSA.', type:'Antioxydant' },
  'e330':  { name:'Acide citrique',   risk:'faible', color:'#1D9E75', health:'Naturellement présent dans les agrumes. Sûr dans les doses alimentaires.', type:'Acidifiant' },
  'e415':  { name:'Gomme xanthane',   risk:'faible', color:'#1D9E75', health:'Additif d\'origine naturelle, bien toléré. Peut être laxatif en grande quantité.', type:'Épaississant' },
  'e420':  { name:'Sorbitol',         risk:'faible', color:'#1D9E75', health:'Laxatif à forte dose. Déconseillé aux diabétiques en grande quantité.', type:'Édulcorant' },
  'e450':  { name:'Diphosphates',     risk:'modéré', color:'#EF9F27', health:'Excès de phosphates associé aux maladies rénales et cardiovasculaires.', type:'Agent levant' },
  'e471':  { name:'Mono/diglycérides',risk:'faible', color:'#1D9E75', health:'Émulsifiants dérivés de graisses. Généralement sûrs aux doses alimentaires.', type:'Émulsifiant' },
  'e476':  { name:'Polyricinoléate',  risk:'faible', color:'#1D9E75', health:'Émulsifiant utilisé dans le chocolat. Bien toléré.', type:'Émulsifiant' },
  'e500':  { name:'Bicarbonate',      risk:'faible', color:'#1D9E75', health:'Sel alimentaire courant. Sûr dans les doses alimentaires normales.', type:'Correcteur acidité' },
  'e621':  { name:'Glutamate (MSG)',  risk:'modéré', color:'#EF9F27', health:'Peut provoquer maux de tête et flush chez personnes sensibles. Déconseillé en grande quantité.', type:'Exhausteur' },
  'e951':  { name:'Aspartame',        risk:'élevé',  color:'#E05A2B', health:'Controversé : études récentes OMS suggèrent possible cancérigène (groupe 2B). Déconseillé PKU.', type:'Édulcorant' },
  'e952':  { name:'Cyclamate',        risk:'élevé',  color:'#E05A2B', health:'Interdit aux USA. Cancérigène potentiel selon études animales.', type:'Édulcorant' },
  'e954':  { name:'Saccharine',       risk:'modéré', color:'#EF9F27', health:'Anciennement liée au cancer (études murines). Réévaluée comme sûre par EFSA.', type:'Édulcorant' },
  'e955':  { name:'Sucralose',        risk:'faible', color:'#1D9E75', health:'Généralement sûr. Récentes études suggèrent effets sur microbiote intestinal.', type:'Édulcorant' },
  'e960':  { name:'Stévia (glycosides)', risk:'faible', color:'#1D9E75', health:'Édulcorant naturel. Bien toléré. Approuvé EFSA.', type:'Édulcorant' },
}

function AdditiveRow({ code }) {
  const [open, setOpen] = useState(false)
  const key  = code.toLowerCase().replace('en:','')
  const info = ADDITIVE_DB[key]
  const id   = key.toUpperCase()

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
      >
        {info ? (
          <span className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ background: info.color }} />
        ) : (
          <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
        )}
        <span className="text-sm font-medium text-gray-800 flex-1">
          {id}{info ? ` — ${info.name}` : ''}
        </span>
        {info && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{
            background: info.color + '22', color: info.color,
          }}>
            {info.risk}
          </span>
        )}
        {info && (
          <span className="text-xs text-gray-400 hidden sm:block">{info.type}</span>
        )}
        {open ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0"/> : <ChevronRight size={14} className="text-gray-400 flex-shrink-0"/>}
      </button>

      {open && (
        <div className="px-4 pb-3 border-t border-gray-50">
          {info ? (
            <div className="mt-2 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} style={{ color: info.color }} className="mt-0.5 flex-shrink-0"/>
                <p className="text-xs text-gray-700 leading-relaxed">{info.health}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Type : {info.type}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: info.color+'22', color: info.color }}>
                  Risque : {info.risk}
                </span>
              </div>
              <p className="text-xs text-gray-400">Source : EFSA · ANSES · CIRC/IARC</p>
            </div>
          ) : (
            <div className="mt-2 flex items-start gap-2">
              <Info size={13} className="text-gray-400 mt-0.5 flex-shrink-0"/>
              <p className="text-xs text-gray-500">Informations détaillées non disponibles pour {id} dans notre base. Consultez <a href={`https://www.additifs-alimentaires.net/${key}`} target="_blank" rel="noreferrer" className="text-fi-blue underline">additifs-alimentaires.net</a>.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ChemicalRisks({ additivesTags = [], ingredientsText = '' }) {
  const hasAdditives = additivesTags && additivesTags.length > 0

  if (!hasAdditives) {
    return (
      <div className="bg-fi-green-light border border-fi-green/20 rounded-xl p-4 text-center">
        <div className="text-2xl mb-1">✅</div>
        <p className="text-sm text-fi-green-dark font-medium">Aucun additif listé</p>
        <p className="text-xs text-fi-green-dark/70 mt-1">Aucun additif E-xxx détecté dans Open Food Facts pour ce produit.</p>
      </div>
    )
  }

  // Count risks
  const counts = { élevé: 0, modéré: 0, faible: 0, inconnu: 0 }
  additivesTags.forEach(code => {
    const key = code.toLowerCase().replace('en:','')
    const info = ADDITIVE_DB[key]
    if (info) counts[info.risk]++
    else counts.inconnu++
  })

  return (
    <div className="space-y-4">
      {/* Risk summary */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Élevé', count: counts.élevé, color: '#E05A2B', bg: '#FCEBEB' },
          { label: 'Modéré', count: counts.modéré, color: '#EF9F27', bg: '#FAEEDA' },
          { label: 'Faible', count: counts.faible, color: '#1D9E75', bg: '#E1F5EE' },
          { label: 'Inconnu', count: counts.inconnu, color: '#888780', bg: '#F1EFE8' },
        ].map(r => (
          <div key={r.label} style={{ background: r.bg, borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: r.color }}>{r.count}</div>
            <div style={{ fontSize: 10, color: r.color }}>{r.label}</div>
          </div>
        ))}
      </div>

      {/* Additives list */}
      <div className="space-y-2">
        {additivesTags.map(code => <AdditiveRow key={code} code={code} />)}
      </div>

      <p className="text-xs text-gray-400">
        Base de données additifs : EFSA · ANSES · CIRC. Évaluations mises à jour régulièrement. Données Open Food Facts.
      </p>
    </div>
  )
}
