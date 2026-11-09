import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getHashData, encodeResponse } from '../utils/encoding'
import { hasSubmitted, markSubmitted, hashString } from '../utils/storage'
import OptionCard from '../components/OptionCard'
import ProgressBar from '../components/ProgressBar'
import { useToast } from '../hooks/useToast'

function InfoForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})

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
    if (!age || isNaN(ageNum) || ageNum < 5 || ageNum > 100) errs.age = 'Enter a valid age (5-100)'
    const cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length !== 10) errs.phone = 'Enter a 10-digit phone number'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      const userInfo = { name: name.trim(), age: parseInt(age, 10), phone: phone.replace(/\D/g, '') }
      localStorage.setItem('pulse_user_info', JSON.stringify(userInfo))
      onSubmit(userInfo)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <h2 className="text-lg font-semibold mb-1">Before we start</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Tell us a little about yourself</p>

      <div>
        <label className="block text-sm font-medium mb-1.5">Full Name <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className={`input-field ${errors.name ? 'border-red-300 dark:border-red-600 focus:ring-red-400' : ''}`}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Age <span className="text-red-400">*</span></label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Your age"
          min="5"
          max="100"
          className={`input-field ${errors.age ? 'border-red-300 dark:border-red-600 focus:ring-red-400' : ''}`}
        />
        {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Phone Number <span className="text-red-400">*</span></label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10-digit phone number"
          className={`input-field ${errors.phone ? 'border-red-300 dark:border-red-600 focus:ring-red-400' : ''}`}
        />
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>

      <button type="submit" className="btn-primary w-full">
        Start Survey →
      </button>
    </motion.form>
  )
}

export default function Survey() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [survey, setSurvey] = useState(null)
  const [error, setError] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [info, setInfo] = useState(() => {
    if (location.state?.info) return location.state.info
    try {
      const saved = localStorage.getItem('pulse_user_info')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.name && parsed.age && parsed.phone) return parsed
      }
    } catch {}
    return null
  })
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [direction, setDirection] = useState(1) // 1=forward, -1=backward

  const surveyHash = useMemo(() => {
    if (!survey) return ''
    return hashString(JSON.stringify(survey))
  }, [survey])

  useEffect(() => {
    const data = getHashData()
    if (!data || !data.title || !data.questions) {
      setError(true)
      return
    }
    setSurvey(data)
    const hash = hashString(JSON.stringify(data))
    if (hasSubmitted(hash)) {
      setAlreadySubmitted(true)
    }
  }, [location.hash])

  const selectOption = (questionId, option) => {
    const q = survey.questions.find(q => q.id === questionId)
    if (!q) return

    setAnswers(prev => {
      const current = prev[questionId] || []
      if (q.multiple) {
        if (current.includes(option)) {
          return { ...prev, [questionId]: current.filter(o => o !== option) }
        } else {
          return { ...prev, [questionId]: [...current, option] }
        }
      } else {
        return { ...prev, [questionId]: [option] }
      }
    })
  }

  const goNext = () => {
    if (currentQ < survey.questions.length - 1) {
      setDirection(1)
      setCurrentQ(currentQ + 1)
    }
  }

  const goBack = () => {
    if (currentQ > 0) {
      setDirection(-1)
      setCurrentQ(currentQ - 1)
    }
  }

  // Keyboard navigation for respondent flow
  useEffect(() => {
    if (!info || !survey || error || alreadySubmitted) return

    const handleKeyDown = (e) => {
      // Don't trigger if target is an input field
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      const curr = survey.questions[currentQ]
      if (!curr) return

      // Number keys 1-6 or letters A-F to select options
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= curr.options.length) {
        selectOption(curr.id, curr.options[num - 1])
        return
      }

      // Enter key for Next or Submit
      if (e.key === 'Enter') {
        const hasAns = answers[curr.id]?.length > 0
        if (hasAns) {
          if (currentQ === survey.questions.length - 1) {
            handleSubmit()
          } else {
            goNext()
          }
        }
        return
      }

      // ArrowLeft for Back
      if (e.key === 'ArrowLeft') {
        goBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [info, survey, currentQ, answers, error, alreadySubmitted])

  const handleSubmit = () => {
    // Check all questions answered
    const unanswered = survey.questions.filter(q => !(answers[q.id]?.length > 0))
    if (unanswered.length > 0) {
      toast.error('Please answer all questions before submitting')
      // Go to first unanswered
      const idx = survey.questions.findIndex(q => !(answers[q.id]?.length > 0))
      setDirection(idx > currentQ ? 1 : -1)
      setCurrentQ(idx)
      return
    }

    const response = {
      name: info.name,
      age: info.age,
      phone: info.phone,
      answers: survey.questions.map(q => ({
        questionId: q.id,
        question: q.text,
        selected: answers[q.id] || []
      })),
      submittedAt: Date.now()
    }

    const responseCode = encodeResponse(response)
    markSubmitted(surveyHash)

    navigate('/thank-you', {
      state: {
        responseCode,
        name: info.name,
        surveyTitle: survey.title
      }
    })
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Invalid Survey</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This survey link appears to be broken or expired.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
        </div>
      </div>
    )
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Already Submitted</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">You've already responded to this survey on this device.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-300 border-t-accent-600 rounded-full animate-spin" />
      </div>
    )
  }

  const currentQuestion = survey.questions[currentQ]
  const isLastQuestion = currentQ === survey.questions.length - 1
  const hasAnswer = answers[currentQuestion?.id]?.length > 0

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-950">
      {/* Minimal header */}
      <div className="border-b border-gray-100 dark:border-gray-800 bg-cream/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" d="M6 15Q8 6 12 4Q16 6 18 15" />
                <circle cx="12" cy="17" r="2" fill="currentColor" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm truncate">{survey.title}</h1>
              {survey.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{survey.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {!info ? (
          <div className="card p-6 sm:p-8">
            <InfoForm onSubmit={setInfo} />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <ProgressBar current={currentQ + 1} total={survey.questions.length} />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQ}
                custom={direction}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="card p-6 sm:p-8"
              >
                <p className="text-lg font-semibold mb-1">{currentQuestion.text}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                  {currentQuestion.multiple ? 'Select all that apply' : 'Select one option'}
                </p>

                <div className="space-y-3">
                  {currentQuestion.options.map((opt, idx) => (
                    <OptionCard
                      key={idx}
                      label={opt}
                      selected={(answers[currentQuestion.id] || []).includes(opt)}
                      onClick={() => selectOption(currentQuestion.id, opt)}
                      multi={currentQuestion.multiple}
                      index={idx}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={goBack}
                disabled={currentQ === 0}
                className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Back
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  className="btn-primary"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!hasAnswer}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
