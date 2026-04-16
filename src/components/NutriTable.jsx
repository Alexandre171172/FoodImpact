import React from 'react'
import { fmt, pct } from '../utils/helpers'

const ROWS = [
  { key: 'energy-kcal_100g',   label: 'Énergie',          unit: ' kcal', max: 600,  color: '#BA7517', sub: false },
  { key: 'fat_100g',            label: 'Graisses',          unit: ' g',   max: 30,   color: '#E05A2B', sub: false },
  { key: 'saturated-fat_100g', label: 'dont saturées',     unit: ' g',   max: 15,   color: '#E05A2B', sub: true  },
  { key: 'carbohydrates_100g', label: 'Glucides',           unit: ' g',   max: 75,   color: '#BA7517', sub: false },
  { key: 'sugars_100g',        label: 'dont sucres',        unit: ' g',   max: 30,   color: '#BA7517', sub: true  },
  { key: 'fiber_100g',         label: 'Fibres',             unit: ' g',   max: 10,   color: '#1D9E75', sub: false },
  { key: 'proteins_100g',      label: 'Protéines',          unit: ' g',   max: 30,   color: '#185FA5', sub: false },
  { key: 'salt_100g',          label: 'Sel',                unit: ' g',   max: 3,    color: '#888780', sub: false },
  { key: 'sodium_100g',        label: 'Sodium',             unit: ' g',   max: 1.2,  color: '#888780', sub: true  },
]

export default function NutriTable({ nutriments }) {
  if (!nutriments) {
    return (
      <p className="text-sm text-gray-400 italic">Données nutritionnelles non disponibles pour ce produit.</p>
    )
  }

  return (
    <div className="space-y-3">
      {ROWS.map(r => {
        const val = nutriments[r.key]
        return (
          <div key={r.key} style={{ paddingLeft: r.sub ? 14 : 0 }}>
            <div className="flex justify-between items-center mb-1">
              <span className={`${r.sub ? 'text-xs text-gray-400' : 'text-sm text-gray-700'}`}>
                {r.label}
              </span>
              <span className={`${r.sub ? 'text-xs' : 'text-sm font-medium'}`}>
                {fmt(val, r.unit)}
              </span>
            </div>
            {val != null && (
              <div className="risk-bar">
                <div
                  className="risk-fill"
                  style={{ width: `${pct(val, r.max)}%`, background: r.color }}
                />
              </div>
            )}
          </div>
        )
      })}
      <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
        Valeurs pour 100g de produit · Source : Open Food Facts
      </p>
    </div>
  )
}
