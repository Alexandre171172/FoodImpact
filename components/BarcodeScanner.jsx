import React, { useEffect, useRef, useState } from 'react'
import { X, CameraOff } from 'lucide-react'

/**
 * Camera-based barcode scanner using the BrowserMultiFormatReader from @zxing/library.
 * Loaded dynamically from CDN to avoid bundling issues.
 */
export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const [status, setStatus]     = useState('init')   // init | requesting | active | error | denied
  const [errorMsg, setErrorMsg] = useState('')
  const readerRef = useRef(null)

  useEffect(() => {
    let mounted = true

    async function startScan() {
      setStatus('requesting')

      // Check camera permission
      try {
        const perm = await navigator.permissions?.query({ name: 'camera' }).catch(() => null)
        if (perm?.state === 'denied') {
          setStatus('denied')
          setErrorMsg('Accès à la caméra refusé. Veuillez l\'autoriser dans les paramètres de votre navigateur.')
          return
        }
      } catch (_) {}

      // Dynamically load ZXing
      if (!window.ZXing) {
        try {
          await import('https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js')
        } catch (e) {
          // Fallback: try manual video stream and alert user
          setStatus('error')
          setErrorMsg('Impossible de charger le lecteur de code-barres. Essayez de saisir le code manuellement.')
          return
        }
      }

      try {
        const { BrowserMultiFormatReader } = window.ZXing || {}
        if (!BrowserMultiFormatReader) throw new Error('ZXing not loaded')

        const reader = new BrowserMultiFormatReader()
        readerRef.current = reader

        const devices = await reader.listVideoInputDevices()
        if (!devices.length) throw new Error('Aucune caméra détectée')

        // Prefer back camera
        const device = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[devices.length - 1]

        if (!mounted) return

        setStatus('active')

        await reader.decodeFromVideoDevice(device.deviceId, videoRef.current, (result, err) => {
          if (result && mounted) {
            onDetected(result.getText())
          }
        })
      } catch (e) {
        if (!mounted) return
        if (e.name === 'NotAllowedError' || e.message?.includes('Permission')) {
          setStatus('denied')
          setErrorMsg('Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres du navigateur.')
        } else {
          setStatus('error')
          setErrorMsg(e.message || 'Impossible d\'accéder à la caméra.')
        }
      }
    }

    startScan()

    return () => {
      mounted = false
      readerRef.current?.reset?.()
      readerRef.current?.stopAsyncDecode?.()
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4">
        <h2 className="text-white font-medium">Scanner un code-barres</h2>
        <button onClick={onClose} className="text-white/70 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      {/* Camera view */}
      <div className="relative w-full max-w-sm bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />

        {/* Scanning overlay */}
        {status === 'active' && (
          <>
            {/* Corner guides */}
            <div className="absolute inset-6 border-2 border-fi-green/60 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-fi-green rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-fi-green rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-fi-green rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-fi-green rounded-br" />
            </div>
            {/* Scanning line */}
            <div className="scan-line" />
          </>
        )}

        {/* Status overlays */}
        {status === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center text-white">
              <div className="text-3xl mb-3 animate-pulse">📷</div>
              <p className="text-sm">Demande d'accès à la caméra…</p>
            </div>
          </div>
        )}

        {(status === 'error' || status === 'denied') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6">
            <div className="text-center text-white">
              <CameraOff size={36} className="mx-auto mb-3 text-red-400" />
              <p className="text-sm text-red-300 mb-2 font-medium">
                {status === 'denied' ? 'Accès refusé' : 'Caméra indisponible'}
              </p>
              <p className="text-xs text-white/70">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      {status === 'active' && (
        <p className="text-white/60 text-xs text-center mt-4 max-w-xs">
          Pointez la caméra vers le code-barres du produit. La détection est automatique.
        </p>
      )}

      {/* Manual entry fallback */}
      <ManualEntry onConfirm={onDetected} />
    </div>
  )
}

function ManualEntry({ onConfirm }) {
  const [code, setCode] = useState('')
  return (
    <div className="mt-4 w-full max-w-sm">
      <p className="text-white/50 text-xs text-center mb-2">— ou saisir manuellement —</p>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm placeholder-white/30 focus:outline-none focus:border-fi-green"
          placeholder="Code-barres (ex: 3017620422003)"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          maxLength={14}
          inputMode="numeric"
        />
        <button
          onClick={() => code.length >= 8 && onConfirm(code)}
          disabled={code.length < 8}
          className="bg-fi-green text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-fi-green-dark transition-colors"
        >
          Chercher
        </button>
      </div>
    </div>
  )
}
