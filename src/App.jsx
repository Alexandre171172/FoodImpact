import React, { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useKonamiCode } from './hooks/useDebounce'
import { useApp } from './context/AppContext'
import Header from './components/Header'
import Navigation from './components/Navigation'
import Notifications from './components/Notifications'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import FavoritesPage from './pages/FavoritesPage'
import HistoryPage from './pages/HistoryPage'
import AccountPage from './pages/AccountPage'
import LegalPage from './pages/LegalPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AdminPanel from './modals/AdminPanel'

export default function App() {
  const { isAdmin } = useApp()
  const [page,       setPage]       = useState('home')
  const [showAdmin,  setShowAdmin]  = useState(false)
  // Product detail overlay — null means no overlay
  const [detailProduct, setDetailProduct] = useState(null)

  // Konami code → admin panel
  useKonamiCode(useCallback(() => setShowAdmin(true), []))

  const handleSelectProduct = useCallback((product) => {
    setDetailProduct(product)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setDetailProduct(null)
  }, [])

  const handleNavigate = useCallback((target) => {
    setPage(target)
    setDetailProduct(null)
  }, [])

  const renderPage = () => {
    switch (page) {
      case 'home':      return <HomePage     onNavigate={handleNavigate} onSelectProduct={handleSelectProduct} />
      case 'search':    return <SearchPage   onSelectProduct={handleSelectProduct} />
      case 'favorites': return <FavoritesPage onSelectProduct={handleSelectProduct} />
      case 'history':   return <HistoryPage  onSelectProduct={handleSelectProduct} />
      case 'account':   return <AccountPage  />
      case 'legal':     return <LegalPage    />
      default:          return <HomePage     onNavigate={handleNavigate} onSelectProduct={handleSelectProduct} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-2xl mx-auto relative">
      <Header />

      {/* Main content area */}
      <main className="flex-1 overflow-hidden relative">
        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="h-full overflow-y-auto"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>

        {/* Product detail overlay — slides up over current page */}
        <AnimatePresence>
          {detailProduct && (
            <motion.div
              key="detail"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-0 bg-gray-50 z-30 flex flex-col"
              style={{ height: '100vh' }}
            >
              <ProductDetailPage
                product={detailProduct}
                onBack={handleCloseDetail}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navigation current={page} onChange={handleNavigate} />
      <Notifications />

      <AnimatePresence>
        {showAdmin && <AdminPanel key="admin" onClose={() => setShowAdmin(false)} />}
      </AnimatePresence>
    </div>
  )
}
