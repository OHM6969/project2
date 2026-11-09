import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '../hooks/useToast'

export default function ThankYou() {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const state = location.state

  useEffect(() => {
    if (!state) navigate('/')
  }, [state, navigate])

  if (!state) return null

  const { responseCode, name, surveyTitle } = state

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(responseCode)
      toast.success('Response code copied!')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = responseCode
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast.success('Response code copied!')
    }
  }

  const sendWhatsApp = () => {
    const message = encodeURIComponent(
      `Here's my response for "${surveyTitle}":\n\n${responseCode}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-cream dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md text-center"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6"
        >
          <motion.svg
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-10 h-10 text-emerald-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-2xl font-bold mb-2">Thank you, {name}!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Your response to "{surveyTitle}" has been recorded.
          </p>
        </motion.div>

        {/* Response Code */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6 text-left mb-6"
        >
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
            Your Response Code
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            Copy this code and send it to the survey creator.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto">
            <p className="text-xs text-gray-600 dark:text-gray-300 break-all font-mono leading-relaxed">
              {responseCode}
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={copyCode} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            <button onClick={sendWhatsApp} className="btn-secondary flex-1 text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => navigate('/')}
          className="btn-ghost text-sm"
        >
          Go to Pulse Home
        </motion.button>
      </motion.div>
    </div>
  )
}
