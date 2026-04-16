import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { CheckCircle, Info, AlertCircle } from 'lucide-react'

const icons = { success: CheckCircle, info: Info, warning: AlertCircle, error: AlertCircle }
const colors = {
  success: 'bg-fi-green-light text-fi-green-dark border-fi-green/30',
  info:    'bg-fi-blue-light text-fi-blue border-fi-blue/30',
  warning: 'bg-fi-amber-light text-fi-amber border-fi-amber/30',
  error:   'bg-fi-red-light text-fi-red border-fi-red/30',
}

export default function Notifications() {
  const { notifications } = useApp()
  return (
    <div className="fixed top-16 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map(n => {
          const Icon = icons[n.type] || Info
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm shadow-sm ${colors[n.type] || colors.info}`}
              style={{ maxWidth: 280 }}
            >
              <Icon size={15} />
              {n.message}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
