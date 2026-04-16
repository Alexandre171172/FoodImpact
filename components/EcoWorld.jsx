import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function EcoWorld({ score = 50, yearlyKg = null, freq = 3 }) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % 3600), 100)
    return () => clearInterval(id)
  }, [])

  const great    = score >= 75
  const good     = score >= 50
  const moderate = score >= 30
  const critical = score < 20

  const skyTop  = critical ? '#3d2b1f' : good ? '#3da8d8' : '#8B7355'
  const skyBot  = critical ? '#5a3a1f' : good ? '#87CEEB' : '#b8956a'
  const gndCol  = critical ? '#5c3a1e' : great ? '#2E7D32' : good ? '#4CAF50' : moderate ? '#8d6e3c' : '#6b4226'
  const sunCol  = critical ? '#ff6b2b' : '#FFD700'
  const sunGlow = critical ? 'rgba(255,100,30,0.25)' : 'rgba(255,215,0,0.25)'
  const tempPct = Math.max(5, Math.min(95, (1 - score / 100) * 90 + 5))
  const co2Pct  = Math.max(5, Math.min(95, (1 - score / 100) * 85 + 10))
  const tempCol = tempPct > 70 ? '#E05A2B' : tempPct > 45 ? '#EF9F27' : '#1D9E75'

  const clouds = [
    { x: frame * 0.3 % 320 + 10, y: 28, size: 28 },
    { x: (frame * 0.18 + 80) % 320, y: 18, size: 18 },
    { x: (frame * 0.22 + 160) % 320, y: 38, size: 22 },
  ]

  const flora = great
    ? [20, 65, 100, 220, 260, 295].map((x, i) => ({ x, char: ['🌳','🌿','🌲','🌸','🌻','🌿'][i], s: [22,16,20,16,18,14][i] }))
    : good ? [{ x:20, char:'🌳', s:20 }, { x:80, char:'🌱', s:14 }, { x:270, char:'🌿', s:16 }]
    : moderate ? [{ x:25, char:'🌵', s:18 }, { x:260, char:'🌿', s:14 }]
    : [{ x:25, char:'🌵', s:16 }, { x:240, char:'🌵', s:14 }, { x:145, char:'💀', s:14 }]

  const animals = great
    ? [{ x: 145 + Math.sin(frame*0.08)*4, y: 105 + Math.sin(frame*0.06)*5, char:'🦋', s:18 },
       { x: 185 + Math.sin(frame*0.07+1)*3, y: 108 + Math.sin(frame*0.05+1)*4, char:'🐝', s:14 }]
    : good ? [{ x: 155, y: 110, char:'🦋', s:16 }]
    : critical ? [{ x:145, y:118, char:'☠', s:14 }]
    : []

  const particles = Array.from({ length: 5 }, (_, i) => ({
    x: ((frame*(0.4+i*0.15)+i*60) % 300) + 10,
    y: 55 + ((frame*0.5+i*30) % 60),
    char: critical ? ['🔥','💨','🖤','⚠','🌫'][i] : great ? ['✨','🌿','🍃','🌺','🌸'][i] : ['🍂','🌾','🌿'][i%3],
    s: critical ? 9 : 11,
  }))

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden' }}>
      <svg viewBox="0 0 320 155" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="ecoSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop}/>
            <stop offset="100%" stopColor={skyBot}/>
          </linearGradient>
          <linearGradient id="ecoGnd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gndCol}/>
            <stop offset="100%" stopColor={critical ? '#3d1f0a' : great ? '#1B5E20' : '#4a3010'}/>
          </linearGradient>
          <filter id="ecoblur"><feGaussianBlur stdDeviation="2"/></filter>
        </defs>

        <rect x="0" y="0" width="320" height="155" fill="url(#ecoSky)"/>

        {/* Sun */}
        <circle cx="270" cy="30" r="18" fill={sunCol} opacity="0.95"/>
        <circle cx="270" cy="30" r="28" fill={sunGlow}/>
        {critical && <circle cx="270" cy="30" r="38" fill="rgba(255,80,0,0.08)"/>}

        {/* Clouds */}
        {clouds.map((c, i) => (
          <g key={i} opacity={critical ? 0.45 : 0.8}>
            <ellipse cx={c.x} cy={c.y} rx={c.size} ry={c.size*0.55} fill={critical?'#7a6050':'#fff'} filter="url(#ecoblur)"/>
            <ellipse cx={c.x+c.size*0.4} cy={c.y-c.size*0.2} rx={c.size*0.65} ry={c.size*0.4} fill={critical?'#6a5040':'#fff'} filter="url(#ecoblur)"/>
          </g>
        ))}

        {/* Pollution haze */}
        {critical && <rect x="0" y="55" width="320" height="45" fill="rgba(120,80,40,0.2)"/>}

        {/* Ground */}
        <ellipse cx="160" cy="140" rx="195" ry="52" fill="url(#ecoGnd)"/>

        {/* Mountain silhouette */}
        <path d="M0 130 L45 95 L70 112 L100 78 L130 108 L160 88 L190 110 L220 82 L250 100 L280 90 L320 115 L320 155 L0 155 Z"
          fill={critical?'#4a2810':great?'#1B5E20':'#3d6b20'} opacity="0.5"/>

        {/* Snow caps */}
        {good && <>
          <path d="M98 80 L106 95 L90 95 Z" fill="white" opacity="0.7"/>
          <path d="M159 90 L166 103 L152 103 Z" fill="white" opacity="0.6"/>
          <path d="M219 84 L226 96 L212 96 Z" fill="white" opacity="0.65"/>
        </>}

        {/* Water */}
        {good && <>
          <ellipse cx="230" cy="138" rx="55" ry="14" fill="#1565C0" opacity="0.6"/>
          <path d={`M175 138 Q${193+(frame%8)-4} 133 210 138 Q${228+(frame%6)-3} 133 245 138`}
            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
        </>}

        {/* Smoke */}
        {critical && [60,100,200,240].map((sx, i) => (
          <ellipse key={i}
            cx={sx + Math.sin(frame*0.05+i)*3}
            cy={115 - (frame*1.5+i*8)%35}
            rx={4 + ((frame*1.5+i*8)%35)*0.25}
            ry={3}
            fill="#5a4030" opacity={0.5 - ((frame*1.5+i*8)%35)*0.012}
            filter="url(#ecoblur)"
          />
        ))}

        {/* Flora */}
        {flora.map((f, i) => <text key={i} x={f.x} y={128} fontSize={f.s} style={{userSelect:'none'}}>{f.char}</text>)}

        {/* Animals */}
        {animals.map((a, i) => <text key={i} x={a.x} y={a.y} fontSize={a.s} style={{userSelect:'none'}}>{a.char}</text>)}

        {/* Particles */}
        {particles.map((p, i) => <text key={i} x={p.x} y={p.y} fontSize={p.s} opacity={0.5} style={{userSelect:'none'}}>{p.char}</text>)}

        {/* Temperature gauge */}
        <rect x="6" y="20" width="7" height="110" rx="3" fill="rgba(0,0,0,0.18)"/>
        <rect x="6" y={20+110*(1-tempPct/100)} width="7" height={110*(tempPct/100)} rx="3" fill={tempCol} opacity="0.9"/>
        <text x="9.5" y="15" fontSize="7" fill="rgba(255,255,255,0.85)" textAnchor="middle">🌡</text>

        {/* CO2 gauge */}
        <rect x="307" y="20" width="7" height="110" rx="3" fill="rgba(0,0,0,0.18)"/>
        <rect x="307" y={20+110*(1-co2Pct/100)} width="7" height={110*(co2Pct/100)} rx="3"
          fill={co2Pct>70?'#A32D2D':co2Pct>45?'#BA7517':'#1D9E75'} opacity="0.9"/>
        <text x="310.5" y="15" fontSize="6.5" fill="rgba(255,255,255,0.85)" textAnchor="middle">CO₂</text>

        {/* Label */}
        <rect x="75" y="140" width="170" height="14" rx="4" fill="rgba(0,0,0,0.38)"/>
        <text x="160" y="150" fontSize="8.5" fill="rgba(255,255,255,0.95)" textAnchor="middle" fontWeight="500">
          {great?'🌱 Planète en bonne santé':good?'🌿 Planète sous pression':moderate?'⚠️ Planète dégradée':'💀 Crise écologique critique'}
        </text>
      </svg>

      {/* Score strip */}
      <div style={{
        background: critical?'#3d1a0a':great?'#1B5E20':good?'#2E7D32':'#5d3a10',
        padding:'8px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6
      }}>
        <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:130}}>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.7)',whiteSpace:'nowrap'}}>Score planète</span>
          <div style={{flex:1,height:6,background:'rgba(255,255,255,0.15)',borderRadius:3,overflow:'hidden'}}>
            <motion.div
              style={{height:'100%',borderRadius:3,background:critical?'#E05A2B':great?'#4CAF50':good?'#8BC34A':'#EF9F27'}}
              initial={{width:0}} animate={{width:`${score}%`}} transition={{duration:1.2,ease:'easeOut'}}
            />
          </div>
          <span style={{fontSize:12,fontWeight:600,color:'#fff',minWidth:32}}>{score}/100</span>
        </div>
        {yearlyKg != null && (
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{fontSize:16}}>🏭</span>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#fff'}}>{yearlyKg} kg CO₂/an</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.6)'}}>à {freq}×/semaine</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
