import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { computeHealthSim } from '../../utils/helpers'

/* DiceBear: always use API regardless of avatarEmoji choice */
function HealthDiceBear({ bmi, risk, seed, size = 90 }) {
  const bmiClamp = Math.max(16, Math.min(45, bmi))
  const skin = risk > 0.65 ? 'fdbcb4' : risk > 0.35 ? 'f8d25c' : 'ae5d29'
  const eyes = risk > 0.65 ? 'squint' : risk > 0.35 ? 'default' : 'happy'
  const mouth= risk > 0.65 ? 'sad' : risk > 0.35 ? 'serious' : 'smile'
  const accProb = risk > 0.6 ? '100' : '0'
  const params = new URLSearchParams({
    seed, skinColor: skin, eyes, mouth,
    accessories: 'kurt', accessoriesProbability: accProb,
    backgroundColor: 'transparent',
  })
  const url = `https://api.dicebear.com/8.x/avataaars/svg?${params}`
  const borderCol = risk > 0.65 ? '#E05A2B' : risk > 0.35 ? '#EF9F27' : '#1D9E75'

  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <img src={url} alt="Avatar santé"
        style={{ width:size, height:size, borderRadius:'50%', border:`3px solid ${borderCol}`, background:'#f5f5f3', objectFit:'cover' }}
        onError={e => {
          e.target.style.display='none'
          e.target.nextSibling && (e.target.nextSibling.style.display='flex')
        }}
      />
      <div style={{
        display:'none', width:size, height:size, borderRadius:'50%',
        background: risk>0.65?'#FCEBEB':risk>0.35?'#FAEEDA':'#E1F5EE',
        border:`3px solid ${borderCol}`, alignItems:'center', justifyContent:'center', fontSize:size*0.4
      }}>
        {risk>0.65?'😓':risk>0.35?'😐':'😊'}
      </div>
    </div>
  )
}

/* Body diagram: SVG body silhouette with risk overlays */
function BodyDiagram({ risks }) {
  const rc = v => v>0.65?'#E05A2B':v>0.35?'#EF9F27':'#1D9E75'
  const ro = v => Math.max(0.15, v*0.85)
  const riskMap = {}
  risks.forEach(r => { riskMap[r.key] = r.value })

  return (
    <svg viewBox="0 0 80 160" width="80" height="160" style={{ display:'block', margin:'0 auto' }}>
      {/* Body outline */}
      <circle cx="40" cy="18" r="13" fill="#f8d4b4" stroke="#e0b89a" strokeWidth="1"/>
      <rect x="27" y="30" width="26" height="38" rx="8" fill="#4A90E2" opacity="0.7"/>
      <rect x="18" y="32" width="10" height="30" rx="5" fill="#f8d4b4"/>
      <rect x="52" y="32" width="10" height="30" rx="5" fill="#f8d4b4"/>
      <rect x="28" y="66" width="11" height="44" rx="6" fill="#f8d4b4"/>
      <rect x="41" y="66" width="11" height="44" rx="6" fill="#f8d4b4"/>

      {/* Organ overlays */}
      {/* Heart (cardiovascular) */}
      <ellipse cx="38" cy="42" rx="5" ry="4"
        fill={rc(riskMap.cardio||0)} opacity={ro(riskMap.cardio||0)} title="Cœur"/>
      {/* Liver/metabolic */}
      <ellipse cx="45" cy="50" rx="6" ry="4"
        fill={rc(riskMap.obesity||0)} opacity={ro(riskMap.obesity||0)} title="Métabolisme"/>
      {/* Kidney / hypertension */}
      <ellipse cx="35" cy="52" rx="3" ry="3.5"
        fill={rc(riskMap.hyper||0)} opacity={ro(riskMap.hyper||0)} title="Reins"/>
      {/* Teeth */}
      <ellipse cx="40" cy="25" rx="5" ry="3"
        fill={rc(riskMap.caries||0)} opacity={ro(riskMap.caries||0)} title="Dents"/>
      {/* Pancreas/diabetes */}
      <ellipse cx="42" cy="56" rx="4" ry="2.5"
        fill={rc(riskMap.diabetes||0)} opacity={ro(riskMap.diabetes||0)} title="Pancréas"/>
    </svg>
  )
}

/* Biological age estimate */
function bioAge(actualAge, overallRisk) {
  return Math.round(actualAge + overallRisk * 15)
}

export default function HealthSimulation({ product }) {
  const { userProfile, user } = useApp()
  const [freq,     setFreq]     = useState(userProfile.freq || 3)
  const [duration, setDuration] = useState(20)

  const sim = useMemo(() => computeHealthSim(product, { ...userProfile, freq }, duration), [product, userProfile, freq, duration])

  const riskKeys = ['caries','obesity','cardio','hyper','diabetes']
  const risky = sim.risks.map((r, i) => ({ ...r, key: riskKeys[i] }))

  const rc   = v => v>0.65?'#A32D2D':v>0.35?'#BA7517':'#1D9E75'
  const rbg  = v => v>0.65?'bg-fi-red-light border-red-100':v>0.35?'bg-fi-amber-light border-amber-100':'bg-fi-green-light border-fi-green/20'
  const rt   = v => v>0.65?'text-fi-red':v>0.35?'text-fi-amber':'text-fi-green'

  const biologicalAge = bioAge(userProfile.age, sim.overallRisk)
  const bmiCat = bmi => bmi<18.5?'Insuffisance pondérale':bmi<25?'Poids normal':bmi<30?'Surpoids':bmi<35?'Obésité modérée':'Obésité sévère'

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Controls */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Paramètres de simulation</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-600">Fréquence de consommation</label>
              <span className="text-xs font-semibold text-fi-green">{freq}×/semaine</span>
            </div>
            <input type="range" min="1" max="21" step="1" value={freq}
              onChange={e => setFreq(+e.target.value)} className="w-full"/>
            <div className="flex justify-between text-xs text-gray-300 mt-0.5">
              <span>1×/sem</span><span>3×/jour</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-600">Durée de projection</label>
              <span className="text-xs font-semibold text-fi-green">{duration} ans</span>
            </div>
            <input type="range" min="1" max="50" step="1" value={duration}
              onChange={e => setDuration(+e.target.value)} className="w-full"/>
            <div className="flex justify-between text-xs text-gray-300 mt-0.5">
              <span>1 an</span><span>50 ans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar + body + key metrics */}
      <div className="grid grid-cols-3 gap-2">
        {/* DiceBear avatar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 col-span-1">
          <HealthDiceBear
            bmi={sim.bmi20y}
            risk={sim.overallRisk}
            seed={user?.email || 'anonymous'}
            size={80}
          />
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-700">IMC {sim.bmi20y}</div>
            <div className="text-xs text-gray-400">{bmiCat(sim.bmi20y)}</div>
          </div>
        </div>

        {/* Body diagram */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 col-span-1">
          <BodyDiagram risks={risky}/>
          <div className="text-xs text-gray-400 text-center mt-1">Zones à risque</div>
        </div>

        {/* Key numbers */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col justify-center gap-2 col-span-1">
          {[
            { label:'IMC actuel',  val:sim.bmiNow,              warn:false },
            { label:`IMC +${duration}ans`, val:sim.bmi20y,      warn:sim.bmi20y>30 },
            { label:'Prise poids', val:`+${sim.weightGain20y}kg`,warn:sim.weightGain20y>8 },
            { label:'Âge bio. est.',val:`${biologicalAge} ans`, warn:biologicalAge>userProfile.age+10 },
          ].map(r => (
            <div key={r.label} className="text-center">
              <div className={`text-sm font-bold ${r.warn?'text-fi-red':'text-gray-800'}`}>{r.val}</div>
              <div className="text-xs text-gray-400 leading-tight">{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk gauges */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold mb-3">Risques dans {duration} ans</h3>
        <div className="space-y-3">
          {risky.map((r, i) => (
            <div key={r.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 flex items-center gap-1.5">
                  <span>{r.icon}</span>{r.label}
                </span>
                <span className="text-sm font-bold" style={{ color:rc(r.value) }}>
                  {Math.round(r.value*100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  initial={{ width:0 }} animate={{ width:`${Math.round(r.value*100)}%` }}
                  transition={{ duration:0.7, delay:i*0.08 }}
                  style={{ background:rc(r.value) }}/>
              </div>
              <div className={`text-xs mt-0.5 ${rt(r.value)}`}>
                {r.value>0.65?'Risque élevé':r.value>0.35?'Risque modéré':'Risque faible'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed risk cards */}
      <div className="space-y-2">
        {risky.map(r => (
          <div key={r.label} className={`flex items-center gap-3 p-3 rounded-2xl border ${rbg(r.value)}`}>
            <span className="text-2xl">{r.icon}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800">{r.label}</div>
              <div className={`text-xs mt-0.5 ${rt(r.value)}`}>
                {Math.round(r.value*100)}% —{r.value>0.65?' Risque élevé':r.value>0.35?' Modéré':' Faible'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold"
              style={{ borderColor:rc(r.value), color:rc(r.value) }}>
              {Math.round(r.value*100)}
            </div>
          </div>
        ))}
      </div>

      {/* Caloric analysis */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold mb-3">Bilan calorique</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label:'TDEE estimé',     val:`${sim.tdee} kcal/j`,   sub:'Dépense de base' },
            { label:'Apport produit',  val:`+${sim.dailyExtra} kcal/j`, sub:`${freq}×/sem` },
            { label:'Surplus',         val:`${Math.max(0,sim.dailyExtra-Math.round(sim.tdee*0.1))} kcal/j`, sub:'vs référence' },
            { label:'Prise de poids',  val:`+${sim.weightGain20y} kg`, sub:`sur ${duration} ans` },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-2.5">
              <div className="text-xs text-gray-400">{s.label}</div>
              <div className="text-sm font-bold text-gray-800 mt-0.5">{s.val}</div>
              <div className="text-xs text-gray-300">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Narrative */}
      <div className="bg-fi-amber-light border border-amber-200 rounded-2xl p-4">
        <p className="text-xs text-gray-700 leading-relaxed">
          {sim.overallRisk>0.65
            ? `⚠️ À ${freq}×/semaine sur ${duration} ans, ce produit représente un risque santé élevé. Prise de poids estimée : +${sim.weightGain20y} kg. IMC projeté : ${sim.bmi20y} (${bmiCat(sim.bmi20y)}). Consultez un professionnel de santé.`
            : sim.overallRisk>0.35
            ? `⚡ Impact modéré à ${freq}×/semaine sur ${duration} ans. Bilan calorique : +${sim.dailyExtra} kcal/j vs TDEE ${sim.tdee} kcal. Variez votre alimentation.`
            : `✅ Profil compatible avec ${freq}×/semaine sur ${duration} ans dans une alimentation variée. IMC projeté : ${sim.bmi20y} (${bmiCat(sim.bmi20y)}).`}
        </p>
      </div>

      <p className="text-xs text-gray-400 text-center">⚠️ Simulation indicative (Harris-Benedict). Ne constitue pas un avis médical.</p>
    </div>
  )
}
