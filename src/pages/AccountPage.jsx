import React, { useState } from 'react'
import { User, Edit2, Star, Clock, LogOut, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import ProfileModal from '../modals/ProfileModal'
import AuthModal from '../modals/AuthModal'

const AVATAR_EMOJIS = ['😊','😎','🤩','🥗','💪','🧑‍🍳','🏃','🧘','🌱','🥦','🍎','🥑','🎯','⚡','🦁','🐼','🦊','🐸','🌟','🔥']

export default function AccountPage() {
  const { user, userProfile, setUserProfile, getFavorites, getHistory, logout, isAdmin } = useApp()
  const { t } = useLang()
  const [showProfile,    setShowProfile]    = useState(false)
  const [showAuth,       setShowAuth]       = useState(false)
  const [showAvatarPick, setShowAvatarPick] = useState(false)

  const favorites = getFavorites()
  const history   = getHistory()

  const actLabels = { sedentaire:'Sédentaire', leger:'Légèrement actif', modere:'Modérément actif', actif:'Très actif' }
  const genderLabels = { homme:'Homme', femme:'Femme', autre:'Autre', '':'' }
  const bmi = userProfile.weight && userProfile.height
    ? Math.round((userProfile.weight/((userProfile.height/100)**2))*10)/10 : null
  const bmiLabel = bmi ? bmi<18.5?'Insuffisance pondérale':bmi<25?'Poids normal':bmi<30?'Surpoids':'Obésité' : null

  /* ── Not logged in ── */
  if (!user) {
    return (
      <div className="p-4 pb-24">
        <h1 className="text-base font-semibold mb-6 flex items-center gap-2">
          <User size={16} className="text-gray-400"/>{t('account')}
        </h1>
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm mb-4">
          <div className="w-16 h-16 rounded-full bg-fi-green-light flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-fi-green"/>
          </div>
          <h2 className="text-sm font-semibold text-gray-800 mb-1">{t('notLoggedIn')}</h2>
          <p className="text-xs text-gray-400 mb-5 leading-relaxed max-w-xs mx-auto">{t('loginToAccess')}</p>
          <button onClick={() => setShowAuth(true)}
            className="bg-fi-green text-white text-sm px-8 py-2.5 rounded-xl font-semibold hover:bg-fi-green-dark transition-colors">
            {t('loginRegister')}
          </button>
        </div>
        {/* Read-only profile */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Profil local (lecture seule)</h2>
            <Lock size={14} className="text-gray-300"/>
          </div>
          <p className="text-xs text-gray-400 mb-3">Connectez-vous pour modifier.</p>
          <ProfileRows profile={userProfile} actLabels={actLabels} genderLabels={genderLabels} bmi={bmi} bmiLabel={bmiLabel}/>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)}/>}
      </div>
    )
  }

  /* ── Logged in ── */
  return (
    <div className="p-4 pb-24">
      <h1 className="text-base font-semibold mb-4 flex items-center gap-2">
        <User size={16} className="text-gray-400"/>{t('account')}
      </h1>

      {/* User card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm relative">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div onClick={() => setShowAvatarPick(v=>!v)} className="cursor-pointer"
              title="Changer l'avatar">
              {userProfile.avatarEmoji ? (
                <div className="w-14 h-14 rounded-full bg-fi-green-light border-2 border-fi-green flex items-center justify-center text-2xl select-none">
                  {userProfile.avatarEmoji}
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-fi-green-light flex items-center justify-center text-xl font-bold text-fi-green border-2 border-fi-green">
                  {(user.name||'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <button onClick={() => setShowAvatarPick(v=>!v)}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-fi-green text-white rounded-full text-xs flex items-center justify-center shadow-sm">
              ✏
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-900">{user.name || 'Utilisateur'}</div>
            <div className="text-sm text-gray-500 truncate">{user.email}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {user.provider && (
                <span className="text-xs bg-fi-blue-light text-fi-blue px-2 py-0.5 rounded-full">
                  via {user.provider}
                </span>
              )}
              {isAdmin() && (
                <span className="text-xs bg-fi-purple-light text-fi-purple px-2 py-0.5 rounded-full font-medium">Admin</span>
              )}
              {userProfile.gender && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{genderLabels[userProfile.gender]}</span>
              )}
            </div>
          </div>

          <button onClick={logout} className="p-2 text-gray-300 hover:text-fi-red transition-colors flex-shrink-0" title={t('logout')}>
            <LogOut size={16}/>
          </button>
        </div>

        {/* Avatar emoji picker */}
        {showAvatarPick && (
          <div className="absolute left-4 mt-2 bg-white border border-gray-200 rounded-2xl p-3 shadow-xl z-30 w-72" style={{ top: '100%' }}>
            <div className="text-xs font-semibold text-gray-600 mb-2">Choisir un avatar emoji</div>
            <div className="grid grid-cols-10 gap-1">
              {AVATAR_EMOJIS.map(e => (
                <button key={e} onClick={() => { setUserProfile({...userProfile, avatarEmoji:e}); setShowAvatarPick(false) }}
                  className={`text-xl hover:bg-fi-green-light rounded-lg p-1 transition-colors ${userProfile.avatarEmoji===e?'bg-fi-green-light ring-1 ring-fi-green':''}`}>
                  {e}
                </button>
              ))}
            </div>
            <button onClick={() => { setUserProfile({...userProfile,avatarEmoji:''}); setShowAvatarPick(false) }}
              className="mt-2 text-xs text-gray-400 hover:text-fi-green w-full text-center py-1">
              ↩ Supprimer l'emoji
            </button>
          </div>
        )}
      </div>
      {showAvatarPick && <div className="fixed inset-0 z-20" onClick={()=>setShowAvatarPick(false)}/>}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3">
          <Star size={18} className="text-amber-400 flex-shrink-0" fill="currentColor"/>
          <div><div className="text-xl font-bold">{favorites.length}</div><div className="text-xs text-gray-400">{t('favorites')}</div></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3">
          <Clock size={18} className="text-fi-blue flex-shrink-0"/>
          <div><div className="text-xl font-bold">{history.length}</div><div className="text-xs text-gray-400">{t('history')}</div></div>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">{t('myProfile')}</h2>
          <button onClick={() => setShowProfile(true)}
            className="flex items-center gap-1 text-xs text-fi-green hover:text-fi-green-dark transition-colors font-medium">
            <Edit2 size={11}/>{t('editProfile')}
          </button>
        </div>
        <ProfileRows profile={userProfile} actLabels={actLabels} genderLabels={genderLabels} bmi={bmi} bmiLabel={bmiLabel}/>
      </div>

      {showProfile && <ProfileModal onClose={()=>setShowProfile(false)}/>}
    </div>
  )
}

function ProfileRows({ profile, actLabels, genderLabels, bmi, bmiLabel }) {
  const rows = [
    { label:'Sexe',      val: genderLabels[profile.gender] || '—' },
    { label:'Âge',       val: profile.age    ? `${profile.age} ans`    : '—' },
    { label:'Poids',     val: profile.weight ? `${profile.weight} kg`  : '—' },
    { label:'Taille',    val: profile.height ? `${profile.height} cm`  : '—' },
    { label:'IMC',       val: bmi            ? `${bmi} — ${bmiLabel}`  : '—' },
    { label:'Activité',  val: actLabels[profile.activity] || '—' },
  ]
  return (
    <div className="divide-y divide-gray-50">
      {rows.map(r => (
        <div key={r.label} className="flex justify-between py-1.5 text-sm">
          <span className="text-gray-400">{r.label}</span>
          <span className="text-gray-700 font-medium">{r.val}</span>
        </div>
      ))}
    </div>
  )
}
