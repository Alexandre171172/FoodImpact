import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, User } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function ProfileModal({ onClose }) {
  const { userProfile, setUserProfile, addNotification } = useApp()
  const [local, setLocal] = useState({ ...userProfile })

  const save = () => {
    setUserProfile(local)
    addNotification('Profil mis à jour !', 'success')
    onClose()
  }

  const bmi = local.weight && local.height
    ? Math.round((local.weight / ((local.height / 100) ** 2)) * 10) / 10
    : null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <User size={15} className="text-fi-green" />
            <h2 className="text-sm font-semibold">Profil de simulation santé</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh] space-y-4">
          <p className="text-xs text-gray-400">Ces données restent sur votre appareil et servent uniquement aux simulations.</p>

          {/* Gender */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Genre</label>
            <div className="flex gap-2">
              {[['homme','Homme','👨'], ['femme','Femme','👩'], ['autre','Autre','🧑']].map(([v, l, e]) => (
                <button key={v} onClick={() => setLocal({ ...local, gender: v })}
                  className={`flex-1 py-2.5 text-sm rounded-xl border transition-colors ${
                    local.gender === v
                      ? 'bg-fi-green text-white border-fi-green font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}>
                  {e} {l}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric fields */}
          {[
            { key: 'age',    label: 'Âge (ans)',   min: 10,  max: 100 },
            { key: 'weight', label: 'Poids (kg)',  min: 20,  max: 250 },
            { key: 'height', label: 'Taille (cm)', min: 100, max: 230 },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
              <input
                type="number" value={local[f.key]} min={f.min} max={f.max}
                onChange={e => setLocal({ ...local, [f.key]: +e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-fi-green focus:ring-2 focus:ring-fi-green/10"
              />
            </div>
          ))}

          {/* Activity */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Niveau d'activité physique</label>
            <select
              value={local.activity}
              onChange={e => setLocal({ ...local, activity: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-fi-green bg-white"
            >
              <option value="sedentaire">Sédentaire (bureau, peu de marche)</option>
              <option value="leger">Légèrement actif (marche quotidienne)</option>
              <option value="modere">Modérément actif (sport 3-4×/semaine)</option>
              <option value="actif">Très actif (sport intensif quotidien)</option>
            </select>
          </div>

          {/* BMI preview */}
          {bmi && (
            <div className="bg-fi-green-light rounded-xl p-3">
              <div className="text-xs text-fi-green-dark">
                IMC actuel : <strong>{bmi}</strong> —{' '}
                {bmi < 18.5 ? 'Insuffisance pondérale'
                  : bmi < 25 ? 'Poids normal'
                  : bmi < 30 ? 'Surpoids'
                  : 'Obésité'}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 py-3 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            Annuler
          </button>
          <button onClick={save}
            className="flex-1 py-3 text-sm bg-fi-green text-white rounded-xl hover:bg-fi-green-dark transition-colors font-semibold">
            Enregistrer
          </button>
        </div>
      </motion.div>
    </div>
  )
}
