import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import { useToast } from '../hooks/useToast'

export default function Published() {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const state = location.state

  useEffect(() => {
    if (!state) navigate('/')
  }, [state, navigate])

  if (!state) return null

  const { surveyUrl, adminUrl, title, questionCount, code } = state

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied!`)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast.success(`${label} copied!`)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
        >
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Survey Published!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          "{title}" · {questionCount} questions
        </p>
      </motion.div>

      {/* 6-Digit Survey Code */}
      {code && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="card p-6 mb-4 text-center border-2 border-accent-200 dark:border-accent-800/60 bg-gradient-to-b from-accent-50/50 to-transparent dark:from-accent-950/20"
        >
          <span className="text-xs font-semibold text-accent-700 dark:text-accent-300 uppercase tracking-wider block mb-1">
            6-Digit Survey Code
          </span>
          <p className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-charcoal dark:text-white my-2 select-all">
            {code}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Respondents can enter this 6-digit code on the home page or click &ldquo;Add Code&rdquo; to view questions.
          </p>
          <button
            onClick={() => copyToClipboard(code, '6-digit code')}
            className="btn-secondary w-full text-sm font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy 6-Digit Code
          </button>
        </motion.div>
      )}

      {/* Student Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 mb-4"
      >
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
          Share with respondents
        </label>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-3">
          <p className="text-xs text-gray-600 dark:text-gray-300 break-all font-mono leading-relaxed">
            {surveyUrl.length > 120 ? surveyUrl.substring(0, 120) + '…' : surveyUrl}
          </p>
        </div>
        <button
          onClick={() => copyToClipboard(surveyUrl, 'Survey link')}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Survey Link
        </button>

        {/* QR Code */}
        <div className="mt-6 flex justify-center">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <QRCodeSVG
              value={surveyUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#2D2D2D"
              level="M"
              includeMargin={false}
            />
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
          Scan to open the survey on any device
        </p>
      </motion.div>

      {/* Admin Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card p-6 mb-6"
      >
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
          Your private admin link
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Bookmark this link to view responses later. Don't share it publicly.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-3">
          <p className="text-xs text-gray-600 dark:text-gray-300 break-all font-mono leading-relaxed">
            {adminUrl.length > 120 ? adminUrl.substring(0, 120) + '…' : adminUrl}
          </p>
        </div>
        <button
          onClick={() => copyToClipboard(adminUrl, 'Admin link')}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Admin Link
        </button>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/my-surveys" className="btn-secondary text-center flex-1">
          My Surveys
        </Link>
        <Link to="/create" className="btn-ghost text-center flex-1">
          Create Another
        </Link>
      </div>
    </div>
  )
}
