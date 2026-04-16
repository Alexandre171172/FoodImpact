import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Shield, Users, Flag, UserX, UserCheck, Plus, BarChart2, Package, Lock, ChevronDown, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

/* ── Activity chart from real activityLog data ─────────────────────────── */
function ActivityChart({ activityLog }) {
  const [view, setView] = useState('hour') // 'hour' | 'day' | 'week'

  const { hourData, dayData, weekData } = useMemo(() => {
    const hours   = Array(24).fill(0)
    const days    = Array(7).fill(0)
    const weeks   = Array(8).fill(0)
    const now     = new Date()

    activityLog.forEach(entry => {
      const d = new Date(entry.ts)
      if (isNaN(d)) return
      hours[d.getHours()]++
      const dayIdx = 6 - Math.floor((now - d) / 86400000)
      if (dayIdx >= 0 && dayIdx < 7) days[dayIdx]++
      const weekIdx = 7 - Math.floor((now - d) / (7 * 86400000))
      if (weekIdx >= 0 && weekIdx < 8) weeks[weekIdx]++
    })

    const dayLabels   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
    const todayIdx    = now.getDay()
    const reorderedDays = Array(7).fill(0).map((_, i) => days[(todayIdx - 6 + i + 7) % 7])
    const reorderedLabels = Array(7).fill('').map((_, i) => dayLabels[(todayIdx - 6 + i + 7) % 7])

    return {
      hourData: hours.map((v,i) => ({ label:`${i}h`, value:v })),
      dayData:  reorderedDays.map((v,i) => ({ label:reorderedLabels[i], value:v })),
      weekData: weeks.map((v,i) => ({ label:`S-${7-i}`, value:v })),
    }
  }, [activityLog])

  const data = view==='hour' ? hourData.filter((_,i)=>i%2===0) : view==='day' ? dayData : weekData
  const max  = Math.max(...data.map(d=>d.value), 1)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Activité</h3>
        <div className="flex gap-1">
          {[['hour','Par heure'],['day','7 jours'],['week','8 semaines']].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${view===k?'bg-fi-green text-white':'text-gray-500 hover:bg-gray-50'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {activityLog.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Aucune activité enregistrée.</p>
      ) : (
        <div className="flex items-end gap-1 h-28">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {d.value}
              </div>
              <motion.div
                className="w-full rounded-t-sm"
                style={{ background:'#1D9E75', opacity:0.75 + 0.25*(d.value/max) }}
                initial={{ height:0 }}
                animate={{ height:`${Math.max(2,(d.value/max)*88)}px` }}
                transition={{ duration:0.5, delay:i*0.02 }}
              />
              <span className="text-xs text-gray-400" style={{ fontSize:9 }}>{d.label}</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2 text-center">
        {activityLog.length} événements enregistrés · Données réelles uniquement
      </p>
    </div>
  )
}

/* ── User detail row ────────────────────────────────────────────────────── */
function UserRow({ u, onBan, onUpdateRole, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors ${u.status==='banni'?'bg-fi-red-light border-red-100':'bg-white border-gray-100'}`}>
      <button onClick={() => setOpen(v=>!v)}
        className="w-full flex items-center gap-3 p-3 hover:bg-black/5 transition-colors text-left">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${u.role==='admin'?'bg-fi-purple-light text-fi-purple':'bg-fi-blue-light text-fi-blue'}`}>
          {u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{u.name}</div>
          <div className="text-xs text-gray-400 truncate">{u.email}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role==='admin'?'bg-fi-purple-light text-fi-purple':'bg-gray-100 text-gray-500'}`}>{u.role}</span>
          {u.reports>0 && <span className="text-xs bg-fi-red-light text-fi-red px-1.5 py-0.5 rounded-full">⚑{u.reports}</span>}
          {open?<ChevronDown size={14} className="text-gray-400"/>:<ChevronRight size={14} className="text-gray-400"/>}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ['Email', u.email],
              ['Rôle', u.role],
              ['Statut', u.status],
              ['Inscrit', u.joined],
              ['Recherches', u.searches||0],
              ['Signalements', u.reports||0],
            ].map(([k,v])=>(
              <div key={k} className="bg-gray-50 rounded-xl p-2.5">
                <div className="text-gray-400 mb-0.5">{k}</div>
                <div className="font-semibold text-gray-700 truncate">{v}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={u.role} onChange={e=>onUpdateRole(u.id,e.target.value)}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-fi-green">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <button onClick={()=>onBan(u.id)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-colors ${u.status==='banni'?'border-fi-green text-fi-green hover:bg-fi-green-light':'border-fi-red text-fi-red hover:bg-fi-red-light'}`}>
              {u.status==='banni'?<><UserCheck size={12}/>Restaurer</>:<><UserX size={12}/>Bannir</>}
            </button>
            <button onClick={()=>onDelete(u.id)}
              className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPanel({ onClose }) {
  const { adminUsers, banUser, updateRole, deleteUser, createFakeUser, reports, resolveReport, activityLog, isAdmin, user } = useApp()
  const [tab, setTab] = useState('overview')
  const [showNew, setShowNew] = useState(false)
  const [newUser, setNewUser]  = useState({ name:'', email:'', role:'user' })

  if (!isAdmin()) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-xs shadow-2xl">
          <Lock size={36} className="mx-auto text-fi-red mb-3"/>
          <h2 className="text-sm font-semibold mb-1">Accès refusé</h2>
          <p className="text-xs text-gray-500 mb-4">Réservé aux administrateurs.</p>
          <button onClick={onClose} className="bg-fi-green text-white px-6 py-2 rounded-xl text-sm font-medium">Fermer</button>
        </div>
      </div>
    )
  }

  const openReports = reports.filter(r=>r.status==='ouvert').length
  const topProducts = useMemo(() => {
    const c = {}; activityLog.forEach(e=>{c[e.product]=(c[e.product]||0)+1})
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,6)
  }, [activityLog])

  const TABS = [
    { id:'overview', label:'Vue d\'ensemble', Icon:BarChart2 },
    { id:'users',    label:'Utilisateurs',    Icon:Users     },
    { id:'reports',  label:'Signalements',    Icon:Flag      },
    { id:'products', label:'Activité',        Icon:Package   },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-2 sm:p-4">
      <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-fi-purple-light/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-fi-purple"/>
            <h2 className="text-sm font-semibold">Panel Admin</h2>
            <span className="text-xs bg-fi-purple text-white px-2 py-0.5 rounded-full">admin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block truncate max-w-32">{user?.email}</span>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50">
              <X size={16}/>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-0.5 px-3 pt-2 flex-shrink-0 border-b border-gray-100 overflow-x-auto">
          {TABS.map(({id,label,Icon})=>(
            <button key={id} onClick={()=>setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors -mb-px ${tab===id?'border-fi-purple text-fi-purple':'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon size={12}/>{label}
              {id==='reports'&&openReports>0&&<span className="bg-fi-amber text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{openReports}</span>}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* ── Overview ── */}
          {tab==='overview' && (
            <>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {label:'Utilisateurs', v:adminUsers.length, icon:'👥', col:'#185FA5'},
                  {label:'Actifs',       v:adminUsers.filter(u=>u.status==='actif').length, icon:'✅', col:'#1D9E75'},
                  {label:'Bannis',       v:adminUsers.filter(u=>u.status==='banni').length, icon:'🚫', col:'#A32D2D'},
                  {label:'Signalements', v:openReports, icon:'🚩', col:'#BA7517'},
                ].map(s=>(
                  <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center">
                    <div className="text-xl">{s.icon}</div>
                    <div className="text-lg font-bold" style={{color:s.col}}>{s.v}</div>
                    <div className="text-xs text-gray-400 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
              <ActivityChart activityLog={activityLog}/>
              {topProducts.length>0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold mb-3">Top produits consultés</h3>
                  <div className="space-y-2">
                    {topProducts.map(([name,count])=>(
                      <div key={name} className="flex items-center gap-2">
                        <span className="text-xs text-gray-700 flex-1 truncate">{name}</span>
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-fi-green rounded-full" style={{width:`${(count/topProducts[0][1])*100}%`}}/>
                        </div>
                        <span className="text-xs text-gray-500 w-5 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Users ── */}
          {tab==='users' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">{adminUsers.length} utilisateurs</p>
                <button onClick={()=>setShowNew(v=>!v)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-fi-green text-white rounded-xl hover:bg-fi-green-dark transition-colors">
                  <Plus size={12}/>Créer
                </button>
              </div>
              {showNew && (
                <div className="bg-fi-green-light border border-fi-green/20 rounded-2xl p-3 space-y-2">
                  {[['name','Nom'],['email','Email']].map(([k,l])=>(
                    <input key={k} value={newUser[k]} onChange={e=>setNewUser({...newUser,[k]:e.target.value})}
                      placeholder={l} className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-fi-green"/>
                  ))}
                  <select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none">
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                  <button onClick={()=>{createFakeUser(newUser);setShowNew(false);setNewUser({name:'',email:'',role:'user'})}}
                    className="w-full py-2 bg-fi-green text-white rounded-xl text-sm font-medium">Créer</button>
                </div>
              )}
              {adminUsers.map(u=>(
                <UserRow key={u.id} u={u} onBan={banUser} onUpdateRole={updateRole} onDelete={deleteUser}/>
              ))}
            </div>
          )}

          {/* ── Reports ── */}
          {tab==='reports' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">{openReports} ouvert(s) · {reports.length} total</p>
              {reports.map(r=>(
                <div key={r.id} className={`p-3 rounded-2xl border ${r.status==='ouvert'?'bg-white border-gray-100':'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">📦 {r.product}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{r.category}</div>
                      {r.details&&<div className="text-xs text-gray-400 mt-1 italic">"{r.details}"</div>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status==='ouvert'?'bg-fi-amber-light text-fi-amber':'bg-fi-green-light text-fi-green-dark'}`}>{r.status}</span>
                      <span className="text-xs text-gray-300">{r.date}</span>
                      {r.status==='ouvert'&&<button onClick={()=>resolveReport(r.id)} className="text-xs text-fi-green hover:underline">✓ Résoudre</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Activity (product history) ── */}
          {tab==='products' && (
            <div className="space-y-2">
              <ActivityChart activityLog={activityLog}/>
              <p className="text-xs text-gray-400">{activityLog.length} consultations enregistrées</p>
              <div className="space-y-1">
                {activityLog.slice(0,30).map((a,i)=>(
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 text-xs border-b border-gray-50">
                    <span className="text-gray-300 w-5 text-right">{i+1}</span>
                    <span className="text-gray-400 w-28 flex-shrink-0 truncate">{new Date(a.ts).toLocaleString('fr-FR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                    <span className="text-gray-500 flex-1 truncate">{a.user}</span>
                    <span className="font-medium text-gray-800 truncate">{a.product}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-gray-100 flex-shrink-0 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">Code Konami ↑↑↓↓←→←→BA · Admins uniquement</p>
          <span className="text-xs text-fi-green">● {user?.email}</span>
        </div>
      </motion.div>
    </div>
  )
}
