import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export function useKonamiCode(callback) {
  const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === code[idx]) {
        if (idx + 1 === code.length) { callback(); setIdx(0) }
        else setIdx(i => i + 1)
      } else { setIdx(0) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx, callback])
}

export function useGeolocation() {
  const [coords, setCoords]   = useState(null)
  const [error,  setError]    = useState(null)
  const [loading, setLoading] = useState(false)

  const request = () => {
    if (!navigator.geolocation) { setError('Géolocalisation non supportée'); return }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords([pos.coords.latitude, pos.coords.longitude]); setLoading(false) },
      err => { setError(err.message); setLoading(false) }
    )
  }
  return { coords, error, loading, request }
}
