import React from 'react'

const GRADE_MAP = {
  A: { bg: '#1D9E75', text: '#fff', shadow: '#1D9E7544' },
  B: { bg: '#85BB2F', text: '#fff', shadow: '#85BB2F44' },
  C: { bg: '#FFCC00', text: '#333', shadow: '#FFCC0044' },
  D: { bg: '#FF6600', text: '#fff', shadow: '#FF660044' },
  E: { bg: '#E8000B', text: '#fff', shadow: '#E8000B44' },
}

export default function NutriRing({ grade, size = 48, label = '' }) {
  const g    = (grade || '').toUpperCase().trim()
  const meta = GRADE_MAP[g]
  const fs   = Math.round(size * 0.42)

  if (!meta) {
    return (
      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:3,flexShrink:0 }}>
        <div style={{
          width:size, height:size, borderRadius:'50%',
          background:'#F1EFE8', border:'2px solid #D3D1C7',
          display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
        }}>
          <span style={{ fontSize:Math.max(9,size*0.24), color:'#888780', fontWeight:500 }}>N/D</span>
        </div>
        {label && <span style={{ fontSize:Math.max(8,size*0.2), color:'#888780', whiteSpace:'nowrap' }}>{label}</span>}
      </div>
    )
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:3,flexShrink:0 }}>
      <div style={{
        width:size, height:size, borderRadius:'50%',
        background:meta.bg,
        display:'flex',alignItems:'center',justifyContent:'center',
        flexShrink:0, boxShadow:`0 2px 8px ${meta.shadow}`,
      }}>
        <span style={{ color:meta.text, fontSize:fs, fontWeight:700, lineHeight:1, userSelect:'none' }}>{g}</span>
      </div>
      {label && <span style={{ fontSize:Math.max(8,size*0.2), color:'#73726c', whiteSpace:'nowrap' }}>{label}</span>}
    </div>
  )
}
