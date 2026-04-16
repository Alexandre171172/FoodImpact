import React, { useState } from 'react'
import { useLang, LANGUAGES } from '../context/LanguageContext'
import { Globe } from 'lucide-react'

export default function Header() {
  const { lang, changeLang } = useLang()
  const [showLang, setShowLang] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-xl select-none">🥗</span>
        <span className="text-base font-semibold text-fi-green">FoodImpact</span>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowLang(v => !v)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
        >
          <span>{LANGUAGES[lang]?.flag}</span>
          <Globe size={12} className="text-gray-400" />
        </button>
        {showLang && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowLang(false)} />
            <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-38 z-50">
              {Object.entries(LANGUAGES).map(([code, { flag, label }]) => (
                <button key={code} onClick={() => { changeLang(code); setShowLang(false) }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${lang===code?'font-medium text-fi-green':'text-gray-600'}`}>
                  <span>{flag}</span><span>{label}</span>
                  {lang===code && <span className="ml-auto text-fi-green text-xs">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
