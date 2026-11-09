import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import { encode, decode } from '../utils/encoding'
import { getSurveyByCode, saveSurveyByCode } from '../utils/storage'
import { useToast } from '../hooks/useToast'

function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { dark, toggleTheme } = useTheme()
  const toast = useToast()
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [modalCode, setModalCode] = useState('')

  const showNav = !location.pathname.startsWith('/s') && !location.pathname.startsWith('/thank-you')

  const handleModalJoin = (e) => {
    e.preventDefault()
    const input = modalCode.trim()
    if (!input) return

    // 1. Check if 6-digit code or cached code
    let surveyData = getSurveyByCode(input)

    // 2. Try decoding as full link or hash
    if (!surveyData) {
      let hash = input
      if (input.includes('/s#')) {
        hash = input.split('/s#')[1]
      } else if (input.includes('#')) {
        hash = input.split('#').pop()
      }
      const decoded = decode(hash)
      if (decoded && decoded.questions) {
        surveyData = decoded
        if (surveyData.code) {
          saveSurveyByCode(surveyData.code, surveyData)
        }
      }
    }

    if (surveyData && surveyData.questions) {
      setShowCodeModal(false)
      setModalCode('')
      const encoded = encode(surveyData)
      navigate(`/s#data=${encoded}&code=${surveyData.code || input}`, {
        state: { surveyData }
      })
    } else {
      toast.error(`Survey "${input}" not found. Try demo code 101010 or paste full link.`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showNav && (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-cream/90 dark:bg-gray-950/90 border-b border-gray-100 dark:border-gray-800">
          <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" d="M6 15Q8 6 12 4Q16 6 18 15" />
                  <circle cx="12" cy="17" r="2" fill="currentColor" />
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-tight">Pulse</span>
            </Link>

            {/* Top Right Corner Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Add Code button */}
              <button
                type="button"
                onClick={() => setShowCodeModal(true)}
                className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4 flex items-center gap-1.5 font-medium"
                title="Enter or paste survey code"
              >
                <svg className="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Add Code</span>
              </button>

              {/* New Survey button */}
              <Link
                to="/create"
                className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 flex items-center gap-1.5 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Survey</span>
              </Link>

              {/* My Surveys */}
              <Link to="/my-surveys" className="btn-ghost text-xs sm:text-sm hidden md:inline-flex">
                My Surveys
              </Link>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {dark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </nav>
        </header>
      )}

      {/* Add Code Modal */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Join with Survey Code</h3>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleModalJoin} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium block mb-1.5">
                    Paste survey link or code:
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={modalCode}
                    onChange={(e) => setModalCode(e.target.value)}
                    placeholder="e.g. /s#eJw... or code"
                    className="input-field text-sm font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCodeModal(false)}
                    className="btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!modalCode.trim()}
                    className="btn-primary text-sm disabled:opacity-40"
                  >
                    Open Survey →
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.hash}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
