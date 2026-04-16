import React from 'react'
import { co2Color, co2Label, pct } from '../utils/helpers'

export default function CO2Gauge({ value }) {
  const col   = co2Color(value)
  const label = co2Label(value)
  const bar   = value != null ? pct(value, 15) : 0
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">CO₂ / 100g</span>
        <span className="text-xs font-medium" style={{ color: col }}>
          {value != null ? `${value} kg` : 'N/D'}
        </span>
      </div>
      <div className="risk-bar">
        <div className="risk-fill" style={{ width: `${bar}%`, background: col }} />
      </div>
      <div className="text-xs mt-1" style={{ color: col }}>{label}</div>
    </div>
  )
}
