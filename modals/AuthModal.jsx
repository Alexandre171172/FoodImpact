import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { decodeJWT } from '../utils/crypto'

const GOOGLE_CLIENT_ID = '217777071012-atsars7vqr7r074qkfg2d76hhpa0f1j0.apps.googleusercontent.com'

// Password strength
function pwdScore(p) {
  let s = 0
  if (p.length>=8) s++; if (p.length>=12) s++
  if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}
const PWD_LABELS = ['','Très faible','Faible','Moyen','Fort','Très fort']
const PWD_COLORS = ['','#E8000B','#FF6600','#FFCC00','#85BB2F','#1D9E75']

export default function AuthModal({ onClose }) {
  const { register, loginEmail, loginOAuth } = useApp()
  const [mode,    setMode]    = useState('login')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [name,    setName]    = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [pending, setPending] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const googleBtnRef = useRef(null)
  const score = pwdScore(pass)

  /* ── Google One-Tap + Button ── */
  useEffect(() => {
    let loaded = false
    function initGoogle() {
      if (!window.google?.accounts || loaded) return
      loaded = true
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          const payload = decodeJWT(response.credential)
          if (payload?.email) {
            loginOAuth(payload.email, payload.name || payload.email.split('@')[0], 'Google')
            onClose()
          }
        },
        auto_select: false,
      })
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard', shape: 'rectangular', theme: 'outline',
          text: mode==='register'?'signup_with':'signin_with', size: 'large', width: '100%',
        })
      }
    }

    // Load script
    if (window.google?.accounts) { initGoogle() }
    else {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true
      s.onload = initGoogle
      document.head.appendChild(s)
    }
  }, [mode])

  /* ── Apple Sign In ── */
  const handleApple = async () => {
    setPending(true)
    try {
      // Production: load AppleID.auth SDK + AppleID.auth.signIn()
      // For demo, we simulate the flow
      await new Promise(r => setTimeout(r, 800))
      // Real: const data = await AppleID.auth.signIn()
      // const { id_token } = data.authorization
      // const payload = decodeJWT(id_token)
      // loginOAuth(payload.email, data.user?.name?.firstName || 'Utilisateur Apple', 'Apple')
      setError("Apple Sign In nécessite un compte Apple Developer ($99/an). Configurez ServicesID + clé privée dans votre backend.")
    } finally { setPending(false) }
  }

  /* ── Microsoft MSAL ── */
  const handleMicrosoft = async () => {
    setPending(true)
    try {
      // Production: import { PublicClientApplication } from '@azure/msal-browser'
      // const pca = new PublicClientApplication({ auth: { clientId: 'YOUR_AZURE_APP_ID' }})
      // const result = await pca.loginPopup({ scopes: ['openid','profile','email'] })
      // loginOAuth(result.account.username, result.account.name, 'Microsoft')
      await new Promise(r => setTimeout(r, 800))
      setError("Microsoft Sign In nécessite un App ID Azure (portal.azure.com). Ajoutez VITE_MICROSOFT_CLIENT_ID dans .env.")
    } finally { setPending(false) }
  }

  /* ── Email/password ── */
  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email invalide.'); return }
    if (!pass || pass.length < 6) { setError('Mot de passe trop court (6 car. min).'); return }
    if (mode==='register' && !name.trim()) { setError('Nom requis.'); return }
    if (mode==='register' && score < 2) { setError('Mot de passe trop faible.'); return }
    setPending(true)
    const err = mode==='register'
      ? await register(name.trim(), email.trim(), pass)
      : await loginEmail(email.trim(), pass)
    setPending(false)
    if (err) { setError(err) }
    else { setSuccess(mode==='register'?'Compte créé !':'Connexion réussie !'); setTimeout(onClose, 600) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{y:50,opacity:0}} animate={{y:0,opacity:1}}
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={e=>e.stopPropagation()}>

        {/* Handle bar */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden"/>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥗</span>
            <h2 className="text-sm font-semibold">
              {mode==='register'?'Créer un compte':'Connexion'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={16}/>
          </button>
        </div>

        <div className="px-5 pb-5 space-y-3">
          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2 bg-fi-red-light text-fi-red text-xs px-3 py-2.5 rounded-xl border border-red-100">
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0"/>{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-fi-green-light text-fi-green-dark text-xs px-3 py-2.5 rounded-xl border border-fi-green/20">
              <CheckCircle size={13}/>{success}
            </div>
          )}

          {/* Google (renders real button via SDK) */}
          <div ref={googleBtnRef} className="w-full" style={{ minHeight:44 }}>
            {/* Fallback while SDK loads */}
            <button onClick={() => window.google?.accounts?.id?.prompt?.()}
              className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-2xl text-sm hover:bg-gray-50 transition-colors">
              <span className="text-base">🔵</span>
              <span className="font-medium">{mode==='register'?'S\'inscrire':'Continuer'} avec Google</span>
            </button>
          </div>

          {/* Apple */}
          <button onClick={handleApple} disabled={pending}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-2xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
            <span className="text-base">🍎</span>
            <span className="font-medium">{mode==='register'?'S\'inscrire':'Continuer'} avec Apple</span>
          </button>

          {/* Microsoft */}
          <button onClick={handleMicrosoft} disabled={pending}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-2xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
            <span className="text-base">🟦</span>
            <span className="font-medium">{mode==='register'?'S\'inscrire':'Continuer'} avec Microsoft</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100"/>
            <span className="text-xs text-gray-300">ou avec email</span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>

          {/* Fields */}
          {mode==='register' && (
            <input value={name} onChange={e=>{setName(e.target.value);setError('')}} placeholder="Nom complet"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-fi-green focus:ring-2 focus:ring-fi-green/10"/>
          )}
          <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('')}} placeholder="Email"
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-fi-green focus:ring-2 focus:ring-fi-green/10"
            onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
          <div className="relative">
            <input type={showPwd?'text':'password'} value={pass}
              onChange={e=>{setPass(e.target.value);setError('')}} placeholder="Mot de passe"
              className="w-full px-4 py-3 pr-11 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-fi-green focus:ring-2 focus:ring-fi-green/10"
              onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
            <button onClick={()=>setShowPwd(v=>!v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 p-1">
              {showPwd?<EyeOff size={15}/>:<Eye size={15}/>}
            </button>
          </div>

          {/* Password strength (register) */}
          {mode==='register' && pass.length>0 && (
            <div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i=>(
                  <div key={i} className="flex-1 h-1.5 rounded-full transition-colors"
                    style={{background:i<=score?PWD_COLORS[score]:'#e5e4de'}}/>
                ))}
              </div>
              <p className="text-xs mt-1" style={{color:PWD_COLORS[score]||'#888'}}>{PWD_LABELS[score]}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={pending}
            className="w-full py-3 text-sm bg-fi-green text-white rounded-2xl hover:bg-fi-green-dark transition-colors font-semibold disabled:opacity-50">
            {pending?'…':mode==='register'?'Créer mon compte':'Se connecter'}
          </button>

          <button onClick={()=>{setMode(m=>m==='login'?'register':'login');setError('');setSuccess('')}}
            className="w-full text-xs text-gray-400 hover:text-fi-green transition-colors py-1">
            {mode==='login'?'Pas encore de compte ? S\'inscrire':'Déjà un compte ? Se connecter'}
          </button>

          <p className="text-center text-xs text-gray-300">🔒 Mot de passe chiffré PBKDF2-SHA512 · Aucune donnée vendue</p>
        </div>
      </motion.div>
    </div>
  )
}
