export const fmt  = (v, unit='', dec=1) => v!=null&&!isNaN(v) ? `${parseFloat(Number(v).toFixed(dec))}${unit}` : 'Donnée non disponible'
export const pct  = (v, max) => v!=null&&max ? Math.min(100, Math.round((v/max)*100)) : 0
export const round1 = v => Math.round(v*10)/10
export const round0 = v => Math.round(v)

export const GRADE_COLORS = { A:'#1D9E75', B:'#85BB2F', C:'#FFCC00', D:'#FF6600', E:'#E8000B' }
export const gradeColor = g => GRADE_COLORS[(g||'').toUpperCase()] || '#888780'
export const co2Color = v => v==null?'#888780':v<1?'#1D9E75':v<3?'#85BB2F':v<6?'#EF9F27':v<10?'#E05A2B':'#A32D2D'
export const co2Label = v => v==null?'Donnée non disponible':v<1?'Très faible':v<3?'Faible':v<6?'Modéré':v<10?'Élevé':'Très élevé'

export function computeHealthSim(product, profile, years=20) {
  const { age=30, weight=70, height=175, activity='leger', freq=3 } = profile
  const n = product?.nutriments || {}
  const bmr = 10*weight + 6.25*height - 5*age + 5
  const actF = { sedentaire:1.2, leger:1.375, modere:1.55, actif:1.725 }[activity] || 1.375
  const tdee = round0(bmr * actF)
  const kcalPer100 = n['energy-kcal_100g'] || 0
  const servingKcal = kcalPer100 * 1.5
  const dailyExtra  = round0((freq/7) * servingKcal)
  const surplus     = Math.max(0, dailyExtra - round0(tdee*0.1))
  const bmiNow      = round1(weight/((height/100)**2))
  const weightGain  = round1(Math.max(0, surplus*365*years/7700))
  const bmi20y      = round1((weight+weightGain)/((height/100)**2))
  const sugarRisk   = n.sugars_100g           ? Math.min(1,n.sugars_100g/50)             : 0
  const fatRisk     = n['saturated-fat_100g'] ? Math.min(1,n['saturated-fat_100g']/20)   : 0
  const saltRisk    = n.salt_100g             ? Math.min(1,n.salt_100g/3)                : 0
  const freqMult    = Math.min(2.5, freq/3)
  const yearsMult   = Math.min(2,   years/20)
  const bmiRisk     = Math.min(1, Math.max(0,(bmi20y-25)/15))
  const risks = [
    { label:'Caries dentaires',           icon:'🦷', value:Math.min(1,sugarRisk*freqMult*yearsMult*0.9) },
    { label:'Surpoids / obésité',         icon:'⚖',  value:Math.min(1,bmiRisk+fatRisk*freqMult*yearsMult*0.2) },
    { label:'Maladies cardiovasculaires', icon:'❤',  value:Math.min(1,fatRisk*freqMult*yearsMult*0.85) },
    { label:'Hypertension artérielle',    icon:'💉', value:Math.min(1,saltRisk*freqMult*yearsMult*0.9) },
    { label:'Diabète type 2',             icon:'🩸', value:Math.min(1,sugarRisk*freqMult*yearsMult*0.75) },
  ]
  const overallRisk = risks.reduce((a,r)=>a+r.value,0)/risks.length
  return { bmiNow, bmi20y, weightGain20y:weightGain, tdee, dailyExtra, risks, overallRisk }
}

export function computeEcoSim(product, freq, years=20, populationMult=1) {
  const co2Per100g = product?.carbon_footprint_from_known_ingredients_100g
  const eco = product?.ecoscore_grade?.toLowerCase()
  const ecoMap = { a:90, b:72, c:52, d:30, e:10 }
  const yearlyKgOne = co2Per100g!=null ? round1(co2Per100g*freq*52*1.5) : null
  const totalKg     = yearlyKgOne!=null ? round1(yearlyKgOne*years*populationMult) : null
  const rawScore    = ecoMap[eco] ?? 50
  const scoreAdj    = yearlyKgOne!=null ? Math.max(5,Math.min(95,rawScore-yearlyKgOne*1.5)) : rawScore
  const kmCar       = yearlyKgOne!=null ? round0(yearlyKgOne*4.5) : null
  const treeMonths  = yearlyKgOne!=null ? round0(yearlyKgOne*4)   : null
  const flights     = yearlyKgOne!=null ? round0(yearlyKgOne/0.255) : null
  return { yearlyKg:yearlyKgOne, totalKg, score:Math.round(scoreAdj), kmCar, treeMonths, flights, rawEco:eco }
}

export function haversineKm([lat1,lon1],[lat2,lon2]) {
  const R=6371,d2r=Math.PI/180
  const dLat=(lat2-lat1)*d2r, dLon=(lon2-lon1)*d2r
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*d2r)*Math.cos(lat2*d2r)*Math.sin(dLon/2)**2
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))
}
export const formatDate = d => new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})
