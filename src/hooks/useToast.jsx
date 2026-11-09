import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext()

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const toast = useCallback((message) => addToast(message, 'success'), [addToast])
  toast.success = (message) => addToast(message, 'success')
  toast.error = (message) => addToast(message, 'error')
  toast.info = (message) => addToast(message, 'info')

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium backdrop-blur-sm max-w-xs ${
                t.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700'
                  : t.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/80 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                  : 'bg-accent-50 dark:bg-accent-900/80 text-accent-800 dark:text-accent-200 border border-accent-200 dark:border-accent-700'
              }`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
