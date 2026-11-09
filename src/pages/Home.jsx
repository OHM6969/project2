import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { decode } from '../utils/encoding'
import { useToast } from '../hooks/useToast'

export default function Home() {
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [phone, setPhone] = useState('')
  const [surveyCode, setSurveyCode] = useState('')
  const [errors, setErrors] = useState({})

  // Pre-load saved user info if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pulse_user_info')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.name) setName(parsed.name)
        if (parsed.age) setAge(parsed.age)
        if (parsed.phone) setPhone(parsed.phone)
      }
    } catch {}
  }, [])

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Full name is required'

    const ageNum = parseInt(age, 10)
    if (!age || isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
      errs.age = 'Age must be between 5 and 100'
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.phone = 'Enter a valid 10-digit phone number'
    }

    if (!surveyCode.trim()) {
      errs.surveyCode = 'Survey code or link is required'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleStartSurvey = (e) => {
    e.preventDefault()
    if (!validate()) return

    const input = surveyCode.trim()
    let hash = input
    if (input.includes('/s#')) {
      hash = input.split('/s#')[1]
    } else if (input.includes('#')) {
      hash = input.split('#').pop()
    }

    const data = decode(hash)
    if (!data || !data.title || !data.questions) {
      toast.error('Invalid survey code or link. Please verify and retry.')
      return
    }

    const userInfo = {
      name: name.trim(),
      age: parseInt(age, 10),
      phone: phone.replace(/\D/g, '')
    }

    // Persist user info
    localStorage.setItem('pulse_user_info', JSON.stringify(userInfo))

    // Navigate to survey with info pre-loaded
    navigate(`/s#${hash}`, { state: { info: userInfo } })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-500/20"
          >
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M6 15Q8 6 12 4Q16 6 18 15" />
              <circle cx="12" cy="17" r="2" fill="currentColor" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Pulse</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
            A preference survey tool where there are no right or wrong answers.
          </p>
        </div>

        {/* Main Card: Respondent Intake */}
        <div className="card p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleStartSurvey} className="space-y-4">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
              <h2 className="text-base font-semibold text-charcoal dark:text-gray-100">
                Join a Survey
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Fill in your details and enter the survey code to begin.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className={`input-field text-sm ${errors.name ? 'border-red-300 dark:border-red-600 focus:ring-red-400' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Age & Phone Number row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Age (5–100) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 21"
                  className={`input-field text-sm ${errors.age ? 'border-red-300 dark:border-red-600 focus:ring-red-400' : ''}`}
                />
                {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  className={`input-field text-sm ${errors.phone ? 'border-red-300 dark:border-red-600 focus:ring-red-400' : ''}`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Survey Code or Link */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Survey Code or Link <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={surveyCode}
                onChange={(e) => setSurveyCode(e.target.value)}
                placeholder="Paste survey link or code here…"
                className={`input-field text-sm font-mono ${errors.surveyCode ? 'border-red-300 dark:border-red-600 focus:ring-red-400' : ''}`}
              />
              {errors.surveyCode && <p className="text-xs text-red-500 mt-1">{errors.surveyCode}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full text-center flex items-center justify-center gap-2 pt-3 pb-3 mt-4"
            >
              <span>Start Survey</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Create Survey Alternative */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Want to conduct your own survey?
            </p>
            <Link
              to="/create"
              className="btn-secondary w-full text-center flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create a New Survey</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Everything runs locally in your browser. No server storage or account required.
        </p>
      </motion.div>
    </div>
  )
}
