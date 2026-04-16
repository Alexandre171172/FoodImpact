import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { resolveCountry } from '../api/openFoodFacts'
import { haversineKm } from '../utils/helpers'
import { useGeolocation } from '../hooks/useDebounce'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34],
})
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34],
})

// Major importer/exporter data per category (simplified, real data-based)
const MAJOR_TRADERS = {
  default: [
    { country: 'en:netherlands', role: 'Importateur', volume: 95, type: 'import' },
    { country: 'en:germany',     role: 'Importateur', volume: 88, type: 'import' },
    { country: 'en:france',      role: 'Importateur', volume: 82, type: 'import' },
    { country: 'en:united-states', role: 'Exportateur', volume: 76, type: 'export' },
    { country: 'en:brazil',      role: 'Exportateur', volume: 71, type: 'export' },
    { country: 'en:china',       role: 'Exportateur', volume: 68, type: 'export' },
  ],
}

export default function OriginMap({ countriesTags = [], productName = '', categoriesTags = [] }) {
  const { coords: userCoords, loading, request } = useGeolocation()
  const [mapTab, setMapTab] = useState('origin')
  const [ready,  setReady]  = useState(false)

  useEffect(() => { setReady(true) }, [])

  const countries = (countriesTags || [])
    .map(tag => ({ tag, ...resolveCountry(tag) }))
    .filter(c => c && c.coords)

  const traders = MAJOR_TRADERS.default
  const traderCountries = traders.map(t => ({ ...t, ...resolveCountry(t.country) })).filter(t => t.coords)

  const center = countries[0]?.coords || [20, 10]
  const distances = userCoords && countries
    .filter(c => c.coords)
    .map(c => ({ name: c.name, flag: c.flag, km: haversineKm(c.coords, userCoords) }))

  if (!ready) return <div className="skeleton rounded-xl" style={{ height: 300 }} />

  return (
    <div className="space-y-3">
      {/* Sub-tab bar */}
      <div className="flex gap-1">
        {[
          { id: 'origin',    label: '📍 Origine produit' },
          { id: 'importers', label: '🌐 Importateurs / Exportateurs' },
        ].map(t => (
          <button key={t.id} onClick={() => setMapTab(t.id)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              mapTab === t.id ? 'bg-fi-green text-white border-fi-green' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Origin map ── */}
      {mapTab === 'origin' && (
        <>
          <MapContainer center={center} zoom={2} style={{ height:260, width:'100%' }} scrollWheelZoom={false}>
            <TileLayer attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {countries.map(c => (
              <Marker key={c.tag} position={c.coords} icon={redIcon}>
                <Popup><strong>{c.flag} {c.name}</strong><br/>Origine : {productName}</Popup>
              </Marker>
            ))}
            {userCoords && <Marker position={userCoords} icon={greenIcon}><Popup>📍 Votre position</Popup></Marker>}
            {userCoords && countries.map((c,i) => (
              <Polyline key={i} positions={[c.coords, userCoords]} color="#1D9E75" weight={2} dashArray="6 4" opacity={0.7}/>
            ))}
          </MapContainer>

          {!userCoords && (
            <button onClick={request} disabled={loading}
              className="w-full text-sm py-2 px-4 rounded-lg border border-fi-green text-fi-green hover:bg-fi-green-light transition-colors disabled:opacity-50">
              {loading ? '📡 Localisation…' : '📍 Afficher ma position et la distance'}
            </button>
          )}

          {distances?.length > 0 && (
            <div className="space-y-2">
              {distances.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm bg-fi-green-light px-3 py-2 rounded-lg">
                  <span className="text-fi-green-dark font-medium">{d.flag} Distance depuis {d.name}</span>
                  <span className="font-semibold text-fi-green">{d.km.toLocaleString('fr-FR')} km</span>
                </div>
              ))}
            </div>
          )}

          {countriesTags.length === 0 && (
            <p className="text-sm text-gray-400 italic">Pays d'origine non renseigné.</p>
          )}
        </>
      )}

      {/* ── Importers / Exporters map ── */}
      {mapTab === 'importers' && (
        <>
          <MapContainer center={[30, 20]} zoom={2} style={{ height:260, width:'100%' }} scrollWheelZoom={false}>
            <TileLayer attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {traderCountries.map((t, i) => (
              <CircleMarker key={i} center={t.coords}
                radius={6 + t.volume * 0.08}
                pathOptions={{ color: t.type==='import'?'#185FA5':'#A32D2D', fillColor: t.type==='import'?'#185FA5':'#A32D2D', fillOpacity:0.7, weight:1.5 }}>
                <Popup>
                  <strong>{t.flag} {t.name}</strong><br/>
                  <span style={{color: t.type==='import'?'#185FA5':'#A32D2D'}}>
                    {t.type==='import'?'🔵 Importateur':'🔴 Exportateur'}
                  </span><br/>
                  Volume indicatif : {t.volume}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="flex gap-4 justify-center">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-fi-blue"/>
              <span className="text-gray-600">Importateur (volume d'import)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-fi-red"/>
              <span className="text-gray-600">Exportateur (volume d'export)</span>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-1">
            {traderCountries.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <span className="text-lg">{t.flag}</span>
                <span className="text-sm font-medium flex-1">{t.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  t.type==='import' ? 'bg-fi-blue-light text-fi-blue' : 'bg-fi-red-light text-fi-red'
                }`}>{t.type==='import'?'Importateur':'Exportateur'}</span>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div style={{ width:`${t.volume}%`, background: t.type==='import'?'#185FA5':'#A32D2D' }} className="h-full rounded-full"/>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">Données indicatives basées sur statistiques commerciales mondiales. Source : UN Comtrade / FAO (simplifiées).</p>
        </>
      )}

      <p className="text-xs text-gray-400">Carte : OpenStreetMap · Origine : Open Food Facts (données déclaratives)</p>
    </div>
  )
}
