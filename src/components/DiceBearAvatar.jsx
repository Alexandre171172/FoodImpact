import React, { useMemo } from 'react'

/**
 * DiceBear avatar that visually reflects health state.
 * Uses the "avataaars" style via the public DiceBear API.
 *
 * bmi      : projected BMI (18-45)
 * risk     : 0-1 overall risk
 * seed     : string seed for base style
 * size     : px size
 * emoji    : optional emoji override (for account page)
 */
export default function DiceBearAvatar({ bmi = 22, risk = 0.3, seed = 'user', size = 90, emoji = null }) {
  const params = useMemo(() => {
    // Translate health state into DiceBear appearance params
    const isHeavy   = bmi > 30
    const isRisk    = risk > 0.55
    const isHealthy = risk < 0.35 && bmi < 27

    // Skin tone reflects stress / health
    const skinColor = isRisk
      ? 'fdbcb4'   // pale/reddish
      : isHealthy
      ? 'ae5d29'   // warm healthy tone
      : 'f8d25c'   // neutral

    // Eyes: tired vs awake
    const eyes = isRisk ? 'squint' : isHealthy ? 'happy' : 'default'

    // Mouth: smile vs frown
    const mouth = risk > 0.65
      ? 'sad'
      : risk > 0.4
      ? 'serious'
      : isHealthy
      ? 'smile'
      : 'default'

    // Accessories: glasses if very high risk (tired look)
    const accessories    = risk > 0.6 ? 'kurt' : 'blank'
    const accessoriesProb = risk > 0.6 ? '100' : '0'

    // Hair color based on overall wellbeing
    const hairColor = isHealthy ? '2c1b18' : isRisk ? '724133' : '4a312c'

    // Top (clothes) color based on eco/health
    const clothesColor = isRisk ? 'e6e6e6' : '65c9ff'

    const p = new URLSearchParams({
      seed,
      skinColor,
      eyes,
      mouth,
      accessories,
      accessoriesColor: 'transparent',
      accessoriesProbability: accessoriesProb,
      hairColor,
      clothesColor,
      backgroundColor: 'transparent',
    })
    return p.toString()
  }, [bmi, risk, seed])

  const url = `https://api.dicebear.com/8.x/avataaars/svg?${params}`

  if (emoji) {
    return (
      <div
        style={{
          width: size, height: size,
          borderRadius: '50%',
          background: 'var(--color-background-secondary, #f5f5f3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.55,
          border: '2px solid var(--color-border-tertiary)',
          flexShrink: 0,
        }}
      >
        {emoji}
      </div>
    )
  }

  return (
    <div style={{ width: size, height: size, flexShrink: 0, position: 'relative' }}>
      <img
        src={url}
        alt="Avatar santé"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `3px solid ${risk > 0.65 ? '#E05A2B' : risk > 0.35 ? '#EF9F27' : '#1D9E75'}`,
          background: '#f5f5f3',
          objectFit: 'cover',
        }}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
      />
      {/* Fallback */}
      <div
        style={{
          display: 'none',
          width: size, height: size,
          borderRadius: '50%',
          background: risk > 0.65 ? '#FCEBEB' : risk > 0.35 ? '#FAEEDA' : '#E1F5EE',
          border: `3px solid ${risk > 0.65 ? '#E05A2B' : risk > 0.35 ? '#EF9F27' : '#1D9E75'}`,
          alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.4,
        }}
      >
        {risk > 0.65 ? '😓' : risk > 0.35 ? '😐' : '😊'}
      </div>
    </div>
  )
}

/** Small inline version for product cards etc. */
export function MiniAvatar({ seed, size = 32, emoji }) {
  if (emoji) return <span style={{ fontSize: size * 0.8 }}>{emoji}</span>
  const url = `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}&backgroundColor=transparent`
  return (
    <img
      src={url}
      alt=""
      style={{ width: size, height: size, borderRadius: '50%', background: '#f5f5f3', border: '1.5px solid #e5e4de' }}
      onError={e => { e.target.style.display = 'none' }}
    />
  )
}
