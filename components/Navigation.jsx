import React from 'react'
import { Home, Search, Star, Clock, User } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const TABS = [
  { id: 'home',      Icon: Home,   labelKey: 'Accueil'    },
  { id: 'search',    Icon: Search, labelKey: 'search'     },
  { id: 'favorites', Icon: Star,   labelKey: 'favorites'  },
  { id: 'history',   Icon: Clock,  labelKey: 'history'    },
  { id: 'account',   Icon: User,   labelKey: 'account'    },
]

export default function Navigation({ current, onChange }) {
  const { t } = useLang()
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-40 safe-area-inset-bottom">
      {TABS.map(({ id, Icon, labelKey }) => {
        const active = current === id
        return (
          <button key={id} onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${active ? 'text-fi-green' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} fill={active && id==='favorites' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-medium">{t(labelKey)}</span>
          </button>
        )
      })}
    </nav>
  )
}
