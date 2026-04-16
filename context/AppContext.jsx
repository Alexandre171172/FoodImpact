import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { hashPassword, verifyPassword } from '../utils/crypto'

const AppContext = createContext(null)

const DEFAULT_PROFILE = {
  age: 30, weight: 70, height: 175,
  activity: 'leger', freq: 3,
  name: '', avatarEmoji: '', gender: '',
}

/* ── Persistent user registry (password hashes stored securely) ── */
const REGISTRY_KEY = 'fi_registry_v3'
function loadRegistry() {
  try { return JSON.parse(localStorage.getItem(REGISTRY_KEY) || '{}') } catch { return {} }
}
function saveRegistry(r) {
  try { localStorage.setItem(REGISTRY_KEY, JSON.stringify(r)) } catch {}
}

/* ── Per-user data ── */
function userKey(email) { return `fi_ud_${btoa(email).replace(/=/g,'')}` }
function loadUD(email) {
  try { return JSON.parse(localStorage.getItem(userKey(email)) || '{}') } catch { return {} }
}
function saveUD(email, data) {
  try { localStorage.setItem(userKey(email), JSON.stringify(data)) } catch {}
}

/* ── Seeded admin/test users ── */
const SEED_USERS_META = [
  { id:1, name:'Alice Martin',    email:'alice@example.com',   role:'user',  status:'actif',  joined:'2024-01-12', searches:14 },
  { id:2, name:'Bob Dupont',      email:'bob@example.com',     role:'user',  status:'actif',  joined:'2024-02-08', searches:7  },
  { id:3, name:'Charlie Admin',   email:'charlie@admin.com',   role:'admin', status:'actif',  joined:'2023-11-01', searches:42 },
  { id:4, name:'Diana (bannie)',  email:'diana@spam.com',      role:'user',  status:'banni',  joined:'2024-03-20', searches:3  },
  { id:5, name:'Emile Testeur',   email:'emile@test.com',      role:'user',  status:'actif',  joined:'2024-04-15', searches:22 },
]
const SEED_REPORTS = [
  { id:1, product:'Nutella',     category:'Donnée nutritionnelle erronée', date:'2024-06-01', status:'ouvert',  details:'' },
  { id:2, product:'Coca-Cola',   category:'Image incorrecte',              date:'2024-06-03', status:'résolu',  details:'' },
  { id:3, product:'Pain de mie', category:'Produit en double',             date:'2024-06-05', status:'ouvert',  details:'' },
]
// Realistic past activity data (timestamps for the chart)
const SEED_ACTIVITY = Array.from({ length: 40 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - Math.floor(i / 2))
  d.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60))
  return { ts: d.toISOString(), product: ['Nutella','Coca-Cola','Pain Harry\'s','KitKat','Yaourt'][i%5], user: SEED_USERS_META[i%5].email }
})

export function AppProvider({ children }) {
  const [user,          setUser]          = useState(null)
  const [userProfile,   setUserProfileSt] = useState(DEFAULT_PROFILE)
  const [adminUsers,    setAdminUsers]    = useState(SEED_USERS_META)
  const [reports,       setReports]       = useState(SEED_REPORTS)
  const [activityLog,   setActivityLog]   = useState(SEED_ACTIVITY)
  const [notifications, setNotifications] = useState([])

  /* Load current user on mount */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fi_session') || 'null')
      if (saved) {
        setUser(saved)
        const ud = loadUD(saved.email)
        if (ud.profile) setUserProfileSt({ ...DEFAULT_PROFILE, ...ud.profile })
      }
    } catch {}
  }, [])

  /* Persist profile whenever it changes */
  const setUserProfile = useCallback((p) => {
    setUserProfileSt(p)
    if (user) {
      const ud = loadUD(user.email)
      saveUD(user.email, { ...ud, profile: p })
    }
  }, [user])

  /* ── Auth ── */
  const register = useCallback(async (name, email, password) => {
    const reg = loadRegistry()
    if (reg[email]) return 'Cet email est déjà utilisé.'
    const hash = await hashPassword(password)
    reg[email] = { name, email, passwordHash: hash, role: 'user', createdAt: new Date().toISOString() }
    saveRegistry(reg)
    const u = { email, name, role: 'user' }
    setUser(u)
    localStorage.setItem('fi_session', JSON.stringify(u))
    setAdminUsers(prev => [...prev, { id: Date.now(), name, email, role:'user', status:'actif', joined: new Date().toISOString().slice(0,10), searches:0 }])
    addNotification('Compte créé ! Bienvenue.', 'success')
    return null
  }, [])

  const loginEmail = useCallback(async (email, password) => {
    const reg = loadRegistry()
    const entry = reg[email]
    if (!entry) return 'Aucun compte trouvé pour cet email.'
    const ok = await verifyPassword(password, entry.passwordHash)
    if (!ok) return 'Mot de passe incorrect.'
    const u = { email, name: entry.name, role: entry.role || 'user' }
    setUser(u)
    localStorage.setItem('fi_session', JSON.stringify(u))
    const ud = loadUD(email)
    if (ud.profile) setUserProfileSt({ ...DEFAULT_PROFILE, ...ud.profile })
    addNotification('Bienvenue !', 'success')
    return null
  }, [])

  const loginOAuth = useCallback((email, name, provider, role = 'user') => {
    const isAdmin = email.includes('admin') || role === 'admin'
    const u = { email, name: name || email.split('@')[0], role: isAdmin ? 'admin' : 'user', provider }
    setUser(u)
    localStorage.setItem('fi_session', JSON.stringify(u))
    // Register in registry if new
    const reg = loadRegistry()
    if (!reg[email]) {
      reg[email] = { name: u.name, email, passwordHash: null, role: u.role, provider, createdAt: new Date().toISOString() }
      saveRegistry(reg)
      setAdminUsers(prev => {
        if (prev.find(x => x.email === email)) return prev
        return [...prev, { id: Date.now(), name: u.name, email, role: u.role, status:'actif', joined: new Date().toISOString().slice(0,10), searches:0 }]
      })
    }
    const ud = loadUD(email)
    if (ud.profile) setUserProfileSt({ ...DEFAULT_PROFILE, ...ud.profile })
    addNotification(`Connecté via ${provider} !`, 'success')
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setUserProfileSt(DEFAULT_PROFILE)
    localStorage.removeItem('fi_session')
    addNotification('Déconnexion réussie', 'info')
  }, [])

  const isAdmin = useCallback(() => user?.role === 'admin', [user])

  /* ── Per-user favorites ── */
  const getFavorites = useCallback(() => {
    const key = user ? user.email : '__guest__'
    const ud  = loadUD(key)
    return ud.favorites || []
  }, [user])

  const toggleFavorite = useCallback((product) => {
    const key  = user ? user.email : '__guest__'
    const ud   = loadUD(key)
    const favs = ud.favorites || []
    const next = favs.find(x => x.code === product.code)
      ? favs.filter(x => x.code !== product.code)
      : [{ ...product, savedAt: new Date().toISOString() }, ...favs]
    saveUD(key, { ...ud, favorites: next })
    // Force re-render by bumping a counter
    setNotifications(n => n) // tiny trick — actual data read from localStorage
  }, [user])

  const isFavorite = useCallback((product) => {
    const key = user ? user.email : '__guest__'
    const ud  = loadUD(key)
    return (ud.favorites || []).some(x => x.code === product?.code)
  }, [user])

  /* ── Per-user history ── */
  const getHistory = useCallback(() => {
    const key = user ? user.email : '__guest__'
    const ud  = loadUD(key)
    return (ud.history || []).sort((a,b) => new Date(b.viewedAt) - new Date(a.viewedAt))
  }, [user])

  const addToHistory = useCallback((product) => {
    const key = user ? user.email : '__guest__'
    const ud  = loadUD(key)
    const hist= ud.history || []
    const entry = { ...product, viewedAt: new Date().toISOString() }
    const next  = [entry, ...hist.filter(x => x.code !== product.code)].slice(0, 50)
    saveUD(key, { ...ud, history: next })
    // Log activity
    setActivityLog(prev => [{ ts: new Date().toISOString(), product: product.product_name, user: user?.email || 'anonyme' }, ...prev].slice(0,500))
    setAdminUsers(prev => prev.map(u2 => u2.email === user?.email ? { ...u2, searches: (u2.searches||0) + 1 } : u2))
  }, [user])

  /* ── Admin ── */
  const banUser    = id => setAdminUsers(us => us.map(u => u.id===id ? {...u, status:u.status==='banni'?'actif':'banni'} : u))
  const updateRole = (id, role) => setAdminUsers(us => us.map(u => u.id===id ? {...u, role} : u))
  const deleteUser = id => setAdminUsers(us => us.filter(u => u.id!==id))
  const createFakeUser = data => setAdminUsers(us => [...us, { id:Date.now(), ...data, status:'actif', joined:new Date().toISOString().slice(0,10), searches:0 }])
  const addReport     = r => setReports(prev => [{ id:Date.now(), ...r, date:new Date().toISOString().slice(0,10), status:'ouvert' }, ...prev])
  const resolveReport = id => setReports(prev => prev.map(r => r.id===id ? {...r, status:'résolu'} : r))

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now()
    setNotifications(n => [...n, { id, message, type }])
    setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 4000)
  }, [])

  return (
    <AppContext.Provider value={{
      user, register, loginEmail, loginOAuth, logout, isAdmin,
      userProfile, setUserProfile,
      getFavorites, toggleFavorite, isFavorite,
      getHistory, addToHistory,
      adminUsers, setAdminUsers, banUser, updateRole, deleteUser, createFakeUser,
      reports, addReport, resolveReport,
      activityLog,
      notifications, addNotification,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
