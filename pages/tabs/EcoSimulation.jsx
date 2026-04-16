import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { computeEcoSim } from '../../utils/helpers'
import EcoWorld from '../../components/EcoWorld'

const POPULATION_OPTIONS = [
  { key:'moi',       label:'Moi seul',          mult:1,            icon:'👤' },
  { key:'village',   label:'Village (~500)',     mult:500,          icon:'🏘' },
  { key:'ville',     label:'Ville (~100k)',      mult:100_000,      icon:'🏙' },
  { key:'pays',      label:'Pays (~68M)',        mult:68_000_000,   icon:'🇫🇷' },
  { key:'continent', label:'Europe (~750M)',     mult:750_000_000,  icon:'🌍' },
  { key:'humanite',  label:'Humanité (8Mrd)',    mult:8_100_000_000,icon:'🌏' },
]

function formatBigNumber(n) {
  if (n == null) return 'N/D'
  if (n >= 1e12) return `${(n/1e12).toFixed(1)} Gt`
  if (n >= 1e9)  return `${(n/1e9).toFixed(2)} Mt`
  if (n >= 1e6)  return `${(n/1e6).toFixed(1)} kt`
  if (n >= 1e3)  return `${(n/1e3).toFixed(1)} t`
  return `${n} kg`
}

export default function EcoSimulation({ product }) {
  const { userProfile } = useApp()
  const [freq,     setFreq]     = useState(userProfile.freq || 3)
  const [duration, setDuration] = useState(20)
  const [popKey,   setPopKey]   = useState('moi')

  const pop  = POPULATION_OPTIONS.find(p => p.key === popKey)
  const sim  = useMemo(() => computeEcoSim(product, freq, duration, pop.mult), [product, freq, duration, pop])
  const sc   = s => s>=70?'#1D9E75':s>=45?'#BA7517':'#A32D2D'

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Controls */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Paramètres de simulation</h3>
        <div className="space-y-3">
          {/* Frequency */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-600">Fréquence de consommation</label>
              <span className="text-xs font-semibold text-fi-green">{freq}×/semaine</span>
            </div>
            <input type="range" min="1" max="21" step="1" value={freq}
              onChange={e=>setFreq(+e.target.value)} className="w-full"/>
            <div className="flex justify-between text-xs text-gray-300 mt-0.5"><span>1×</span><span>3×/jour</span></div>
          </div>
          {/* Duration */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-600">Durée de projection</label>
              <span className="text-xs font-semibold text-fi-green">{duration} ans</span>
            </div>
            <input type="range" min="1" max="50" step="1" value={duration}
              onChange={e=>setDuration(+e.target.value)} className="w-full"/>
            <div className="flex justify-between text-xs text-gray-300 mt-0.5"><span>1 an</span><span>50 ans</span></div>
          </div>
          {/* Population scale */}
          <div>
            <label className="text-xs text-gray-600 block mb-2">Nombre de personnes consommant ce produit</label>
            <div className="grid grid-cols-3 gap-1.5">
              {POPULATION_OPTIONS.map(p => (
                <button key={p.key} onClick={() => setPopKey(p.key)}
                  className={`text-xs py-1.5 px-2 rounded-xl border transition-colors text-center ${
                    popKey===p.key ? 'bg-fi-green text-white border-fi-green' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className="text-base leading-none">{p.icon}</div>
                  <div className="mt-0.5 text-[10px] leading-tight">{p.label.split(' ')[0]}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">{pop.label}</p>
          </div>
        </div>
      </div>

      {/* Eco world */}
      <EcoWorld score={sim.score} yearlyKg={sim.yearlyKg} freq={freq}/>

      {/* Score + totals */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-1">Score impact</div>
          <motion.div className="text-2xl font-bold" initial={{opacity:0}} animate={{opacity:1}}
            style={{color:sc(sim.score)}}>{sim.score}/100</motion.div>
          <div className="text-xs text-gray-400">{sim.score>=70?'Faible':sim.score>=45?'Modéré':'Fort impact'}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-1">CO₂ / an / personne</div>
          <div className="text-2xl font-bold" style={{color:sim.yearlyKg!=null?sc(sim.score):'#888'}}>
            {sim.yearlyKg!=null?`${sim.yearlyKg} kg`:'N/D'}
          </div>
          <div className="text-xs text-gray-400">{freq}×/sem</div>
        </div>
      </div>

      {/* Total over duration + population */}
      {sim.totalKg != null && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-3">Impact total cumulé</h3>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <span className="text-3xl">{pop.icon}</span>
            <div>
              <div className="text-xl font-bold" style={{color:sc(sim.score)}}>{formatBigNumber(sim.totalKg)}</div>
              <div className="text-xs text-gray-500">{pop.label} × {duration} ans</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            CO₂ total = {sim.yearlyKg} kg/an/pers × {pop.mult.toLocaleString('fr-FR')} pers × {duration} ans
          </p>
        </div>
      )}

      {/* Equivalents */}
      {(sim.kmCar!=null||sim.treeMonths!=null) && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-3">Équivalences annuelles (1 personne)</h3>
          <div className="space-y-3">
            {sim.kmCar!=null && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚗</span>
                <div>
                  <div className="text-sm font-semibold">{sim.kmCar.toLocaleString('fr-FR')} km en voiture</div>
                  <div className="text-xs text-gray-400">≈ 0.22 kg CO₂/km</div>
                </div>
              </div>
            )}
            {sim.treeMonths!=null && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌳</span>
                <div>
                  <div className="text-sm font-semibold">{sim.treeMonths} mois d'absorption arbre</div>
                  <div className="text-xs text-gray-400">~3 kg CO₂/mois/arbre</div>
                </div>
              </div>
            )}
            {sim.flights!=null && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">✈️</span>
                <div>
                  <div className="text-sm font-semibold">{sim.flights.toLocaleString('fr-FR')} km en avion</div>
                  <div className="text-xs text-gray-400">≈ 0.255 kg CO₂/km/passager</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Narrative */}
      <div className="rounded-2xl p-4 border" style={{
        background:sim.score>=70?'#E1F5EE':sim.score>=45?'#FAEEDA':'#FCEBEB',
        borderColor:sim.score>=70?'rgba(29,158,117,.25)':sim.score>=45?'rgba(186,117,23,.25)':'rgba(163,45,45,.25)'
      }}>
        <p className="text-xs text-gray-700 leading-relaxed">
          {sim.score>=75
            ? `🌱 Faible impact. ${sim.yearlyKg?`~${sim.yearlyKg} kg CO₂/an/pers.`:''}${popKey!=='moi'?` Pour ${pop.label} sur ${duration} ans : ${formatBigNumber(sim.totalKg)} CO₂.`:''} Continuez.`
            : sim.score>=45
            ? `⚡ Impact modéré. ${sim.yearlyKg?`${sim.yearlyKg} kg CO₂/an/pers, ~${sim.kmCar} km voiture.`:''}${popKey!=='moi'?` Total : ${formatBigNumber(sim.totalKg)}.`:''}`
            : `🔥 Fort impact. ${sim.yearlyKg?`${sim.yearlyKg} kg CO₂/an/pers.`:''}${popKey!=='moi'?` À l'échelle ${pop.label} sur ${duration} ans : ${formatBigNumber(sim.totalKg)} CO₂.`:''} Envisagez des alternatives.`}
        </p>
      </div>

      <p className="text-xs text-gray-400 text-center">Sources : Open Food Facts · Agribalyse (ADEME) · Méthode ACV</p>
    </div>
  )
}
